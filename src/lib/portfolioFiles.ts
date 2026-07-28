import Papa from "papaparse";
// @ts-ignore The shared parser is intentionally browser/server compatible JavaScript.
import { inferCategory, parsePortfolioText } from "../../lib/portfolioParser.js";

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
  name: string;
  shares: number | null;
  marketValue: number | null;
  percent: number | null;
  category: string;
  confidence: "high" | "medium" | "low";
};

type ParseResult = {
  holdings: DraftHolding[];
  warnings: string[];
  sourceText: string;
};

const HEADER_ALIASES = {
  ticker: ["symbol", "ticker"],
  name: ["description", "name", "security"],
  shares: ["quantity", "shares", "qty"],
  price: ["price", "last price"],
  marketValue: ["market value", "value", "current value"],
  percent: ["allocation", "percent", "percentage", "weight"],
};

function valueFor(row: Record<string, unknown>, aliases: string[]) {
  const key = Object.keys(row).find((candidate) =>
    aliases.includes(candidate.trim().toLowerCase()),
  );
  return key ? row[key] : undefined;
}

function numeric(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const result = Number(String(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(result) && result >= 0 ? result : null;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `holding-${Date.now()}-${Math.random()}`;
}

function parsedTextHoldings(text: string): DraftHolding[] {
  return parsePortfolioText(text).holdings.map((holding: DraftHolding) => ({
    ...holding,
    id: createId(),
  }));
}

async function parseCsv(file: File): Promise<ParseResult> {
  const text = await file.text();
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
  const holdings = parsed.data.flatMap((row) => {
    const ticker = String(valueFor(row, HEADER_ALIASES.ticker) || "").trim().toUpperCase();
    const name = String(valueFor(row, HEADER_ALIASES.name) || "").trim();
    const shares = numeric(valueFor(row, HEADER_ALIASES.shares));
    const price = numeric(valueFor(row, HEADER_ALIASES.price));
    const suppliedValue = numeric(valueFor(row, HEADER_ALIASES.marketValue));
    const marketValue = suppliedValue ?? (shares !== null && price !== null ? shares * price : null);
    const percent = numeric(valueFor(row, HEADER_ALIASES.percent));
    if ((!ticker && !name) || (marketValue === null && percent === null)) return [];
    return [{
      id: createId(),
      ticker,
      name,
      shares,
      marketValue,
      percent,
      category: inferCategory(ticker, name),
      confidence: "high" as const,
    }];
  });
  const warnings = parsed.errors.length
    ? ["Some CSV rows could not be read. Review every imported row before continuing."]
    : [];
  return { holdings, warnings, sourceText: text };
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
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pageLimit = Math.min(pdf.numPages, FILE_LIMITS.maxPdfPages);
  let text = "";
  for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += ` ${content.items.map((item) => ("str" in item ? item.str : "")).join(" ")}`;
  }

  const warnings: string[] = [];
  if (pdf.numPages > pageLimit) {
    warnings.push(`Only the first ${pageLimit} PDF pages were processed in your browser.`);
  }
  if (text.replace(/\s/g, "").length < 40) {
    text = "";
    const ocrLimit = Math.min(pdf.numPages, FILE_LIMITS.maxOcrPdfPages);
    warnings.push(`This appears to be a scanned PDF. OCR was limited to the first ${ocrLimit} pages.`);
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
  return { holdings: parsedTextHoldings(text), warnings, sourceText: text };
}

export async function parsePortfolioFile(file: File): Promise<ParseResult> {
  if (file.size > FILE_LIMITS.maxBytes) {
    throw new Error(`${file.name} is larger than the 10 MB in-browser limit.`);
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp"].includes(extension || "")) {
    const text = await ocrImage(file);
    return {
      holdings: parsedTextHoldings(text),
      warnings: text.trim() ? [] : ["No readable holdings were found in the image."],
      sourceText: text,
    };
  }
  if (extension === "pdf" || file.type === "application/pdf") return parsePdf(file);
  if (extension === "csv" || file.type === "text/csv") return parseCsv(file);
  if (extension === "txt" || file.type === "text/plain") {
    const text = await file.text();
    return { holdings: parsedTextHoldings(text), warnings: [], sourceText: text };
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
