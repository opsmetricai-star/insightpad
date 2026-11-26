import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { runPlan, type Column, type Row } from "@/lib/engine";
import ResultView from "@/components/ResultView";
import type { Widget } from "@/lib/actions";
import { Logo } from "@/components/ui";

export const metadata = { title: "Shared app", robots: { index: false } };

// Public, read-only view of a published app. Looked up by an unguessable token with the service role,
// and only returns apps with published = true.
export default async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY || !/^[a-f0-9]{24}$/.test(token)) notFound();
  const admin = createAdminClient();
  const { data: app } = await admin.from("apps").select("title, dataset_id, widgets").eq("share_token", token).eq("published", true).maybeSingle();
  if (!app?.dataset_id) notFound();
  const { data: ds } = await admin.from("datasets").select("columns, rows").eq("id", app.dataset_id).single();
  if (!ds) notFound();
  return (
    <div className="bg-dots min-h-screen px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Logo />
        <h1 className="mt-8 font-display text-4xl font-bold tracking-tight">{app.title}</h1>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {(app.widgets as Widget[]).map((w) => {
            try { return <ResultView key={w.id} plan={w.plan} result={runPlan(w.plan, ds.rows as Row[], ds.columns as Column[])} />; } catch { return null; }
          })}
        </div>
        <p className="mt-10 text-sm text-ink-soft">Built with InsightPad</p>
      </div>
    </div>
  );
}
