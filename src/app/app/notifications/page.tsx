import Link from "next/link";
import { getCtx } from "@/lib/session";
import { Empty, PageTitle, fmtDate } from "@/components/app-ui";
import { markAllRead } from "@/lib/actions";

export const metadata = { title: "Notifications" };

export default async function Notifications() {
  const c = await getCtx();
  const { data } = await c.supabase.from("notifications").select("id, title, body, read, created_at").eq("user_id", c.user.id).order("created_at", { ascending: false }).limit(100);
  const low = c.sub.credits_total > 0 && c.sub.credits_total - c.sub.credits_used <= c.sub.credits_total * 0.1;
  return (
    <>
      <PageTitle title="Notifications" action={data?.some((n) => !n.read) ? <form action={markAllRead}><button className="btn btn-sm">Mark all read</button></form> : undefined} />
      {low && <p role="status" className="mb-6 border border-amber-300 bg-amber-50 p-3 text-sm">You have used over 90% of your AI credits this period. <Link className="underline" href="/app/billing">Upgrade</Link> to keep going.</p>}
      {data?.length ? (
        <div className="card divide-y divide-line">
          {data.map((n) => (
            <div key={n.id} className={`px-5 py-4 ${n.read ? "" : "bg-rose-bg/50"}`}>
              <p className="font-medium">{n.title}</p>
              {n.body && <p className="mt-1 text-sm text-ink-soft">{n.body}</p>}
              <p className="mt-1 text-xs text-ink-soft">{fmtDate(n.created_at)}</p>
            </div>
          ))}
        </div>
      ) : <Empty title="You are all caught up" body="Plan changes and usage warnings appear here." />}
    </>
  );
}
