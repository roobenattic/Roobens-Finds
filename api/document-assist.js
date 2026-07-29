import { z } from "zod";
import { allowRequest, safeJsonBody } from "../lib/requestLimits.js";

export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };

const nullableString = z.string().max(500).nullable();
const nullableNumber = z.number().finite().nonnegative().nullable();
const bboxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
}).nullable();
const extractedStringSchema = z.object({
  value: nullableString,
  confidence: z.number().min(0).max(1),
  rawText: nullableString,
  bbox: bboxSchema,
});
const extractedNumberSchema = z.object({
  value: nullableNumber,
  confidence: z.number().min(0).max(1),
  rawText: nullableString,
  bbox: bboxSchema,
});
const identifierSchema = z.object({
  type: z.enum(["CUSIP", "ISIN", "FIGI"]),
  value: z.string().min(1).max(64),
  confidence: z.number().min(0).max(1),
  rawText: nullableString,
  bbox: bboxSchema,
});
const rowSchema = z.object({
  symbol: extractedStringSchema,
  name: extractedStringSchema,
  shares: extractedNumberSchema,
  marketValue: extractedNumberSchema,
  weight: extractedNumberSchema,
  identifiers: z.array(identifierSchema).max(8),
  rowEvidence: z.string().max(1000),
});
const documentSchema = z.object({
  pageType: z.enum(["positions", "balances", "transactions", "decoration", "unknown"]),
  brokerLabel: nullableString,
  rows: z.array(rowSchema).max(150),
  notes: z.array(z.string().max(300)).max(10),
});

const requestSchema = z.object({
  consent: z.literal(true),
  imageDataUrl: z.string()
    .max(5_500_000)
    .regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/),
  page: z.number().int().positive().max(5).default(1),
});

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["pageType", "brokerLabel", "rows", "notes"],
  properties: {
    pageType: { type: "string", enum: ["positions", "balances", "transactions", "decoration", "unknown"] },
    brokerLabel: { type: ["string", "null"] },
    rows: {
      type: "array",
      maxItems: 150,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["symbol", "name", "shares", "marketValue", "weight", "identifiers", "rowEvidence"],
        properties: {
          symbol: fieldJsonSchema("string"),
          name: fieldJsonSchema("string"),
          shares: fieldJsonSchema("number"),
          marketValue: fieldJsonSchema("number"),
          weight: fieldJsonSchema("number"),
          identifiers: {
            type: "array",
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["type", "value", "confidence", "rawText", "bbox"],
              properties: {
                type: { type: "string", enum: ["CUSIP", "ISIN", "FIGI"] },
                value: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                rawText: { type: ["string", "null"] },
                bbox: bboxJsonSchema(),
              },
            },
          },
          rowEvidence: { type: "string" },
        },
      },
    },
    notes: { type: "array", maxItems: 10, items: { type: "string" } },
  },
};

function bboxJsonSchema() {
  return {
    anyOf: [
      { type: "null" },
      {
        type: "object",
        additionalProperties: false,
        required: ["x", "y", "width", "height"],
        properties: {
          x: { type: "number", minimum: 0, maximum: 1 },
          y: { type: "number", minimum: 0, maximum: 1 },
          width: { type: "number", minimum: 0, maximum: 1 },
          height: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    ],
  };
}

function fieldJsonSchema(kind) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["value", "confidence", "rawText", "bbox"],
    properties: {
      value: { type: [kind, "null"] },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      rawText: { type: ["string", "null"] },
      bbox: bboxJsonSchema(),
    },
  };
}

function responseText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function validateDocumentAssistResult(value) {
  return documentSchema.safeParse(value);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!allowRequest(req, { scope: "document-assist", limit: 5 })) {
    return res.status(429).json({ error: "Document assist is busy. Continue with manual review or try again shortly." });
  }
  if (process.env.DOCUMENT_ASSIST_ENABLED !== "true" || !process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "Document assist is not available. Continue with manual review." });
  }
  const parsed = requestSchema.safeParse(safeJsonBody(req.body));
  if (!parsed.success) {
    return res.status(400).json({ error: "This page could not be prepared safely for document assist." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_DOCUMENT_MODEL || "gpt-5.6",
        store: false,
        input: [{
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Extract only visible portfolio positions from this page.",
                "Ignore account numbers, balances, transactions, totals, headers, and decoration.",
                "Never invent a ticker, name, value, category, or price.",
                "Return null for unreadable fields. Do not classify investments or give advice.",
                `This is page ${parsed.data.page}.`,
              ].join(" "),
            },
            { type: "input_image", image_url: parsed.data.imageDataUrl, detail: "original" },
          ],
        }],
        text: {
          format: {
            type: "json_schema",
            name: "portfolio_document_extraction",
            strict: true,
            schema: jsonSchema,
          },
        },
      }),
    });
    if (!response.ok) {
      return res.status(502).json({ error: "Document assist could not finish. Continue with manual review." });
    }
    const output = responseText(await response.json());
    const validated = documentSchema.safeParse(JSON.parse(output));
    if (!validated.success) {
      return res.status(502).json({ error: "Document assist returned an unreadable result. Continue with manual review." });
    }
    return res.status(200).json(validated.data);
  } catch {
    return res.status(504).json({ error: "Document assist timed out. Continue with manual review." });
  } finally {
    clearTimeout(timeout);
  }
}

export { validateDocumentAssistResult };
