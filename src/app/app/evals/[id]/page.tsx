import Link from "next/link";
import { notFound } from "next/navigation";
import { getCtx } from "@/lib/session";
import { PageTitle, fmtDate } from "@/components/app-ui";
import { ActionForm } from "@/components/Forms";
import RunSuite from "@/components/RunSuite";
import { addCase, deleteCase } from "@/lib/actions";

type R = { case_id: string; prompt: string; expected: number; actual: number | null; passed: boolean; error?: string };

export default async function SuitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCtx();
  const { data: s } = await c.supabase.from("eval_suites").select("id, name, datasets(name)").eq("id", id).eq("workspace_id", c.workspace.id).maybeSingle();
  if (!s) notFound();
  const [{ data: cases }, { data: runs }] = await Promise.all([
    c.supabase.from("eval_cases").select("id, prompt, expected, tolerance").eq("suite_id", id).order("created_at"),
    c.supabase.from("eval_runs").select("id, passed, failed, credits, results, created_at").eq("suite_id", id).order("created_at", { ascending: false }).limit(10),
  ]);
  const last = runs?.[0];
  return (
    <>
      <p className="mb-4 text-sm"><Link href="/app/evals" className="underline">← Evals</Link></p>
      <PageTitle title={s.name} sub={`Dataset: ${(s.datasets as unknown as { name: string } | null)?.name}. Each case costs 1 credit per run. Tolerance is relative (0.01 means 1%).`} action={<RunSuite suiteId={id} disabled={!cases?.length} />} />
      <section className="card mb-8 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Add a case</h2>
        <ActionForm action={addCase} submit="Add case" className="grid max-w-2xl gap-4" success="Added.">
          <input type="hidden" name="suite_id" value={id} />
          <label className="grid gap-1.5 text-sm font-medium">Prompt<input name="prompt" required className="field" placeholder="What is the total revenue?" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">Expected value<input name="expected" type="number" step="any" required className="field" /></label>
            <label className="grid gap-1.5 text-sm font-medium">Tolerance<input name="tolerance" type="number" step="any" min="0" max="1" defaultValue="0.01" className="field" /></label>
          </div>
        </ActionForm>
      </section>
      <h2 className="mb-3 font-display text-lg font-semibold">Cases ({cases?.length ?? 0})</h2>
      <div className="card mb-8 divide-y divide-line">
        {cases?.length ? cases.map((k) => (
          <div key={k.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <span>{k.prompt} <span className="ml-2 font-mono text-ink-soft">= {Number(k.expected).toLocaleString()} ±{Number(k.tolerance) * 100}%</span></span>
            <form action={deleteCase}><input type="hidden" name="id" value={k.id} /><input type="hidden" name="suite_id" value={id} /><button className="text-red-600 underline">Remove</button></form>
          </div>
        )) : <p className="px-5 py-4 text-sm text-ink-soft">No cases yet.</p>}
      </div>
      {last && (
        <>
          <h2 className="mb-3 font-display text-lg font-semibold">Latest run · {fmtDate(last.created_at)}</h2>
          <div className="mb-3 flex gap-3 text-sm"><span className="bg-mint/15 px-2 py-0.5 text-mint">{last.passed} passed</span><span className="bg-red-100 px-2 py-0.5 text-red-700">{last.failed} failed</span><span className="text-ink-soft">{last.credits} credits</span></div>
          <div className="card divide-y divide-line">
            {(last.results as R[]).map((r) => (
              <div key={r.case_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>{r.prompt}</span>
                <span className="font-mono text-[13px]">{r.error ? <span className="text-red-600">{r.error}</span> : <>expected {r.expected.toLocaleString()} · got {r.actual === null ? "n/a" : r.actual.toLocaleString()}</>} <b className={r.passed ? "text-mint" : "text-red-600"}>{r.passed ? "PASS" : "FAIL"}</b></span>
              </div>
            ))}
          </div>
          {runs && runs.length > 1 && <p className="mt-4 text-sm text-ink-soft">History: {runs.map((r) => `${r.passed}/${r.passed + r.failed}`).join(" · ")}</p>}
        </>
      )}
    </>
  );
}
