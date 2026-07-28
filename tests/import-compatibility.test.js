import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPortfolioImportError,
  importError,
  normalizePortfolioImportError,
  classifyOcrWorkerFailure,
  validatePdfModule,
  validateTesseractModule,
} from "../lib/importCompatibility.js";

test("Tesseract guard accepts only the supported named createWorker API", () => {
  const createWorker = () => {};
  assert.equal(validateTesseractModule({ createWorker }), createWorker);
  assert.throws(
    () => validateTesseractModule({ default: { recognize() {} } }),
    (error) => error.code === "OCR-MODULE-01",
  );
});

test("PDF guards identify missing module and worker APIs", () => {
  assert.throws(() => validatePdfModule({}), (error) => error.code === "PDF-MODULE-01");
  assert.throws(
    () => validatePdfModule({ getDocument() {} }),
    (error) => error.code === "PDF-WORKER-01",
  );
  const getDocument = () => {};
  assert.equal(validatePdfModule({ getDocument, GlobalWorkerOptions: {} }).getDocument, getDocument);
});

test("raw JavaScript exceptions normalize to a user-safe coded message", () => {
  const raw = new TypeError("undefined is not a function (near 'file.text')");
  const normalized = normalizePortfolioImportError(raw);
  assert.equal(normalized.code, "IMPORT-UNKNOWN-01");
  const formatted = formatPortfolioImportError(raw);
  assert.match(formatted, /Error code: IMPORT-UNKNOWN-01/);
  assert.doesNotMatch(formatted, /undefined|file\.text|TypeError/);
});

test("known import failures preserve their safe code and category", () => {
  const failure = importError("PDF-WORKER-01", { kind: "worker-initialization" });
  const normalized = normalizePortfolioImportError(failure);
  assert.deepEqual(normalized, {
    code: "PDF-WORKER-01",
    kind: "worker-initialization",
    retryable: true,
    userMessage: "The PDF reader could not start on this browser. Try CSV, screenshots, or manual entry.",
  });
});

test("OCR worker failures separate language-data and CSP failures", () => {
  assert.equal(classifyOcrWorkerFailure(new Error("Failed to fetch eng.traineddata")), "OCR-LANGUAGE-01");
  assert.equal(classifyOcrWorkerFailure(new Error("Refused by Content Security Policy worker-src")), "OCR-CSP-01");
  assert.equal(classifyOcrWorkerFailure(new Error("Worker exited")), "OCR-WORKER-01");
});
