import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Check, Loader2, Wand2, AlertTriangle, Clock, FileCode2 } from "lucide-react";
import { LANGUAGES } from "@/lib/rules";
import type { AnalyzeResponse } from "@/lib/analysis";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./common";
import { Results } from "./Results";
import { useFixit } from "./context";

const SAMPLE = `def total_price(items):
    total = 0
    for item in items
        total += item["price"] * item["qty"]
    print("Total: " + total)
    return totl
`;

function LanguageSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const opts = ["Auto-detect", ...LANGUAGES];
  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}
        className="glass flex w-48 items-center justify-between px-3 py-2 text-sm transition hover:border-primary/40"
      >
        <span className="font-mono">{value}</span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute z-30 mt-2 max-h-72 w-48 overflow-auto rounded-xl border border-border bg-popover p-1 shadow-2xl"
          >
            {opts.map((o) => (
              <li key={o}>
                <button
                  type="button" role="option" aria-selected={o === value}
                  onClick={() => { onChange(o); setOpen(false); }}
                  className={cn("flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left font-mono text-sm hover:bg-accent", o === value && "text-primary")}
                >
                  {o} {o === value && <Check className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Editor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const gutter = useRef<HTMLDivElement>(null);
  const count = Math.max(value.split("\n").length, 14);
  return (
    <div className="glass flex h-80 overflow-hidden font-mono text-[13px] leading-6 sm:h-96">
      <div ref={gutter} aria-hidden className="select-none overflow-hidden border-r border-border px-3 py-3 text-right text-muted-foreground/60">
        {Array.from({ length: count }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        spellCheck={false} aria-label="Code input" placeholder="// Paste your code or error output here…"
        className="flex-1 resize-none bg-transparent px-4 py-3 whitespace-pre text-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

const STEPS = ["Reading code…", "Finding errors…", "Writing fix…"];

export function Analyzer() {
  const { code, setCode, result, setResult } = useFixit();
  const [language, setLanguage] = useState("Auto-detect");
  const [inputType, setInputType] = useState<"code" | "error">("code");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<{ kind: "rate" | "err"; msg: string } | null>(null);
  const [submitted, setSubmitted] = useState("");

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2200);
    return () => clearInterval(t);
  }, [loading]);

  const tooBig = new Blob([code]).size > 50 * 1024;

  async function run() {
    if (!code.trim() || tooBig) return;
    setLoading(true); setError(null); setResult(null); setSubmitted(code);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, inputType, content: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) setError({ kind: "rate", msg: data.message ?? "Slow down a little." });
      else if (!res.ok) setError({ kind: "err", msg: data.message ?? "Something went wrong." });
      else setResult(data as AnalyzeResponse);
    } catch {
      setError({ kind: "err", msg: "Network error. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="analyzer" className="scroll-mt-24 px-4 py-24">
      <SectionHeading eyebrow="Live analyzer" title="Drop your broken code here" sub="Pick a language, paste, and hit fix." />
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelect value={language} onChange={setLanguage} />
            <div className="glass flex items-center p-1 text-sm" role="radiogroup" aria-label="Input type">
              <span className="px-2 text-muted-foreground">I'm pasting:</span>
              {(["code", "error"] as const).map((t) => (
                <button
                  key={t} type="button" role="radio" aria-checked={inputType === t} onClick={() => setInputType(t)}
                  className={cn("rounded-md px-3 py-1 transition", inputType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {t === "code" ? "Code" : "Error output"}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => { setCode(SAMPLE); setLanguage("Python"); setInputType("code"); }} className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
            Load a buggy example
          </button>
        </div>

        <Editor value={code} onChange={setCode} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className={cn("font-mono text-xs", tooBig ? "text-sev-critical" : "text-muted-foreground")}>
            {(new Blob([code]).size / 1024).toFixed(1)} KB / 50 KB {tooBig && "— too large"}
          </p>
          <button
            type="button" onClick={run} disabled={loading || !code.trim() || tooBig}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Fix it with AI
          </button>
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass mx-auto max-w-md p-6 font-mono text-sm">
                {STEPS.map((s, i) => (
                  <div key={s} className={cn("flex items-center gap-3 py-1.5 transition", i > step && "opacity-30")}>
                    {i < step ? <Check className="h-4 w-4 text-primary" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4" />}
                    {s}
                  </div>
                ))}
              </motion.div>
            )}
            {!loading && error && (
              <motion.div key="err" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto flex max-w-md items-start gap-3 p-6">
                {error.kind === "rate" ? <Clock className="h-5 w-5 shrink-0 text-sev-warning" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-sev-error" />}
                <div>
                  <p className="font-semibold">{error.kind === "rate" ? "Easy there, speed-runner" : "That didn't work"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error.msg}</p>
                </div>
              </motion.div>
            )}
            {!loading && !error && result && <Results key="res" data={result} original={submitted} />}
            {!loading && !error && !result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-md text-center text-muted-foreground">
                <FileCode2 className="mx-auto h-10 w-10 text-primary/50" />
                <p className="mt-3">No bugs yet. Paste something broken — we don't judge.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
