const buckets = new Map();

function clientKey(req) {
  const forwarded = String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function allowRequest(req, options = {}) {
  const now = Date.now();
  const windowMs = options.windowMs || 60_000;
  const limit = options.limit || 20;
  const key = `${options.scope || "default"}:${clientKey(req)}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function safeJsonBody(body) {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export { allowRequest, safeJsonBody };
