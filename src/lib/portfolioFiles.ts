import Papa from "papaparse";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
// @ts-ignore Shared deterministic parsing modules.
import { parsePortfolioText } from "../../lib/portfolioParser.js";
// @ts-ignore Shared deterministic broker profile module.
import { detectBroker, normalizeBrokerRows } from "../../lib/brokerProfiles.js";
// @ts-ignore Shared browser-compatibility guards.
import { classifyOcrWorkerFailure, formatPortfolioImportError, importError, normalizePortfolioImportError, validatePdfModule, validateTesseractModule } from "../../lib/importCompatibility.js";
import type { AnalysisWarning, Confidence, PortfolioSource } from "@/types/portfolio";

export const FILE_LIMITS = {
  maxFiles: 5,
  maxBytes: 10 * 1024 * 1024,
  maxPdfPages: 5,
  maxOcrPdfPages: 3,
};

export const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/webp,application/pdf,text/csv,.csv,.txt";

export type FieldConfidence = Partial<Record<
  "ticker" | "name" | "shares" | "marketValue" | "percent",
  Confidence
>>;

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
  fieldConfidence?: FieldConfidence;
  sourceRef?: string;
  warnings?: AnalysisWarning[];
};

export type ImportProgress = {
  status: string;
  progress: number;
};

export type ParseOptions = {
  onProgress?: (progress: ImportProgress) => void;
};

export type ParseResult = {
  holdings: DraftHolding[];
  warnings: AnalysisWarning[];
  source: PortfolioSource;
  brokerMessage: string;
  requiresReview: boolean;
  file: {
    name: string;
    detectedType: string;
    status: "complete" | "partial";
  };
};

type OcrWorker = {
  recognize: (source: File | Blob) => Promise<{ data?: { text?: string } }>;
  terminate: () => Promise<unknown>;
};

let ocrWorkerPromise: Promise<OcrWorker> | null = null;
let activeProgressListener: ParseOptions["onProgress"];

function createId() {
  const randomUuid = globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : null;
  return randomUuid || `holding-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function warning(code: string, message: string, action: string): AnalysisWarning {
  return { code, message, action, severity: "warning" };
}

function detectedType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp"].includes(extension)) return extension === "jpeg" ? "JPG" : extension.toUpperCase();
  if (extension) return extension.toUpperCase();
  return file.type || "Unknown";
}

function fileReaderResult(blob: Blob, mode: "text" | "arrayBuffer") {
  if (typeof FileReader !== "function") {
    throw importError("FILE-READ-01", { kind: "browser-compatibility" });
  }
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(importError("FILE-READ-01", { kind: "file-reading", cause: reader.error }));
    reader.onload = () => {
      if (typeof reader.result === "string" || reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(importError("FILE-READ-01", { kind: "file-reading" }));
    };
    if (mode === "text") reader.readAsText(blob);
    else reader.readAsArrayBuffer(blob);
  });
}

async function readBlobText(blob: Blob) {
  try {
    if (typeof blob.text === "function") return await blob.text();
    const result = await fileReaderResult(blob, "text");
    return typeof result === "string" ? result : new TextDecoder().decode(result);
  } catch (error) {
    if (normalizePortfolioImportError(error).code === "FILE-READ-01") throw error;
    throw importError("FILE-READ-01", { kind: "file-reading", cause: error });
  }
}

async function readBlobArrayBuffer(blob: Blob) {
  try {
    if (typeof blob.arrayBuffer === "function") return await blob.arrayBuffer();
    const result = await fileReaderResult(blob, "arrayBuffer");
    if (result instanceof ArrayBuffer) return result;
    return new TextEncoder().encode(result).buffer;
  } catch (error) {
    if (normalizePortfolioImportError(error).code === "FILE-READ-01") throw error;
    throw importError("FILE-READ-01", { kind: "file-reading", cause: error });
  }
}

async function canvasBlob(canvas: HTMLCanvasElement) {
  if (typeof canvas.toBlob === "function") {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) return blob;
  }
  if (typeof canvas.toDataURL !== "function" || typeof atob !== "function") {
    throw importError("PDF-CANVAS-01", { kind: "canvas-rendering" });
  }
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: "image/png" });
  } catch (error) {
    throw importError("PDF-CANVAS-01", { kind: "canvas-rendering", cause: error });
  }
}

async function getOcrWorker(options: ParseOptions = {}) {
  activeProgressListener = options.onProgress;
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      let tesseractModule;
      try {
        tesseractModule = await import("tesseract.js");
      } catch (error) {
        throw importError("OCR-MODULE-01", { kind: "module-loading", cause: error });
      }
      const createWorker = validateTesseractModule(tesseractModule);
      try {
        const worker = await createWorker("eng", undefined, {
          logger: (message: ImportProgress) => {
            if (activeProgressListener) {
              activeProgressListener({
                status: message.status || "Reading screenshot",
                progress: Number(message.progress) || 0,
              });
            }
          },
        });
        if (!worker || typeof worker.recognize !== "function" || typeof worker.terminate !== "function") {
          throw importError("OCR-WORKER-01", { kind: "worker-initialization" });
        }
        return worker as OcrWorker;
      } catch (error) {
        if (normalizePortfolioImportError(error).code === "OCR-WORKER-01") throw error;
        const code = classifyOcrWorkerFailure(error);
        throw importError(code, {
          kind: code === "OCR-WORKER-01" ? "worker-initialization" : "worker-resource",
          cause: error,
        });
      }
    })();
  }
  return ocrWorkerPromise;
}

export async function terminatePortfolioOcr() {
  const pendingWorker = ocrWorkerPromise;
  ocrWorkerPromise = null;
  activeProgressListener = undefined;
  if (!pendingWorker) return;
  try {
    const worker = await pendingWorker;
    await worker.terminate();
  } catch {
    // A failed worker is already surfaced by the import call. Cleanup stays silent.
  }
}

async function ocrImage(source: File | Blob, options: ParseOptions = {}) {
  const worker = await getOcrWorker(options);
  try {
    const result = await worker.recognize(source);
    return result?.data?.text || "";
  } catch (error) {
    throw importError("OCR-RECOGNIZE-01", { kind: "recognition", cause: error });
  }
}

function parsedTextHoldings(text: string, sourceRef: string): { holdings: DraftHolding[]; recovered: boolean } {
  const parsed = parsePortfolioText(text);
  const holdings = parsed.holdings.map((holding: DraftHolding) => {
    const category = holding.category === "Other" ? "Needs review" : holding.category;
    const warnings = Array.isArray(holding.warnings) ? [...holding.warnings] : [];
    if (category === "Needs review") {
      warnings.push(warning("unknown-classification", `${holding.ticker || holding.name} needs a confirmed category.`, "Choose a category in Review holdings."));
    }
    return {
      ...holding,
      id: createId(),
      symbol: holding.ticker,
      assetClass: category,
      category,
      sourceRef,
      warnings,
    };
  });
  return { holdings, recovered: Boolean(parsed.recovered) };
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

function resultMetadata(file: File, holdings: DraftHolding[], recovered: boolean) {
  const requiresReview = recovered || holdings.some((holding) =>
    holding.confidence === "low" || holding.marketValue === null || holding.percent === null,
  );
  return {
    requiresReview,
    file: {
      name: file.name,
      detectedType: detectedType(file),
      status: requiresReview ? "partial" as const : "complete" as const,
    },
  };
}

async function parseCsv(file: File): Promise<ParseResult> {
  const text = await readBlobText(file);
  if (!text.trim()) throw importError("FILE-EMPTY-01", { kind: "empty-file", retryable: false });
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
  if (!holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
  return {
    holdings,
    warnings,
    source: sourceMetadata("csv", file, detection),
    brokerMessage: detection.message,
    ...resultMetadata(file, holdings, warnings.length > 0),
  };
}

async function loadPdfRuntime() {
  let pdfModule;
  try {
    pdfModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
  } catch (error) {
    throw importError("PDF-MODULE-01", { kind: "module-loading", cause: error });
  }
  const runtime = validatePdfModule(pdfModule);
  if (!pdfWorkerUrl || typeof pdfWorkerUrl !== "string") {
    throw importError("PDF-WORKER-01", { kind: "worker-initialization" });
  }
  try {
    runtime.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  } catch (error) {
    throw importError("PDF-WORKER-01", { kind: "worker-initialization", cause: error });
  }
  return runtime;
}

async function parsePdf(file: File, options: ParseOptions = {}): Promise<ParseResult> {
  const { getDocument } = await loadPdfRuntime();
  const data = await readBlobArrayBuffer(file);
  let pdf;
  try {
    const loadingTask = getDocument({ data });
    if (!loadingTask || !loadingTask.promise) throw importError("PDF-DOCUMENT-01", { kind: "document-loading" });
    pdf = await loadingTask.promise;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("password")) throw importError("PDF-PASSWORD-01", { kind: "password", retryable: false, cause: error });
    if (normalizePortfolioImportError(error).code === "PDF-DOCUMENT-01") throw error;
    throw importError("PDF-DOCUMENT-01", { kind: "document-loading", cause: error });
  }

  const pageLimit = Math.min(pdf.numPages, FILE_LIMITS.maxPdfPages);
  let text = "";
  try {
    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      text += content.items.map((item: { str?: string; hasEOL?: boolean }) =>
        "str" in item ? `${item.str || ""}${item.hasEOL ? "\n" : " "}` : "",
      ).join("");
      text += "\n";
    }
  } catch (error) {
    throw importError("PDF-TEXT-01", { kind: "text-extraction", cause: error });
  }

  const warnings: AnalysisWarning[] = [];
  if (pdf.numPages > pageLimit) {
    warnings.push(warning("pdf-page-limit", `Only the first ${pageLimit} PDF pages were processed.`, "Confirm that all positions are present."));
  }
  if (text.replace(/\s/g, "").length < 40) {
    text = "";
    const ocrLimit = Math.min(pdf.numPages, FILE_LIMITS.maxOcrPdfPages);
    warnings.push(warning("scanned-pdf-ocr", `This appears to be a scanned PDF. OCR was limited to ${ocrLimit} pages.`, "Review every detected row."));
    try {
      for (let pageNumber = 1; pageNumber <= ocrLimit; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.35 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw importError("PDF-CANVAS-01", { kind: "canvas-rendering" });
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        text += `${await ocrImage(await canvasBlob(canvas), options)}\n`;
      }
    } catch (error) {
      const normalized = normalizePortfolioImportError(error);
      if (normalized.code === "PDF-CANVAS-01") throw error;
      throw importError("PDF-OCR-01", { kind: "ocr-fallback", cause: error });
    }
  }
  if (!text.trim()) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
  const detection = detectBroker({ text, fileName: file.name });
  const parsed = parsedTextHoldings(text, `${detection.label} PDF`);
  if (!parsed.holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
  if (parsed.recovered) {
    warnings.push(warning("partial-import", "Some PDF fields need manual confirmation.", "Review every yellow row before analyzing."));
  }
  return {
    holdings: parsed.holdings,
    warnings,
    source: sourceMetadata("pdf", file, detection),
    brokerMessage: detection.message,
    ...resultMetadata(file, parsed.holdings, parsed.recovered || warnings.length > 0),
  };
}

export async function parsePortfolioFile(file: File, options: ParseOptions = {}): Promise<ParseResult> {
  if (file.size > FILE_LIMITS.maxBytes) {
    throw importError("FILE-READ-01", { kind: "file-size", retryable: false });
  }
  if (file.size === 0) throw importError("FILE-EMPTY-01", { kind: "empty-file", retryable: false });
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp"].includes(extension || "")) {
    const text = await ocrImage(file, options);
    if (!text.trim()) throw importError("OCR-RECOGNIZE-01", { kind: "recognition" });
    const detection = detectBroker({ text, fileName: file.name });
    const parsed = parsedTextHoldings(text, `${detection.label} screenshot`);
    if (!parsed.holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
    const warnings = [
      warning("ocr-review", "Image text was read with OCR and may be uncertain.", "Review every detected row."),
    ];
    if (parsed.recovered) {
      warnings.push(warning("partial-import", "Some screenshot fields need manual confirmation.", "Complete every yellow row before analyzing."));
    }
    return {
      holdings: parsed.holdings,
      warnings,
      source: sourceMetadata("image", file, detection),
      brokerMessage: detection.message,
      ...resultMetadata(file, parsed.holdings, true),
    };
  }
  if (extension === "pdf" || file.type === "application/pdf") return parsePdf(file, options);
  if (extension === "csv" || file.type === "text/csv") return parseCsv(file);
  if (extension === "txt" || file.type === "text/plain") {
    const text = await readBlobText(file);
    if (!text.trim()) throw importError("FILE-EMPTY-01", { kind: "empty-file", retryable: false });
    const detection = detectBroker({ text, fileName: file.name });
    const parsed = parsedTextHoldings(text, `${detection.label} text import`);
    if (!parsed.holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
    const warnings = parsed.recovered
      ? [warning("partial-import", "Some text fields need manual confirmation.", "Complete every yellow row before analyzing.")]
      : [];
    return {
      holdings: parsed.holdings,
      warnings,
      source: sourceMetadata("txt", file, detection),
      brokerMessage: detection.message,
      ...resultMetadata(file, parsed.holdings, parsed.recovered),
    };
  }
  throw importError("FILE-TYPE-01", { kind: "unsupported-type", retryable: false });
}

export function mergeHoldings(holdings: DraftHolding[]) {
  const seen = new Map<string, DraftHolding>();
  for (const holding of holdings) {
    const key = holding.ticker || holding.name.toLowerCase() || holding.id;
    if (!seen.has(key)) seen.set(key, holding);
  }
  return [...seen.values()];
}

export { formatPortfolioImportError, normalizePortfolioImportError };
