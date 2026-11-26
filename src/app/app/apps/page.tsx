import Link from "next/link";
import { getCtx } from "@/lib/session";
import { Empty, Notice, PageTitle } from "@/components/app-ui";
import { DatasetSelect } from "@/components/Forms";
import { createApp, deleteApp } from "@/lib/actions";

export const metadata = { title: "Data apps" };

export default async function Apps({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const [{ data: datasets }, { data: apps }] = await Promise.all([
    c.supabase.from("datasets").select("id, name").eq("workspace_id", c.workspace.id),
    c.supabase.from("apps").select("id, title, published, widgets").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <PageTitle title="Data apps" sub={`Compose answers into a dashboard and share it by link. ${c.plan.limits.apps >= 9999 ? "Unlimited" : `Up to ${c.plan.limits.apps}`} published app(s) on your plan.`} />
      {sp.error && <Notice tone="error">Choose a dataset to create an app.</Notice>}
      {datasets?.length ? (
        <form action={createApp} className="card mb-8 grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="grid gap-1.5 text-sm font-medium">Title<input name="title" required className="field" placeholder="Revenue overview" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Dataset<DatasetSelect datasets={datasets} /></label>
          <button className="btn btn-solid">New app</button>
        </form>
      ) : <Empty title="Upload a dataset first" body="Apps are built from questions answered by a dataset." />}
      {apps?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((a) => (
            <div key={a.id} className="card p-5">
              <Link href={`/app/apps/${a.id}`} className="font-display text-lg font-semibold hover:underline">{a.title}</Link>
              <p className="mt-1 text-sm text-ink-soft">{(a.widgets as unknown[]).length} widgets · {a.published ? "Published" : "Draft"}</p>
              <form action={deleteApp} className="mt-4"><input type="hidden" name="id" value={a.id} /><button className="text-sm text-red-600 underline">Delete</button></form>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
