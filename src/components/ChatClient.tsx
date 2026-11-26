"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import ResultView from "./ResultView";
import { askThread, flagMessage, type ChatMsg } from "@/lib/actions";

export default function ChatClient({ threadId, initial, suggestions, disabled }: { threadId: string; initial: ChatMsg[]; suggestions: string[]; disabled?: boolean }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(initial);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, pending]);

  function send(text: string) {
    const question = text.trim();
    if (question.length < 2 || pending) return;
    setError("");
    setQ("");
    const temp: ChatMsg = { id: "tmp-" + crypto.randomUUID(), role: "user", content: question, plan: null, result: null, credits: 0, flagged: false };
    setMsgs((m) => [...m, temp]);
    start(async () => {
      const r = await askThread(threadId, question);
      if (r.error !== undefined) { setError(r.error); setMsgs((m) => m.filter((x) => x.id !== temp.id)); setQ(question); return; }
      setMsgs((m) => [...m.filter((x) => x.id !== temp.id), ...r.messages]);
    });
  }

  return (
    <div className="mt-6">
      <div className="space-y-4" aria-live="polite">
        {msgs.length === 0 && (
          <div className="border border-dashed border-ink/30 bg-white/60 p-6 text-sm">
            <p className="mb-3 text-ink-soft">Try a question:</p>
            <div className="flex flex-wrap gap-2">{suggestions.map((s) => <button key={s} onClick={() => send(s)} disabled={disabled} className="border border-line bg-white px-3 py-1.5 hover:border-ink">{s}</button>)}</div>
          </div>
        )}
        {msgs.map((m) => m.role === "user" ? (
          <div key={m.id} className="flex justify-end"><p className="max-w-[85%] bg-ink px-4 py-2.5 text-sm text-white">{m.content}</p></div>
        ) : (
          <div key={m.id} className="space-y-3">
            {m.content && <p className="max-w-[90%] border border-line bg-white px-4 py-3 text-[15px] leading-relaxed">{m.content}</p>}
            {m.plan && m.result && <ResultView plan={m.plan} result={m.result} />}
            <div className="flex items-center gap-4 text-xs text-ink-soft">
              <span>{m.credits} credit</span>
              <button className="underline" onClick={() => { const next = !m.flagged; setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, flagged: next } : x))); flagMessage(m.id, next); }}>{m.flagged ? "Flagged as wrong. Undo" : "Flag as wrong"}</button>
            </div>
          </div>
        ))}
        {pending && <div className="flex items-center gap-2 text-sm text-ink-soft"><span className="h-2 w-2 animate-pulse rounded-full bg-violet" /> Planning the query and computing the result…</div>}
        <div ref={end} />
      </div>
      {error && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="sticky bottom-4 mt-6 flex gap-2 border border-ink bg-white p-2 shadow-lg">
        <input value={q} onChange={(e) => setQ(e.target.value)} disabled={disabled || pending} maxLength={1000} placeholder={disabled ? "Viewers cannot ask questions" : "Ask a question about this dataset…"} aria-label="Question" className="min-w-0 flex-1 bg-transparent px-3 py-2 outline-none" />
        <button disabled={disabled || pending || q.trim().length < 2} className="btn btn-solid disabled:opacity-50">Ask</button>
      </form>
    </div>
  );
}
