import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Terminal } from "lucide-react";

const HEADLINE = "Paste the bug. Get the fix.";

function useTyping(text: string, speed = 55) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), speed);
    return () => clearTimeout(t);
  }, [n, text, speed]);
  return text.slice(0, n);
}

const lines: { t: string; c: string; d: number }[] = [
  { t: "$ python app.py", c: "text-foreground", d: 0.3 },
  { t: "  File \"app.py\", line 4", c: "text-muted-foreground", d: 0.7 },
  { t: "TypeError: can only concatenate str (not \"int\") to str", c: "text-sev-error", d: 1.0 },
  { t: "$ fixit app.py", c: "text-foreground", d: 1.6 },
  { t: "✓ 1 error found · line 4 · ERROR", c: "text-primary", d: 2.1 },
  { t: "- print(\"Total: \" + total)", c: "text-diff-del", d: 2.5 },
  { t: "+ print(f\"Total: {total}\")", c: "text-diff-add", d: 2.8 },
  { t: "✓ fixed in 1.2s", c: "text-primary", d: 3.2 },
];

export function Hero() {
  const typed = useTyping(HEADLINE);
  return (
    <section className="relative px-4 pt-28 pb-20 sm:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass inline-flex items-center gap-2 px-3 py-1 font-mono text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary glow" /> AI error finder for 12 languages
          </motion.span>
          <h1 className="mt-6 min-h-[2.3em] text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {typed}
            <span className="cursor-blink ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-primary" />
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            fixit reads your code or stack trace, finds every error, and hands back the complete corrected file with plain-English explanations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#analyzer" className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground glow transition hover:brightness-110">
              Try it now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a href="#cli" className="glass inline-flex items-center gap-2 px-5 py-3 font-medium transition hover:border-primary/40">
              <Terminal className="h-4 w-4" /> Install CLI
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="glass overflow-hidden glow"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-sev-critical/80" />
            <span className="h-3 w-3 rounded-full bg-sev-warning/80" />
            <span className="h-3 w-3 rounded-full bg-diff-add/80" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">~/project — zsh</span>
          </div>
          <div className="space-y-1.5 p-5 font-mono text-[13px] leading-relaxed">
            {lines.map((l) => (
              <motion.div key={l.t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: l.d }} className={l.c}>
                {l.t}
              </motion.div>
            ))}
            <div className="text-foreground">$ <span className="cursor-blink inline-block h-4 w-2 translate-y-0.5 bg-primary" /></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
