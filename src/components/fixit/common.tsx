import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/rules";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}

export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/50 hover:text-primary",
        className,
      )}
      aria-label={label}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copied" : label}
    </button>
  );
}

const sevClass: Record<Severity, string> = {
  INFO: "text-sev-info border-sev-info/40 bg-sev-info/10",
  WARNING: "text-sev-warning border-sev-warning/40 bg-sev-warning/10",
  ERROR: "text-sev-error border-sev-error/40 bg-sev-error/10",
  CRITICAL: "text-sev-critical border-sev-critical/50 bg-sev-critical/15",
};
export function SeverityBadge({ s }: { s: Severity }) {
  return (
    <span className={cn("inline-flex rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider", sevClass[s])}>
      {s}
    </span>
  );
}
