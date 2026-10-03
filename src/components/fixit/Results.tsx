import { useMemo } from "react";
import { motion } from "motion/react";
import { diffLines } from "diff";
import { Download, Info, Lightbulb, CheckCircle2 } from "lucide-react";
import type { AnalyzeResponse } from "@/lib/analysis";
import { cn } from "@/lib/utils";
import { CopyButton, SeverityBadge } from "./common";

const EXT: Record<string, string> = {
  Python: "py", C: "c", "C++": "cpp", Java: "java", JavaScript: "js", TypeScript: "ts",
  Go: "go", Rust: "rs", Bash: "sh", PHP: "php", Ruby: "rb", SQL: "sql",
};

type Row = { l?: string | undefined; r?: string | undefined; ln?: number | undefined; rn?: number | undefined; kind: "same" | "del" | "add" | "mod" };

function buildRows(a: string, b: string): Row[] {
  const parts = diffLines(a, b);
  const rows: Row[] = [];
  let ln = 1, rn = 1;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]!;
    const lines = p.value.replace(/\n$/, "").split("\n");
    if (!p.added && !p.removed) {
      for (const x of lines) rows.push({ l: x, r: x, ln: ln++, rn: rn++, kind: "same" });
    } else if (p.removed && parts[i + 1]?.added) {
      const adds = parts[i + 1]!.value.replace(/\n$/, "").split("\n");
      const n = Math.max(lines.length, adds.length);
      for (let k = 0; k < n; k++) {
        rows.push({
          l: lines[k], r: adds[k],
          ln: lines[k] !== undefined ? ln++ : undefined,
          rn: adds[k] !== undefined ? rn++ : undefined, kind: "mod",
        });
      }
      i++;
    } else if (p.removed) {
      for (const x of lines) rows.push({ l: x, ln: ln++, kind: "del" });
    } else {
      for (const x of lines) rows.push({ r: x, rn: rn++, kind: "add" });
    }
  }
  return rows;
}

export function Results({ data, original }: { data: AnalyzeResponse; original: string }) {
  const { analysis, language } = data;
  const bad = new Set(analysis.errors.map((e) => e.line).filter((n): n is number => typeof n === "number"));
  const rows = useMemo(() => buildRows(original, analysis.fixedCode), [original, analysis.fixedCode]);
  const counts = analysis.errors.reduce<Record<string, number>>((m, e) => ((m[e.severity] = (m[e.severity] ?? 0) + 1), m), {});

  const download = () => {
    const blob = new Blob([analysis.fixedCode], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fixed.${EXT[language] ?? "txt"}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {data.notice && (
        <div className="glass flex items-center gap-3 border-sev-warning/40 p-4 text-sm">
          <Info className="h-4 w-4 shrink-0 text-sev-warning" /> {data.notice}
        </div>
      )}

      <div className="glass flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">{language}</span>
          <span className="text-lg font-semibold">
            {analysis.errors.length ? `${analysis.errors.length} issue${analysis.errors.length > 1 ? "s" : ""} found` : "No issues found"}
          </span>
          {(["CRITICAL", "ERROR", "WARNING", "INFO"] as const).map((s) =>
            counts[s] ? <span key={s} className="flex items-center gap-1"><SeverityBadge s={s} /><span className="font-mono text-xs">×{counts[s]}</span></span> : null,
          )}
        </div>
        <div className="flex gap-2">
          <CopyButton text={analysis.fixedCode} label="Copy fixed code" />
          <button onClick={download} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">
            <Download className="h-3.5 w-3.5" /> Download fixed file
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Your code</h3>
          <div className="glass max-h-[28rem] overflow-auto py-3 font-mono text-[13px] leading-6">
            {original.split("\n").map((l, i) => (
              <div key={i} className={cn("flex", bad.has(i + 1) && "bg-sev-error/15 shadow-[inset_3px_0_0_var(--sev-error)]")}>
                <span className="w-12 shrink-0 pr-3 text-right text-muted-foreground/60 select-none">{i + 1}</span>
                <span className="whitespace-pre pr-4">{l || " "}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">What's wrong</h3>
          <div className="max-h-[28rem] space-y-3 overflow-auto pr-1">
            {analysis.errors.length === 0 && <p className="text-sm text-muted-foreground">Nothing to report. Clean code!</p>}
            {analysis.errors.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="glass p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge s={e.severity} />
                  <span className="font-semibold">{e.type}</span>
                  {e.line ? <span className="ml-auto font-mono text-xs text-muted-foreground">line {e.line}</span> : null}
                </div>
                <p className="mt-2 text-sm">{e.explanation}</p>
                {e.rootCause && <p className="mt-1 text-xs text-muted-foreground">Root cause: {e.rootCause}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {analysis.steps.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Step by step</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.steps.map((s, i) => (
              <div key={i} className="glass glass-hover flex gap-3 p-4 text-sm">
                <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 font-semibold">Diff</h3>
        <div className="glass overflow-auto font-mono text-[12.5px] leading-6">
          <div className="grid min-w-[720px] grid-cols-2 border-b border-border text-xs text-muted-foreground">
            <div className="px-4 py-2">Original</div><div className="border-l border-border px-4 py-2">Fixed</div>
          </div>
          <div className="min-w-[720px]">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-2">
                <div className={cn("flex", (r.kind === "del" || (r.kind === "mod" && r.l !== undefined)) && "bg-diff-del/15 text-diff-del")}>
                  <span className="w-10 shrink-0 pr-2 text-right text-muted-foreground/50 select-none">{r.ln ?? ""}</span>
                  <span className="whitespace-pre px-2">{r.l !== undefined ? (r.kind === "same" ? "  " : "- ") + r.l : ""}</span>
                </div>
                <div className={cn("flex border-l border-border", (r.kind === "add" || (r.kind === "mod" && r.r !== undefined)) && "bg-diff-add/15 text-diff-add")}>
                  <span className="w-10 shrink-0 pr-2 text-right text-muted-foreground/50 select-none">{r.rn ?? ""}</span>
                  <span className="whitespace-pre px-2">{r.r !== undefined ? (r.kind === "same" ? "  " : "+ ") + r.r : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(analysis.changes.length > 0 || analysis.preventionTips.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {analysis.changes.length > 0 && (
            <div className="glass p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-primary" /> Changes</h3>
              <ul className="space-y-3 text-sm">
                {analysis.changes.map((c, i) => (
                  <li key={i}>
                    <code className="block truncate font-mono text-xs text-diff-del">- {c.before}</code>
                    <code className="block truncate font-mono text-xs text-diff-add">+ {c.after}</code>
                    <p className="mt-1 text-muted-foreground">{c.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.preventionTips.length > 0 && (
            <div className="glass p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-primary" /> Prevent it next time</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {analysis.preventionTips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
