import { z } from "zod";

export const SeverityZ = z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]);

export const AnalysisZ = z.object({
  errors: z.array(
    z.object({
      line: z.number().nullable().optional(),
      severity: z.preprocess((v) => String(v ?? "ERROR").toUpperCase(), SeverityZ),
      type: z.string(),
      explanation: z.string(),
      rootCause: z.string().optional().default(""),
    }),
  ),
  fixedCode: z.string(),
  changes: z.array(z.object({ before: z.string(), after: z.string(), reason: z.string() })).default([]),
  steps: z.array(z.string()).default([]),
  preventionTips: z.array(z.string()).default([]),
});

export type Analysis = z.infer<typeof AnalysisZ>;

export interface AnalyzeResponse {
  analysis: Analysis;
  language: string;
  source: "ai" | "rules";
  notice?: string;
}
