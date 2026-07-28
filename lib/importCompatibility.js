const IMPORT_ERROR_MESSAGES = {
  "FILE-EMPTY-01": "The selected file is empty. Export it again or choose another file.",
  "FILE-READ-01": "Your file could not be read on this browser. Try CSV, a clearer screenshot, or manual entry.",
  "FILE-TYPE-01": "This file type is not supported. Choose PNG, JPG, WEBP, PDF, CSV, or TXT.",
  "NO-POSITIONS-01": "The file was readable, but no defensible holdings were detected. Review the extracted information or add a holding manually.",
  "OCR-MODULE-01": "Screenshot reading is not available on this browser. Try CSV, a clearer screenshot, or manual entry.",
  "OCR-WORKER-01": "Screenshot reading could not start on this browser. Check content blockers or try CSV.",
  "OCR-LANGUAGE-01": "The OCR language data could not load. Check your connection or try CSV.",
  "OCR-CSP-01": "A browser content blocker prevented screenshot reading. Allow this site or try CSV.",
  "OCR-RECOGNIZE-01": "The screenshot could not be read reliably. Try a clearer image, CSV, or manual entry.",
  "PDF-MODULE-01": "PDF support could not load on this browser. Try CSV, screenshots, or manual entry.",
  "PDF-WORKER-01": "The PDF reader could not start on this browser. Try CSV, screenshots, or manual entry.",
  "PDF-DOCUMENT-01": "This PDF could not be read. Try an unlocked PDF, CSV, or screenshots.",
  "PDF-PASSWORD-01": "This PDF is password-protected. Export an unlocked copy and try again.",
  "PDF-TEXT-01": "Text could not be extracted from this PDF. Try screenshots, CSV, or manual entry.",
  "PDF-CANVAS-01": "A scanned PDF page could not be rendered on this browser. Try screenshots or CSV.",
  "PDF-OCR-01": "The scanned PDF could not be read reliably. Try screenshots, CSV, or manual entry.",
  "IMPORT-UNKNOWN-01": "Your file could not be processed on this browser. Try CSV, a clearer screenshot, or manual entry.",
};

class PortfolioImportError extends Error {
  constructor(code, options = {}) {
    super(IMPORT_ERROR_MESSAGES[code] || IMPORT_ERROR_MESSAGES["IMPORT-UNKNOWN-01"]);
    this.name = "PortfolioImportError";
    this.code = code;
    this.kind = options.kind || "browser-compatibility";
    this.retryable = options.retryable !== false;
    this.cause = options.cause;
  }
}

function importError(code, options) {
  return new PortfolioImportError(code, options);
}

function validateTesseractModule(moduleValue) {
  if (!moduleValue || typeof moduleValue.createWorker !== "function") {
    throw importError("OCR-MODULE-01", { kind: "module-loading" });
  }
  return moduleValue.createWorker;
}

function classifyOcrWorkerFailure(error) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (/content security|content-security|worker-src|\bcsp\b|blocked by/.test(message)) return "OCR-CSP-01";
  if (/traineddata|language data|network|fetch|load language/.test(message)) return "OCR-LANGUAGE-01";
  return "OCR-WORKER-01";
}

function validatePdfModule(moduleValue) {
  if (!moduleValue || typeof moduleValue.getDocument !== "function") {
    throw importError("PDF-MODULE-01", { kind: "module-loading" });
  }
  if (
    !moduleValue.GlobalWorkerOptions
    || !["object", "function"].includes(typeof moduleValue.GlobalWorkerOptions)
  ) {
    throw importError("PDF-WORKER-01", { kind: "worker-initialization" });
  }
  return {
    getDocument: moduleValue.getDocument,
    GlobalWorkerOptions: moduleValue.GlobalWorkerOptions,
  };
}

function normalizePortfolioImportError(error, fallbackCode = "IMPORT-UNKNOWN-01") {
  const normalized = error instanceof PortfolioImportError
    ? error
    : importError(fallbackCode, { cause: error });
  return {
    code: normalized.code,
    kind: normalized.kind,
    retryable: normalized.retryable,
    userMessage: normalized.message,
  };
}

function formatPortfolioImportError(error, fallbackCode) {
  const normalized = normalizePortfolioImportError(error, fallbackCode);
  return `${normalized.userMessage} Error code: ${normalized.code}.`;
}

export {
  IMPORT_ERROR_MESSAGES,
  PortfolioImportError,
  classifyOcrWorkerFailure,
  formatPortfolioImportError,
  importError,
  normalizePortfolioImportError,
  validatePdfModule,
  validateTesseractModule,
};
