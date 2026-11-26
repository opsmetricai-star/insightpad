import { getCtx } from "@/lib/session";
import { Empty, PageTitle } from "@/components/app-ui";
import { ActionForm } from "@/components/Forms";
import { addContext, deleteContext, toggleEndorse } from "@/lib/actions";

export const metadata = { title: "Context Studio" };

export default async function Context() {
  const c = await getCtx();
  const [{ data: items }, { data: datasets }, { data: flagged }, { data: usage }] = await Promise.all([
    c.supabase.from("context_items").select("id, kind, name, definition, endorsed, datasets(name)").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false }),
    c.supabase.from("datasets").select("id, name").eq("workspace_id", c.workspace.id),
    c.supabase.from("thread_messages").select("id, content, thread_id").eq("workspace_id", c.workspace.id).eq("flagged", true).order("created_at", { ascending: false }).limit(5),
    c.supabase.from("usage_events").select("kind, credits").eq("workspace_id", c.workspace.id).limit(1000),
  ]);
  const questions = (usage ?? []).filter((u) => u.kind === "question").length;
  return (
    <>
      <PageTitle title="Context Studio" sub="Governed definitions are injected into every AI request, so the same words always mean the same thing." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[["Definitions", items?.length ?? 0], ["Endorsed", items?.filter((i) => i.endorsed).length ?? 0], ["Questions asked", questions]].map(([l, n]) => <div key={l as string} className="card p-5"><p className="tag-label text-ink-soft">{l}</p><p className="mt-2 font-display text-4xl font-semibold">{n}</p></div>)}
      </div>
      <section className="card mb-8 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Add a definition</h2>
        <ActionForm action={addContext} submit="Save definition" className="grid max-w-2xl gap-4" success="Saved.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">Type<select name="kind" className="field"><option value="metric">Metric</option><option value="term">Glossary term</option><option value="dataset_note">Dataset note</option></select></label>
            <label className="grid gap-1.5 text-sm font-medium">Applies to<select name="dataset_id" className="field"><option value="">All datasets</option>{datasets?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium">Name<input name="name" required className="field" placeholder="Active customer" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Definition<textarea name="definition" required rows={3} className="field" placeholder="A customer whose account_status is Active. Revenue means the sum of the amount column." /></label>
        </ActionForm>
      </section>
      {items?.length ? (
        <div className="card divide-y divide-line">
          {items.map((i) => (
            <div key={i.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0 max-w-2xl">
                <p className="font-medium">{i.name} <span className="tag-label ml-2 border border-line px-1.5 py-0.5 text-ink-soft">{i.kind.replace("_", " ")}</span> {!i.endorsed && <span className="tag-label ml-1 text-red-600">NOT ENDORSED</span>}</p>
                <p className="mt-1 text-sm text-ink-soft">{i.definition}</p>
                <p className="mt-1 text-xs text-ink-soft">{(i.datasets as unknown as { name: string } | null)?.name ?? "All datasets"}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <form action={toggleEndorse}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="endorsed" value={String(i.endorsed)} /><button className="underline">{i.endorsed ? "Unendorse" : "Endorse"}</button></form>
                <form action={deleteContext}><input type="hidden" name="id" value={i.id} /><button className="text-red-600 underline">Delete</button></form>
              </div>
            </div>
          ))}
        </div>
      ) : <Empty title="No definitions yet" body="Add your first metric. Only endorsed items are sent to the model." />}
      <h2 className="mb-3 mt-10 font-display text-lg font-semibold">Answers flagged as wrong</h2>
      {flagged?.length ? <div className="card divide-y divide-line">{flagged.map((f) => <a key={f.id} href={`/app/threads/${f.thread_id}`} className="block px-5 py-3 text-sm hover:bg-paper">{f.content || "(no text)"}</a>)}</div> : <p className="text-sm text-ink-soft">None. Flag an answer in a thread and it shows up here as a context gap to fix.</p>}
    </>
  );
}
