import Papa from "papaparse";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
// @ts-ignore Shared deterministic parsing modules.
import { parsePortfolioText } from "../../lib/portfolioParser.js";
// @ts-ignore Shared deterministic broker profile module.
import { detectBroker, normalizeBrokerRows } from "../../lib/brokerProfiles.js";
// @ts-ignore Shared document-intelligence primitives.
import { candidateFromHolding, detectFileType, duplicateAssessment } from "../../lib/documentIntelligence.js";
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
  "image/png,image/jpeg,image/webp,image/heic,image/heif,application/pdf,text/csv,.csv,.txt,.heic,.heif";

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
  evidence?: HoldingCandidate;
  rowEvidence?: string;
  verification?: SecurityResolution;
  possibleDuplicateOf?: string;
  userConfirmed?: boolean;
};

export type ExtractedField<T> = {
  value: T | null;
  confidence: number;
  source: "csv" | "pdf-text" | "ocr" | "vision";
  page?: number;
  rawText?: string;
  bbox?: { x: number; y: number; width: number; height: number };
};

export type HoldingCandidate = {
  symbol: ExtractedField<string>;
  name: ExtractedField<string>;
  shares: ExtractedField<number>;
  marketValue: ExtractedField<number>;
  weight: ExtractedField<number>;
  identifiers: Array<ExtractedField<{ type: "CUSIP" | "ISIN" | "FIGI"; value: string }>>;
  rowEvidence: string;
};

export type ResolvedInstrument = {
  figi?: string | null;
  compositeFigi?: string | null;
  symbol: string;
  name: string;
  exchange: string;
  securityType: string;
  category: string;
  source: string;
};

export type SecurityResolution =
  | { status: "verified"; instrument: ResolvedInstrument; confidence: number; evidence: string[] }
  | { status: "ambiguous"; candidates: ResolvedInstrument[]; evidence: string[] }
  | { status: "unresolved"; evidence: string[] };

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
  details: {
    method: string;
    verified: number;
    unresolved: number;
    assistEligible: boolean;
  };
};

type OcrWorker = {
  recognize: (source: File | Blob) => Promise<{ data?: { text?: string; confidence?: number; rotateRadians?: number } }>;
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

async function sniffFileKind(file: File) {
  const bytes = new Uint8Array(await readBlobArrayBuffer(file.slice(0, 512)));
  const detected = detectFileType(bytes, file.type);
  if (detected.type !== "unknown") return detected.type;
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp", "heic", "heif", "pdf", "csv", "txt"].includes(extension)) {
    return extension === "jpg" ? "jpeg" : extension === "heif" ? "heic" : extension;
  }
  return "unknown";
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

async function normalizedImageBlob(source: File | Blob, variant: { contrast?: number; rotationDegrees?: number } = {}) {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return source;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch (error) {
    throw importError("FILE-TYPE-01", { kind: "image-decoding", cause: error });
  }
  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(3, Math.max(1, 2200 / Math.max(1, longest)));
    const rotation = (Number(variant.rotationDegrees) || 0) * (Math.PI / 180);
    const sourceWidth = Math.round(bitmap.width * scale);
    const sourceHeight = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(Math.abs(sourceWidth * Math.cos(rotation)) + Math.abs(sourceHeight * Math.sin(rotation)));
    canvas.height = Math.ceil(Math.abs(sourceWidth * Math.sin(rotation)) + Math.abs(sourceHeight * Math.cos(rotation)));
    const context = canvas.getContext("2d");
    if (!context) throw importError("PDF-CANVAS-01", { kind: "canvas-rendering" });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.filter = `contrast(${variant.contrast || 1.12})${variant.contrast && variant.contrast > 1.2 ? " grayscale(1)" : ""}`;
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(rotation);
    context.drawImage(bitmap, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
    return await canvasBlob(canvas);
  } finally {
    bitmap.close();
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
    const normalized = await normalizedImageBlob(source);
    let result = await worker.recognize(normalized);
    const firstConfidence = Math.max(0, Math.min(1, Number(result?.data?.confidence || 0) / 100));
    if (firstConfidence < 0.58) {
      const suggestedRotation = Number(result?.data?.rotateRadians || 0) * (180 / Math.PI);
      const safeRotation = Math.abs(suggestedRotation) <= 5 ? -suggestedRotation : 0;
      const enhanced = await normalizedImageBlob(source, { contrast: 1.35, rotationDegrees: safeRotation });
      const retry = await worker.recognize(enhanced);
      const retryConfidence = Math.max(0, Math.min(1, Number(retry?.data?.confidence || 0) / 100));
      if (retryConfidence > firstConfidence) result = retry;
    }
    return {
      text: result?.data?.text || "",
      confidence: Math.max(0, Math.min(1, Number(result?.data?.confidence || 0) / 100)),
    };
  } catch (error) {
    if (normalizePortfolioImportError(error).kind === "image-decoding") throw error;
    throw importError("OCR-RECOGNIZE-01", { kind: "recognition", cause: error });
  }
}

function parsedTextHoldings(
  text: string,
  sourceRef: string,
  source: "pdf-text" | "ocr" | "vision" = "ocr",
  page?: number,
): { holdings: DraftHolding[]; recovered: boolean } {
  const parsed = parsePortfolioText(text);
  const holdings = parsed.holdings.map((holding: DraftHolding) => {
    const category = "Needs review";
    const warnings = Array.isArray(holding.warnings) ? [...holding.warnings] : [];
    if (category === "Needs review") {
      warnings.push(warning("unknown-classification", `${holding.ticker || holding.name} has not been classified from verified security metadata.`, "Verify the security or choose a category manually."));
    }
    return {
      ...holding,
      id: createId(),
      symbol: holding.ticker,
      assetClass: category,
      category,
      sourceRef,
      warnings,
      evidence: candidateFromHolding(holding, source, { page, rowEvidence: holding.rowEvidence }),
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

export function applySecurityResolutions(holdings: DraftHolding[], resolutions: SecurityResolution[]) {
  return holdings.map((holding, index) => {
    const resolution = resolutions[index] || {
      status: "unresolved",
      evidence: ["Security verification did not return a result."],
    } as SecurityResolution;
    if (resolution.status === "verified") {
      const instrument = resolution.instrument;
      const verifiedCategory = instrument.category === "Other" ? "Needs review" : instrument.category;
      const extractionConfidence = Math.min(
        holding.evidence?.symbol?.confidence ?? 0,
        holding.marketValue === null ? 1 : holding.evidence?.marketValue?.confidence ?? 0,
      );
      const warnings = (holding.warnings || []).filter((item) =>
        !["unverified-security", "unknown-classification"].includes(item.code),
      );
      if (verifiedCategory === "Needs review") {
        warnings.push(warning(
          "unknown-classification",
          `${instrument.name || holding.ticker} was verified, but its investment type still needs review.`,
          "Choose the category that matches the statement.",
        ));
      }
      if (extractionConfidence < 0.8) {
        warnings.push(warning(
          "extraction-confirmation",
          `${instrument.name || holding.ticker} was verified, but one or more position values came from lower-confidence document text.`,
          "Compare the shares and market value with the source row, then confirm.",
        ));
      }
      return {
        ...holding,
        ticker: instrument.symbol || holding.ticker,
        symbol: instrument.symbol || holding.ticker,
        name: instrument.name || holding.name,
        category: verifiedCategory,
        assetClass: verifiedCategory,
        confidence: extractionConfidence >= 0.8 ? "high" as const : "medium" as const,
        verification: resolution,
        warnings,
      };
    }
    const readable = holding.ticker || holding.name || "This row";
    const message = resolution.status === "ambiguous"
      ? `The document reads ${holding.ticker}; more than one security may match.`
      : `${readable} could not be independently verified yet.`;
    return {
      ...holding,
      category: "Needs review",
      assetClass: "Needs review",
      confidence: "low" as const,
      verification: resolution,
      warnings: [
        ...(holding.warnings || []).filter((item) => !["unverified-security", "unknown-classification"].includes(item.code)),
        warning(
          resolution.status === "ambiguous" ? "ambiguous-security" : "unresolved-security",
          message,
          resolution.status === "ambiguous" ? "Choose the matching name and exchange; no guess was preselected." : "Search or enter the security manually, or remove it if it is not a holding.",
        ),
      ],
    };
  });
}

async function verifyHoldings(holdings: DraftHolding[]) {
  if (!holdings.length || typeof fetch !== "function") return holdings;
  const candidates = holdings.map((holding) => {
    const evidence = holding.evidence || candidateFromHolding(holding, "ocr");
    return {
      symbol: {
        value: evidence.symbol.value,
        confidence: evidence.symbol.confidence,
        source: evidence.symbol.source,
        ...(evidence.symbol.page ? { page: evidence.symbol.page } : {}),
      },
      identifiers: (evidence.identifiers || []).map((identifier: ExtractedField<{ type: "CUSIP" | "ISIN" | "FIGI"; value: string }>) => ({
        value: identifier.value,
        confidence: identifier.confidence,
        source: identifier.source,
        ...(identifier.page ? { page: identifier.page } : {}),
      })),
    };
  });
  try {
    const response = await fetch("/api/resolve-securities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates }),
    });
    const payload = await response.json();
    if (!Array.isArray(payload?.resolutions)) return holdings;
    return applySecurityResolutions(holdings, payload.resolutions);
  } catch {
    return holdings;
  }
}

function resultMetadata(file: File, holdings: DraftHolding[], recovered: boolean, method: string, assistEligible = false) {
  const requiresReview = recovered || holdings.some((holding) =>
    holding.confidence === "low"
    || (holding.marketValue === null && holding.percent === null)
    || holding.verification?.status !== "verified",
  );
  const verified = holdings.filter((holding) => holding.verification?.status === "verified").length;
  return {
    requiresReview,
    file: {
      name: file.name,
      detectedType: detectedType(file),
      status: requiresReview ? "partial" as const : "complete" as const,
    },
    details: {
      method,
      verified,
      unresolved: holdings.length - verified,
      assistEligible,
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
  let holdings = normalizeBrokerRows(parsed.data, detection, `${detection.label} CSV`);
  const warnings: AnalysisWarning[] = parsed.errors.map(() =>
    warning("csv-row-error", "Some CSV rows could not be read.", "Review every imported row before continuing."),
  );
  if (!holdings.length && parsed.data.length) {
    holdings = parsed.data.slice(0, 50).map((row, index) => {
      const rowEvidence = Object.entries(row).map(([key, value]) => `${key}: ${String(value ?? "")}`).join(" | ").slice(0, 1000);
      const holding: DraftHolding = {
        id: createId(),
        ticker: "",
        symbol: "",
        name: "",
        shares: null,
        marketValue: null,
        percent: null,
        category: "Needs review",
        assetClass: "Needs review",
        confidence: "low",
        sourceRef: "Unmapped CSV row",
        rowEvidence,
        warnings: [warning(
          "unknown-csv-headings",
          `CSV row ${index + 1} uses headings we could not map safely.`,
          "Use the row evidence to enter the ticker and value; no columns were guessed.",
        )],
        verification: { status: "unresolved", evidence: ["CSV headings were not recognized."] },
      };
      holding.evidence = candidateFromHolding(holding, "csv", { rowEvidence });
      return holding;
    });
    warnings.push(warning(
      "unknown-csv-headings",
      "The CSV opened, but its column names are unfamiliar.",
      "Review the preserved rows and map the ticker and value manually.",
    ));
  }
  if (!holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
  holdings = await verifyHoldings(holdings);
  return {
    holdings,
    warnings,
    source: sourceMetadata("csv", file, detection),
    brokerMessage: detection.message,
    ...resultMetadata(file, holdings, warnings.length > 0, "CSV header mapping"),
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
        const pageOcr = await ocrImage(await canvasBlob(canvas), options);
        text += `${pageOcr.text}\n`;
      }
    } catch (error) {
      const normalized = normalizePortfolioImportError(error);
      if (normalized.code === "PDF-CANVAS-01") throw error;
      throw importError("PDF-OCR-01", { kind: "ocr-fallback", cause: error });
    }
  }
  if (!text.trim()) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
  const detection = detectBroker({ text, fileName: file.name });
  const usedOcr = warnings.some((item) => item.code === "scanned-pdf-ocr");
  const parsed = parsedTextHoldings(text, `${detection.label} PDF`, usedOcr ? "ocr" : "pdf-text");
  if (!parsed.holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
  if (parsed.recovered) {
    warnings.push(warning("partial-import", "Some PDF fields need manual confirmation.", "Review every yellow row before analyzing."));
  }
  const holdings = await verifyHoldings(parsed.holdings);
  return {
    holdings,
    warnings,
    source: sourceMetadata("pdf", file, detection),
    brokerMessage: detection.message,
    ...resultMetadata(file, holdings, parsed.recovered || warnings.length > 0, usedOcr ? "Scanned PDF OCR" : "Native PDF text", usedOcr),
  };
}

export async function parsePortfolioFile(file: File, options: ParseOptions = {}): Promise<ParseResult> {
  if (file.size > FILE_LIMITS.maxBytes) {
    throw importError("FILE-READ-01", { kind: "file-size", retryable: false });
  }
  if (file.size === 0) throw importError("FILE-EMPTY-01", { kind: "empty-file", retryable: false });
  const kind = await sniffFileKind(file);
  if (["png", "jpeg", "webp", "heic"].includes(kind)) {
    const ocr = await ocrImage(file, options);
    if (!ocr.text.trim()) throw importError("OCR-RECOGNIZE-01", { kind: "recognition" });
    const detection = detectBroker({ text: ocr.text });
    const parsed = parsedTextHoldings(ocr.text, `${detection.label} screenshot`, "ocr");
    if (!parsed.holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
    const warnings = [
      warning("ocr-review", "Image text was read with OCR and may be uncertain.", "Review every detected row."),
    ];
    if (parsed.recovered) {
      warnings.push(warning("partial-import", "Some screenshot fields need manual confirmation.", "Complete every yellow row before analyzing."));
    }
    const holdings = await verifyHoldings(parsed.holdings);
    return {
      holdings,
      warnings,
      source: sourceMetadata("image", file, detection),
      brokerMessage: detection.message,
      ...resultMetadata(file, holdings, true, `Normalized ${kind.toUpperCase()} OCR`, true),
    };
  }
  if (kind === "pdf") return parsePdf(file, options);
  if (kind === "csv") return parseCsv(file);
  if (kind === "txt") {
    const text = await readBlobText(file);
    if (!text.trim()) throw importError("FILE-EMPTY-01", { kind: "empty-file", retryable: false });
    const detection = detectBroker({ text });
    const parsed = parsedTextHoldings(text, `${detection.label} text import`, "pdf-text");
    if (!parsed.holdings.length) throw importError("NO-POSITIONS-01", { kind: "no-positions" });
    const warnings = parsed.recovered
      ? [warning("partial-import", "Some text fields need manual confirmation.", "Complete every yellow row before analyzing.")]
      : [];
    const holdings = await verifyHoldings(parsed.holdings);
    return {
      holdings,
      warnings,
      source: sourceMetadata("txt", file, detection),
      brokerMessage: detection.message,
      ...resultMetadata(file, holdings, parsed.recovered, "Plain-text row extraction"),
    };
  }
  throw importError("FILE-TYPE-01", { kind: "unsupported-type", retryable: false });
}

async function blobDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(importError("FILE-READ-01", { kind: "file-reading" }));
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(importError("FILE-READ-01", { kind: "file-reading" }));
    reader.readAsDataURL(blob);
  });
}

async function assistRaster(file: File) {
  const kind = await sniffFileKind(file);
  if (["png", "jpeg", "webp", "heic"].includes(kind)) return normalizedImageBlob(file);
  if (kind !== "pdf") throw importError("FILE-TYPE-01", { kind: "document-assist-type", retryable: false });
  const { getDocument } = await loadPdfRuntime();
  const pdf = await getDocument({ data: await readBlobArrayBuffer(file) }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw importError("PDF-CANVAS-01", { kind: "canvas-rendering" });
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvasBlob(canvas);
}

export async function reprocessWithDocumentAssist(file: File): Promise<ParseResult> {
  const raster = await assistRaster(file);
  const response = await fetch("/api/document-assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consent: true,
      imageDataUrl: await blobDataUrl(raster),
      page: 1,
    }),
  });
  const payload = await response.json();
  if (!response.ok || !Array.isArray(payload?.rows)) {
    throw importError("DOCUMENT-ASSIST-01", { kind: "document-assist" });
  }
  const detection = detectBroker({ text: [payload.brokerLabel, ...(payload.notes || [])].filter(Boolean).join(" ") });
  let holdings: DraftHolding[] = payload.rows.map((row: HoldingCandidate) => {
    const ticker = String(row.symbol?.value || "").trim().toUpperCase();
    const holding: DraftHolding = {
      id: createId(),
      ticker,
      symbol: ticker,
      name: String(row.name?.value || ""),
      shares: row.shares?.value ?? null,
      marketValue: row.marketValue?.value ?? null,
      percent: row.weight?.value ?? null,
      weight: row.weight?.value ?? null,
      category: "Needs review",
      assetClass: "Needs review",
      confidence: "low",
      sourceRef: `${detection.label} document assist, page 1`,
      rowEvidence: row.rowEvidence,
      evidence: {
        ...row,
        symbol: { ...row.symbol, source: "vision", page: 1 },
        name: { ...row.name, source: "vision", page: 1 },
        shares: { ...row.shares, source: "vision", page: 1 },
        marketValue: { ...row.marketValue, source: "vision", page: 1 },
        weight: { ...row.weight, source: "vision", page: 1 },
      },
      verification: { status: "unresolved", evidence: ["Document assist transcribed this row; identity verification is still separate."] },
      warnings: [warning(
        "document-assist-review",
        `Document assist read ${ticker || "a row"}, but did not choose its identity or category.`,
        "Review the source text and security verification result.",
      )],
    };
    return holding;
  });
  if (!holdings.length) throw importError("NO-POSITIONS-01", { kind: "document-assist-empty" });
  holdings = await verifyHoldings(holdings);
  return {
    holdings,
    warnings: [warning(
      "document-assist-used",
      "Document assist transcribed difficult page details after your confirmation.",
      "Review all highlighted rows; unreadable fields remain blank.",
    )],
    source: sourceMetadata("image", file, detection),
    brokerMessage: detection.message,
    ...resultMetadata(file, holdings, true, "Server-side document assist + security verification"),
  };
}

export function mergeHoldings(holdings: DraftHolding[]) {
  const merged: DraftHolding[] = [];
  for (const holding of holdings) {
    const match = merged.find((existing) =>
      String(existing.ticker || existing.symbol || "").toUpperCase()
      === String(holding.ticker || holding.symbol || "").toUpperCase(),
    );
    if (!match) {
      merged.push(holding);
      continue;
    }
    const assessment = duplicateAssessment(match, holding);
    if (assessment.status === "duplicate") continue;
    if (assessment.status === "possible") {
      match.possibleDuplicateOf = holding.id;
      match.warnings = [
        ...(match.warnings || []),
        warning("possible-duplicate", `${match.ticker} appears in more than one upload with different position facts.`, "Confirm whether these are separate accounts or duplicate rows."),
      ];
      holding.possibleDuplicateOf = match.id;
      holding.warnings = [
        ...(holding.warnings || []),
        warning("possible-duplicate", `${holding.ticker} may duplicate another imported row.`, "Confirm both rows before analysis."),
      ];
    }
    merged.push(holding);
  }
  return merged;
}

export { formatPortfolioImportError, normalizePortfolioImportError };
