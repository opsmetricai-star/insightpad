import Link from "next/link";
import { getCtx } from "@/lib/session";
import { Empty, Notice, PageTitle, fmtDate } from "@/components/app-ui";
import { DatasetSelect } from "@/components/Forms";
import { createThread, deleteThread } from "@/lib/actions";
import { Btn } from "@/components/ui";

export const metadata = { title: "Threads" };

export default async function Threads({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const [{ data: datasets }, { data: threads }] = await Promise.all([
    c.supabase.from("datasets").select("id, name").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false }),
    c.supabase.from("threads").select("id, title, created_at, datasets(name)").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <PageTitle title="Threads" sub="Ask questions in plain language. Every answer shows the query plan that produced it." />
      {sp.error && <Notice tone="error">Pick a dataset to start a thread.</Notice>}
      {datasets?.length ? (
        <form action={createThread} className="card mb-8 flex flex-wrap items-end gap-4 p-6">
          <label className="grid min-w-[240px] flex-1 gap-1.5 text-sm font-medium">Dataset<DatasetSelect datasets={datasets} /></label>
          <button className="btn btn-solid">New thread</button>
        </form>
      ) : <Empty title="Upload a dataset first" body="Threads answer questions about a dataset." action={<Btn href="/app/datasets" sm>Go to datasets</Btn>} />}
      {threads?.length ? (
        <div className="card divide-y divide-line">
          {threads.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <Link href={`/app/threads/${t.id}`} className="min-w-0">
                <span className="block truncate font-medium hover:underline">{t.title}</span>
                <span className="text-sm text-ink-soft">{(t.datasets as unknown as { name: string } | null)?.name ?? "No dataset"} · {fmtDate(t.created_at)}</span>
              </Link>
              <form action={deleteThread}><input type="hidden" name="id" value={t.id} /><button className="text-sm text-red-600 underline">Delete</button></form>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
