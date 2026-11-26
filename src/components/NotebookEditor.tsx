"use client";
import { useState, useTransition } from "react";
import ResultView from "./ResultView";
import { runCell, saveNotebook, setNotebookDataset, type Cell } from "@/lib/actions";
import { fmtDate } from "./app-ui";

const uid = () => crypto.randomUUID();

export default function NotebookEditor({ id, title: t0, datasetId, initialCells, datasets, versions, readOnly }: {
  id: string; title: string; datasetId: string | null; initialCells: Cell[]; datasets: { id: string; name: string }[];
  versions: { id: string; created_at: string; cells: Cell[] }[]; readOnly?: boolean;
}) {
  const [title, setTitle] = useState(t0);
  const [cells, setCells] = useState<Cell[]>(initialCells);
  const [ds, setDs] = useState(datasetId ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();

  const patch = (cid: string, p: Partial<Cell>) => setCells((cs) => cs.map((c) => (c.id === cid ? ({ ...c, ...p } as Cell) : c)));
  const add = (type: Cell["type"]) => setCells((cs) => [...cs, type === "markdown" ? { id: uid(), type, text: "" } : { id: uid(), type, text: "" }]);
  const move = (i: number, d: number) => setCells((cs) => { const n = [...cs]; const j = i + d; if (j < 0 || j >= n.length) return cs; [n[i], n[j]] = [n[j], n[i]]; return n; });

  async function run(cell: Cell) {
    setBusy(cell.id);
    const r = await runCell(id, cell);
    setBusy(null);
    if (r.error !== undefined) patch(cell.id, { output: { error: r.error } } as Partial<Cell>);
    else setCells((cs) => cs.map((c) => (c.id === cell.id ? r.cell : c)));
  }

  function save() {
    startSave(async () => {
      const r = await saveNotebook(id, title, cells);
      setStatus(r.error ? `Save failed: ${r.error}` : `Saved ${new Date().toLocaleTimeString()}`);
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={readOnly} aria-label="Notebook title" className="min-w-0 flex-1 bg-transparent font-display text-3xl font-bold tracking-tight outline-none focus:underline" />
        <select value={ds} disabled={readOnly} aria-label="Dataset" onChange={async (e) => { setDs(e.target.value); await setNotebookDataset(id, e.target.value); }} className="field w-auto">
          <option value="">Choose dataset…</option>
          {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {!readOnly && <button onClick={save} disabled={saving} className="btn btn-solid disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>}
      </div>
      {status && <p role="status" className="mb-4 text-sm text-ink-soft">{status}</p>}
      {!ds && <p className="mb-4 border border-line bg-white p-3 text-sm">Choose a dataset to run question and agent cells.</p>}

      <div className="space-y-5">
        {cells.map((c, i) => (
          <section key={c.id} className="card">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="tag-label text-ink-soft">{c.type === "markdown" ? "Markdown" : c.type === "question" ? "Question" : "Agent"}</span>
              {!readOnly && (
                <div className="flex items-center gap-3 text-xs">
                  <button onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                  <button onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                  {c.type !== "markdown" && <button onClick={() => run(c)} disabled={busy === c.id || !ds} className="btn btn-sm disabled:opacity-50">{busy === c.id ? "Running…" : "Run"}</button>}
                  <button onClick={() => setCells((cs) => cs.filter((x) => x.id !== c.id))} className="text-red-600" aria-label="Delete cell">Delete</button>
                </div>
              )}
            </div>
            <div className="p-4">
              <textarea value={c.text} readOnly={readOnly} onChange={(e) => patch(c.id, { text: e.target.value } as Partial<Cell>)} rows={c.type === "markdown" ? 4 : 2}
                placeholder={c.type === "markdown" ? "Notes in markdown…" : c.type === "question" ? "Ask a question, e.g. total revenue by region" : "Give the agent a task, e.g. compare monthly revenue trends and find the top 3 regions"}
                className="field font-mono text-[13px]" />
              {c.type === "question" && c.output && ("error" in c.output ? <p role="alert" className="mt-3 text-sm text-red-600">{c.output.error}</p> : (
                <div className="mt-4 space-y-3">{c.output.summary && <p className="text-[15px]">{c.output.summary}</p>}<ResultView plan={c.output.plan} result={c.output.result} /></div>
              ))}
              {c.type === "agent" && c.output && ("error" in c.output ? <p role="alert" className="mt-3 text-sm text-red-600">{c.output.error}</p> : (
                <div className="mt-4 space-y-3">
                  <p className="whitespace-pre-wrap text-[15px]">{c.output.markdown}</p>
                  {c.output.results.length === 0 && <p className="text-sm text-ink-soft">The agent did not produce a valid query plan for this task.</p>}
                  {c.output.results.map((r, k) => <ResultView key={k} plan={r.plan} result={r.result} compact />)}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => add("markdown")} className="btn btn-sm">+ Markdown</button>
          <button onClick={() => add("question")} className="btn btn-sm">+ Question (1 credit)</button>
          <button onClick={() => add("agent")} className="btn btn-sm">+ Agent (2 credits)</button>
        </div>
      )}

      {versions.length > 0 && (
        <details className="mt-10 text-sm">
          <summary className="cursor-pointer text-ink-soft underline">Version history ({versions.length})</summary>
          <ul className="mt-3 divide-y divide-line border border-line bg-white">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between px-4 py-2.5">
                <span>{fmtDate(v.created_at)} · {v.cells.length} cells</span>
                {!readOnly && <button className="underline" onClick={() => { setCells(v.cells); setStatus("Restored a previous version. Save to keep it."); }}>Restore</button>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
