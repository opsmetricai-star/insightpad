import Link from "next/link";
import { getCtx } from "@/lib/session";
import { Empty, Notice, PageTitle } from "@/components/app-ui";
import { DatasetSelect } from "@/components/Forms";
import { createSuite, deleteSuite } from "@/lib/actions";

export const metadata = { title: "Evals" };

export default async function Evals({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const [{ data: datasets }, { data: suites }] = await Promise.all([
    c.supabase.from("datasets").select("id, name").eq("workspace_id", c.workspace.id),
    c.supabase.from("eval_suites").select("id, name, datasets(name)").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <PageTitle title="Evals" sub="Write prompts with expected numeric answers and check the agent against them after every change to your context." />
      {sp.error && <Notice tone="error">Choose a dataset to create a suite.</Notice>}
      {datasets?.length ? (
        <form action={createSuite} className="card mb-8 grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="grid gap-1.5 text-sm font-medium">Suite name<input name="name" required className="field" placeholder="Revenue accuracy" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Dataset<DatasetSelect datasets={datasets} /></label>
          <button className="btn btn-solid">New suite</button>
        </form>
      ) : <Empty title="Upload a dataset first" body="Evals run against a dataset." />}
      {suites?.length ? (
        <div className="card divide-y divide-line">
          {suites.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <Link href={`/app/evals/${s.id}`}><span className="font-medium hover:underline">{s.name}</span><span className="block text-sm text-ink-soft">{(s.datasets as unknown as { name: string } | null)?.name}</span></Link>
              <form action={deleteSuite}><input type="hidden" name="id" value={s.id} /><button className="text-sm text-red-600 underline">Delete</button></form>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
