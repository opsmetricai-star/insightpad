import Link from "next/link";
import { notFound } from "next/navigation";
import { getCtx } from "@/lib/session";
import { loadDataset } from "@/lib/run";
import { runPlan } from "@/lib/engine";
import ResultView from "@/components/ResultView";
import AppBuilder from "@/components/AppBuilder";
import type { Widget } from "@/lib/actions";
import { PageTitle } from "@/components/app-ui";

export default async function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCtx();
  const { data: app } = await c.supabase.from("apps").select("id, title, dataset_id, widgets, published, share_token").eq("id", id).eq("workspace_id", c.workspace.id).maybeSingle();
  if (!app || !app.dataset_id) notFound();
  const ds = await loadDataset(c.supabase, c.workspace.id, app.dataset_id);
  const widgets = app.widgets as Widget[];
  return (
    <>
      <p className="mb-4 text-sm"><Link href="/app/apps" className="underline">← Data apps</Link></p>
      <PageTitle title={app.title} sub={`Dataset: ${ds.name}. Widgets are recomputed from the data every time the app loads.`} />
      <AppBuilder appId={app.id} published={app.published} shareToken={app.share_token} readOnly={c.role === "viewer"} />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {widgets.map((w) => {
          let body;
          try { body = <ResultView plan={w.plan} result={runPlan(w.plan, ds.rows, ds.columns)} />; } catch (e) { body = <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{e instanceof Error ? e.message : "Widget failed"}</p>; }
          return <div key={w.id}>{body}{c.role !== "viewer" && <RemoveButton appId={app.id} widgetId={w.id} />}</div>;
        })}
      </div>
    </>
  );
}

import { removeWidget } from "@/lib/actions";
function RemoveButton({ appId, widgetId }: { appId: string; widgetId: string }) {
  return <form action={async () => { "use server"; await removeWidget(appId, widgetId); }}><button className="mt-2 text-xs text-red-600 underline">Remove widget</button></form>;
}
