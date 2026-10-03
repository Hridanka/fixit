import { Bug, Code2, FileDiff, Gauge, Languages, MessageSquare, ShieldCheck, Sparkles as Spark, Terminal, Wand2, ClipboardPaste, Github } from "lucide-react";
import { Reveal, SectionHeading, CopyButton } from "./common";

const features = [
  { i: Bug, t: "Finds every error", d: "Syntax, runtime, logic and security issues, each with a severity." },
  { i: Wand2, t: "Complete fixed file", d: "Not a snippet — the whole corrected file, ready to paste." },
  { i: FileDiff, t: "Side-by-side diff", d: "See exactly what changed, line by line, in red and green." },
  { i: Languages, t: "12 languages", d: "Python, C, C++, Java, JS, TS, Go, Rust, Bash, PHP, Ruby, SQL." },
  { i: MessageSquare, t: "Ask follow-ups", d: "Chat with an AI that already knows your code and its bugs." },
  { i: ShieldCheck, t: "Safe by design", d: "Your code is never executed. Treated strictly as data." },
  { i: Gauge, t: "Instant rule check", d: "A local knowledge base catches common errors in milliseconds." },
  { i: Code2, t: "Error-output mode", d: "Only have a stack trace? Paste it and get the likely fix." },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24">
      <SectionHeading eyebrow="Features" title="Built for the 2 a.m. bug" sub="Everything you need to go from red terminal to green build." />
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, idx) => (
          <Reveal key={f.t} delay={idx * 0.05}>
            <div className="glass glass-hover h-full p-6">
              <f.i className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { i: ClipboardPaste, t: "Paste", d: "Drop in your code or the error output and pick a language — or let fixit detect it." },
  { i: Spark, t: "Analyze", d: "Rules run first, then the AI finds every issue and explains the root cause." },
  { i: Wand2, t: "Fix", d: "Review the diff, copy or download the fixed file, and ask follow-up questions." },
];

export function HowItWorks() {
  return (
    <section id="how" className="px-4 py-24">
      <SectionHeading eyebrow="How it works" title="Three steps. Zero guesswork." />
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.1}>
            <div className="glass glass-hover relative h-full p-7">
              <span className="font-mono text-5xl font-bold text-primary/20">0{i + 1}</span>
              <s.i className="absolute top-7 right-7 h-6 w-6 text-primary" />
              <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const cmds = [
  { label: "Install", cmd: "pip install fixit-cli" },
  { label: "Fix a file", cmd: "fixit app.py" },
  { label: "Pipe an error", cmd: "python app.py 2>&1 | fixit --error" },
];

export function CliSection() {
  return (
    <section id="cli" className="px-4 py-24">
      <SectionHeading eyebrow="CLI" title="fixit in your terminal" sub="Same brain, no browser. Works anywhere Python runs." />
      <Reveal className="mx-auto max-w-2xl space-y-3">
        {cmds.map((c) => (
          <div key={c.cmd} className="glass flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <code className="block truncate font-mono text-sm"><span className="text-primary">$</span> {c.cmd}</code>
            </div>
            <CopyButton text={c.cmd} />
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2 font-mono text-foreground">
          <Terminal className="h-4 w-4 text-primary" /> fixit
        </div>
        <nav className="flex gap-6">
          <a href="#analyzer" className="hover:text-primary">Analyzer</a>
          <a href="#features" className="hover:text-primary">Features</a>
          <a href="#cli" className="hover:text-primary">CLI</a>
          <a href="https://github.com" className="hover:text-primary" aria-label="GitHub"><Github className="h-4 w-4" /></a>
        </nav>
        <p>© {new Date().getFullYear()} fixit. Your code is never executed.</p>
      </div>
    </footer>
  );
}

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        <a href="#" className="flex items-center gap-2 font-mono font-semibold">
          <Terminal className="h-5 w-5 text-primary" /> fixit<span className="cursor-blink text-primary">_</span>
        </a>
        <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#analyzer" className="hover:text-foreground">Analyzer</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#cli" className="hover:text-foreground">CLI</a>
        </nav>
        <a href="#analyzer" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Fix code</a>
      </div>
    </header>
  );
}
