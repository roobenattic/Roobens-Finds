import { z } from "zod";
import { resolveSecurityCandidates } from "../lib/securityResolver.js";
import { allowRequest, safeJsonBody } from "../lib/requestLimits.js";

export const config = { api: { bodyParser: { sizeLimit: "256kb" } } };

const fieldSchema = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  confidence: z.number().min(0).max(1),
  source: z.enum(["csv", "pdf-text", "ocr", "vision"]),
  page: z.number().int().positive().optional(),
}).strict();

const candidateSchema = z.object({
  symbol: fieldSchema,
  identifiers: z.array(z.object({
    value: z.object({
      type: z.enum(["CUSIP", "ISIN", "FIGI"]),
      value: z.string().min(1).max(64),
    }),
    confidence: z.number().min(0).max(1),
    source: z.enum(["csv", "pdf-text", "ocr", "vision"]),
    page: z.number().int().positive().optional(),
  }).strict()).max(8).default([]),
  exchange: z.string().max(32).optional(),
  currency: z.string().max(8).optional(),
}).strict();

const requestSchema = z.object({
  candidates: z.array(candidateSchema).min(1).max(100),
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!allowRequest(req, { scope: "security-resolver", limit: 20 })) {
    return res.status(429).json({ error: "Security verification is busy. Continue reviewing and try again shortly." });
  }
  const parsed = requestSchema.safeParse(safeJsonBody(req.body));
  if (!parsed.success) {
    return res.status(400).json({ error: "The security evidence was incomplete. Continue with manual review." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const resolutions = await resolveSecurityCandidates(parsed.data.candidates, {
      apiKey: process.env.OPENFIGI_API_KEY,
      signal: controller.signal,
    });
    return res.status(200).json({ resolutions });
  } catch {
    return res.status(503).json({
      error: "Security verification is temporarily unavailable.",
      resolutions: parsed.data.candidates.map(() => ({
        status: "unresolved",
        evidence: ["Continue with manual review or try verification again later."],
      })),
    });
  } finally {
    clearTimeout(timeout);
  }
}
