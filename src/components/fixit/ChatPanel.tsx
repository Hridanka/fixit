import { useEffect, useRef, useState, type ComponentProps } from "react";
import { AnimatePresence, motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Send, Square, X, MessageSquareCode } from "lucide-react";
import { CopyButton } from "./common";
import { useFixit } from "./context";

type Msg = { role: "user" | "assistant"; content: string };
const SUGGESTIONS = ["Explain this error simply", "Why did this happen?", "Optimize my code"];

function Pre(props: ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [text, setText] = useState("");
  useEffect(() => setText(ref.current?.innerText ?? ""), [props.children]);
  return (
    <div className="relative my-2">
      <pre ref={ref} {...props} className="overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs" />
      <CopyButton text={text} className="absolute top-2 right-2 px-2 py-1" />
    </div>
  );
}

export function ChatPanel() {
  const { code, result } = useFixit();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (open && !busy) taRef.current?.focus(); }, [open, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput(""); setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
        body: JSON.stringify({
          messages: next.slice(-20), code,
          language: result?.language ?? "",
          analysis: result ? JSON.stringify(result.analysis).slice(0, 40000) : "",
        }),
      });
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "The assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]);
      }
      if (!acc) setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: "_No answer was returned._" }]);
    } catch (e) {
      const stopped = (e as Error).name === "AbortError";
      setMsgs((m) => {
        const last = m[m.length - 1];
        const note = stopped ? "\n\n_Stopped._" : `⚠️ ${(e as Error).message}`;
        return [...m.slice(0, -1), { role: "assistant", content: (stopped ? (last?.content ?? "") : "") + note }];
      });
    } finally {
      setBusy(false); abortRef.current = null;
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="glass fixed right-4 bottom-24 z-50 flex h-[min(600px,75vh)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden glow"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary"><Bot className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold">fixit assistant</p>
                  <p className="text-[11px] text-muted-foreground">{result ? "Knows your code & analysis" : "Run an analysis for context"}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
              {msgs.length === 0 && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Ask anything about your code or the fix.</p>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="block w-full rounded-lg border border-border px-3 py-2 text-left transition hover:border-primary/50 hover:text-primary">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {msgs.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">{m.content}</div>
                ) : (
                  <div key={i} className="max-w-full leading-relaxed [&_code]:font-mono [&_code]:text-primary [&_li]:ml-4 [&_ol]:list-decimal [&_p]:my-2 [&_pre_code]:text-foreground [&_ul]:list-disc">
                    {m.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: Pre }}>{m.content}</ReactMarkdown>
                    ) : (
                      <span className="inline-flex gap-1">
                        {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d * 0.15}s` }} />)}
                      </span>
                    )}
                  </div>
                ),
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-border p-3">
              <textarea
                ref={taRef} value={input} rows={1} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask a follow-up…" aria-label="Message"
                className="max-h-32 flex-1 resize-none rounded-lg border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
              {busy ? (
                <button type="button" onClick={() => abortRef.current?.abort()} aria-label="Stop" className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-primary/50"><Square className="h-4 w-4" /></button>
              ) : (
                <button type="submit" disabled={!input.trim()} aria-label="Send" className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" /></button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)} aria-label="Open AI chat"
        className="fixed right-4 bottom-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground glow transition hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquareCode className="h-6 w-6" />}
      </button>
    </>
  );
}
