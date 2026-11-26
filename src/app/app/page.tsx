import Link from "next/link";
import { getCtx } from "@/lib/session";
import { Empty, PageTitle, fmtDate } from "@/components/app-ui";
import { Btn, Icon } from "@/components/ui";

export default async function Overview() {
  const c = await getCtx();
  const ws = c.workspace.id;
  const count = async (t: string) => (await c.supabase.from(t).select("id", { count: "exact", head: true }).eq("workspace_id", ws)).count ?? 0;
  const [ds, th, nb, ap] = await Promise.all([count("datasets"), count("threads"), count("notebooks"), count("apps")]);
  const { data: recent } = await c.supabase.from("threads").select("id, title, created_at").eq("workspace_id", ws).order("created_at", { ascending: false }).limit(5);
  const stats = [["Datasets", ds, "/app/datasets"], ["Threads", th, "/app/threads"], ["Notebooks", nb, "/app/notebooks"], ["Data apps", ap, "/app/apps"]] as const;
  return (
    <>
      <PageTitle title={`Welcome, ${(c.user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there"}`} sub="Upload data, ask questions, and turn answers into apps." action={<Btn href="/app/threads" sm>Ask a question</Btn>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([l, n, h]) => (
          <Link key={l} href={h} className="card p-5 hover:-translate-y-0.5 transition-transform"><p className="tag-label text-ink-soft">{l}</p><p className="mt-2 font-display text-4xl font-semibold">{n}</p></Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Recent threads</h2>
          {recent?.length ? (
            <div className="card divide-y divide-line">{recent.map((t) => <Link key={t.id} href={`/app/threads/${t.id}`} className="flex justify-between gap-3 px-4 py-3 text-sm hover:bg-paper"><span className="truncate">{t.title}</span><span className="shrink-0 text-ink-soft">{fmtDate(t.created_at)}</span></Link>)}</div>
          ) : (
            <Empty title="No threads yet" body={ds ? "Start a thread to ask your data a question." : "Upload a dataset first, then ask your first question."} action={<Btn href={ds ? "/app/threads" : "/app/datasets"} sm>{ds ? "New thread" : "Upload a dataset"}</Btn>} />
          )}
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Get started</h2>
          <ol className="card divide-y divide-line text-sm">
            {[["Upload a CSV", "/app/datasets", ds > 0], ["Define a metric in Context Studio", "/app/context", false], ["Ask a question in Threads", "/app/threads", th > 0], ["Publish a data app", "/app/apps", ap > 0]].map(([l, h, done]) => (
              <li key={l as string}><Link href={h as string} className="flex items-center gap-3 px-4 py-3 hover:bg-paper"><span className={`grid h-5 w-5 place-items-center border ${done ? "border-mint bg-mint text-white" : "border-ink/40"}`}>{done ? <Icon name="check" size={12} /> : null}</span>{l as string}</Link></li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
