import Papa from "papaparse";
// @ts-ignore Shared deterministic parsing modules.
import { parsePortfolioText } from "../../lib/portfolioParser.js";
// @ts-ignore Shared deterministic broker profile module.
import { detectBroker, normalizeBrokerRows } from "../../lib/brokerProfiles.js";
import type { AnalysisWarning, Confidence, PortfolioSource } from "@/types/portfolio";

export const FILE_LIMITS = {
  maxFiles: 5,
  maxBytes: 10 * 1024 * 1024,
  maxPdfPages: 5,
  maxOcrPdfPages: 3,
};

export const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/webp,application/pdf,text/csv,.csv,.txt";

export type DraftHolding = {
  id: string;
  ticker: string;
  symbol?: string;
  name: string;
  shares: number | null;
  marketValue: number | null;
  costBasis?: number | null;
  percent: number | null;
  weight?: number | null;
  category: string;
  assetClass?: string;
  confidence: Confidence;
  sourceRef?: string;
  warnings?: AnalysisWarning[];
};

export type ParseResult = {
  holdings: DraftHolding[];
  warnings: AnalysisWarning[];
  source: PortfolioSource;
  brokerMessage: string;
};

function createId() {
  return globalThis.crypto?.randomUUID?.() || `holding-${Date.now()}-${Math.random()}`;
}

function warning(code: string, message: string, action: string): AnalysisWarning {
  return { code, message, action, severity: "warning" };
}

function parsedTextHoldings(text: string, sourceRef: string): DraftHolding[] {
  return parsePortfolioText(text).holdings.map((holding: DraftHolding) => ({
    ...holding,
    id: createId(),
    symbol: holding.ticker,
    assetClass: holding.category === "Other" ? "Needs review" : holding.category,
    category: holding.category === "Other" ? "Needs review" : holding.category,
    sourceRef,
    warnings: holding.category === "Other"
      ? [warning("unknown-classification", `${holding.ticker || holding.name} needs a confirmed category.`, "Choose a category in Review holdings.")]
      : [],
  }));
}

function sourceMetadata(kind: PortfolioSource["kind"], file: File, detection: ReturnType<typeof detectBroker>): PortfolioSource {
  return {
    kind,
    broker: detection.label,
    brokerConfidence: detection.confidence,
    fileCount: 1,
    label: `${detection.label} ${kind.toUpperCase()} import`,
  };
}

async function parseCsv(file: File): Promise<ParseResult> {
  const text = await file.text();
  if (!text.trim()) throw new Error(`${file.name} is empty. Export it again or add holdings manually.`);
  const headerPreview = Papa.parse<string[]>(text, { preview: 1 }).data[0] || [];
  const detection = detectBroker({ text: text.slice(0, 5000), fileName: file.name, headers: headerPreview });
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });
  const holdings = normalizeBrokerRows(parsed.data, detection, `${detection.label} CSV`);
  const warnings: AnalysisWarning[] = parsed.errors.map(() =>
    warning("csv-row-error", "Some CSV rows could not be read.", "Review every imported row before continuing."),
  );
  if (!holdings.length) throw new Error("No usable positions were found in this CSV. Check the columns or add holdings manually.");
  return {
    holdings,
    warnings,
    source: sourceMetadata("csv", file, detection),
    brokerMessage: detection.message,
  };
}

async function ocrImage(source: File | Blob) {
  const Tesseract = (await import("tesseract.js")).default;
  const result = await Tesseract.recognize(source, "eng");
  return result.data.text || "";
}

async function parsePdf(file: File): Promise<ParseResult> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("password")) {
      throw new Error("This PDF is password-protected. Export an unlocked copy and try again.");
    }
    throw new Error("This PDF could not be read. Try a CSV export, screenshots, or an unlocked PDF.");
  }
  const pageLimit = Math.min(pdf.numPages, FILE_LIMITS.maxPdfPages);
  let text = "";
  for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += ` ${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}`;
  }

  const warnings: AnalysisWarning[] = [];
  if (pdf.numPages > pageLimit) {
    warnings.push(warning("pdf-page-limit", `Only the first ${pageLimit} PDF pages were processed.`, "Confirm that all positions are present."));
  }
  if (text.replace(/\s/g, "").length < 40) {
    text = "";
    const ocrLimit = Math.min(pdf.numPages, FILE_LIMITS.maxOcrPdfPages);
    warnings.push(warning("scanned-pdf-ocr", `This appears to be a scanned PDF. OCR was limited to ${ocrLimit} pages.`, "Review every detected row."));
    for (let pageNumber = 1; pageNumber <= ocrLimit; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      if (!context) continue;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) text += ` ${await ocrImage(blob)}`;
    }
  }
  if (!text.trim()) throw new Error("No readable text or positions were found in this PDF.");
  const detection = detectBroker({ text, fileName: file.name });
  const holdings = parsedTextHoldings(text, `${detection.label} PDF`);
  if (!holdings.length) throw new Error("No usable positions were found in this PDF. Try screenshots, CSV, or manual entry.");
  return {
    holdings,
    warnings,
    source: sourceMetadata("pdf", file, detection),
    brokerMessage: detection.message,
  };
}

export async function parsePortfolioFile(file: File): Promise<ParseResult> {
  if (file.size > FILE_LIMITS.maxBytes) {
    throw new Error(`${file.name} is larger than the 10 MB in-browser limit.`);
  }
  if (file.size === 0) throw new Error(`${file.name} is empty.`);
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp"].includes(extension || "")) {
    const text = await ocrImage(file);
    if (!text.trim()) throw new Error("No readable text was found in this image. Try a clearer screenshot.");
    const detection = detectBroker({ text, fileName: file.name });
    const holdings = parsedTextHoldings(text, `${detection.label} screenshot`);
    if (!holdings.length) throw new Error("No usable positions were found in this image. Add holdings manually or try a clearer screenshot.");
    return {
      holdings,
      warnings: [warning("ocr-review", "Image text was read with OCR and may be uncertain.", "Review every detected row.")],
      source: sourceMetadata("image", file, detection),
      brokerMessage: detection.message,
    };
  }
  if (extension === "pdf" || file.type === "application/pdf") return parsePdf(file);
  if (extension === "csv" || file.type === "text/csv") return parseCsv(file);
  if (extension === "txt" || file.type === "text/plain") {
    const text = await file.text();
    if (!text.trim()) throw new Error(`${file.name} is empty.`);
    const detection = detectBroker({ text, fileName: file.name });
    const holdings = parsedTextHoldings(text, `${detection.label} text import`);
    if (!holdings.length) throw new Error("No usable positions were found in this text file.");
    return {
      holdings,
      warnings: [],
      source: sourceMetadata("txt", file, detection),
      brokerMessage: detection.message,
    };
  }
  throw new Error(`${file.name} is not a supported PNG, JPG, WEBP, PDF, CSV, or TXT file.`);
}

export function mergeHoldings(holdings: DraftHolding[]) {
  const seen = new Map<string, DraftHolding>();
  for (const holding of holdings) {
    const key = holding.ticker || holding.name.toLowerCase() || holding.id;
    if (!seen.has(key)) seen.set(key, holding);
  }
  return [...seen.values()];
}
