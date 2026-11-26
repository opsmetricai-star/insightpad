import Link from "next/link";
import { getCtx } from "@/lib/session";
import { Empty, Notice, PageTitle, fmtDate } from "@/components/app-ui";
import { createNotebook, deleteNotebook } from "@/lib/actions";

export const metadata = { title: "Notebooks" };

export default async function Notebooks({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const [{ data: datasets }, { data: list }] = await Promise.all([
    c.supabase.from("datasets").select("id, name").eq("workspace_id", c.workspace.id),
    c.supabase.from("notebooks").select("id, title, updated_at").eq("workspace_id", c.workspace.id).order("updated_at", { ascending: false }),
  ]);
  return (
    <>
      <PageTitle title="Notebooks" sub="Mix markdown, question cells and agent cells in one reactive document." />
      {sp.error && <Notice tone="error">Could not create the notebook. Try again.</Notice>}
      <form action={createNotebook} className="card mb-8 grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="grid gap-1.5 text-sm font-medium">Title<input name="title" required className="field" placeholder="Revenue deep dive" /></label>
        <label className="grid gap-1.5 text-sm font-medium">Dataset
          <select name="dataset_id" className="field"><option value="">None yet</option>{datasets?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        </label>
        <button className="btn btn-solid">New notebook</button>
      </form>
      {list?.length ? (
        <div className="card divide-y divide-line">
          {list.map((n) => (
            <div key={n.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <Link href={`/app/notebooks/${n.id}`}><span className="font-medium hover:underline">{n.title}</span><span className="block text-sm text-ink-soft">Edited {fmtDate(n.updated_at)}</span></Link>
              <form action={deleteNotebook}><input type="hidden" name="id" value={n.id} /><button className="text-sm text-red-600 underline">Delete</button></form>
            </div>
          ))}
        </div>
      ) : <Empty title="No notebooks yet" body="Create one to combine notes with questions your data can answer." />}
    </>
  );
}
