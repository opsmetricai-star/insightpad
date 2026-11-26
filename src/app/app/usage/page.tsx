import { getCtx } from "@/lib/session";
import { Empty, PageTitle, fmtDate } from "@/components/app-ui";

export const metadata = { title: "Usage" };

export default async function Usage() {
  const c = await getCtx();
  const { data: events } = await c.supabase.from("usage_events").select("id, kind, credits, created_at, user_id").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false }).limit(200);
  const byKind = new Map<string, number>();
  (events ?? []).forEach((e) => byKind.set(e.kind, (byKind.get(e.kind) ?? 0) + e.credits));
  const left = Math.max(0, c.sub.credits_total - c.sub.credits_used);
  return (
    <>
      <PageTitle title="Usage" sub="Every AI action and the credits it consumed." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="tag-label text-ink-soft">Credits used</p><p className="mt-2 font-display text-4xl font-semibold">{c.sub.credits_used.toLocaleString()}</p></div>
        <div className="card p-5"><p className="tag-label text-ink-soft">Credits left</p><p className="mt-2 font-display text-4xl font-semibold">{left.toLocaleString()}</p></div>
        <div className="card p-5"><p className="tag-label text-ink-soft">Plan allowance</p><p className="mt-2 font-display text-4xl font-semibold">{c.sub.credits_total.toLocaleString()}</p></div>
      </div>
      {byKind.size > 0 && <div className="mb-8 flex flex-wrap gap-3">{[...byKind].map(([k, v]) => <span key={k} className="border border-line bg-white px-3 py-1.5 text-sm">{k.replace("_", " ")}: <b>{v}</b></span>)}</div>}
      {events?.length ? (
        <div className="card divide-y divide-line">
          {events.map((e) => <div key={e.id} className="flex justify-between gap-4 px-5 py-3 text-sm"><span>{e.kind.replace("_", " ")}</span><span className="font-mono text-ink-soft">{e.credits} credit · {fmtDate(e.created_at)}</span></div>)}
        </div>
      ) : <Empty title="No usage yet" body="Credits are deducted when you ask a question, run an agent cell or run an eval." />}
    </>
  );
}
