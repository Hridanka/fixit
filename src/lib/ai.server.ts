import { createAnthropic } from "@ai-sdk/anthropic";

export const AI_MODEL_DEFAULT = "anthropic/claude-sonnet-5";
export const MAX_INPUT_BYTES = 50 * 1024;

const RUN_ID = "X-Lovable-AIG-Run-ID";

export function getModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;
  let runId: string | undefined;
  const anthropic = createAnthropic({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID) ?? undefined;
      return res;
    },
  });
  return anthropic(process.env["AI_MODEL"] || AI_MODEL_DEFAULT);
}

// Simple in-memory per-IP rate limit (best effort per worker instance).
const hits = new Map<string, number[]>();
export function rateLimited(request: Request, limit = 10, windowMs = 60_000) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local";
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export function errStatus(e: unknown): number | undefined {
  const s = (e as { statusCode?: number })?.statusCode;
  return typeof s === "number" ? s : undefined;
}
