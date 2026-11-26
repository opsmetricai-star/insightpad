import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, Logo } from "@/components/ui";
import AppNav from "@/components/AppNav";
import { getCtx } from "@/lib/session";
import { supabaseConfigured } from "@/lib/supabase/env";
import { signOut } from "@/lib/auth-actions";

export const metadata = { title: { default: "Workspace", template: "%s | InsightPad" } };

function SetupNotice() {
  return (
    <div className="bg-dots grid min-h-screen place-items-center px-5">
      <div className="card max-w-xl p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">Your workspace is temporarily unavailable</h1>
        <p className="mt-3 text-ink-soft">We could not reach the data service. Please try again in a few minutes.</p>
        <Link href="/" className="btn mt-6">Back to site</Link>
      </div>
    </div>
  );
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!supabaseConfigured()) return <SetupNotice />;
  const c = await getCtx();
  const { count: unread } = await c.supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", c.user.id).eq("read", false);
  const left = Math.max(0, c.sub.credits_total - c.sub.credits_used);
  const pct = c.sub.credits_total ? Math.min(100, (c.sub.credits_used / c.sub.credits_total) * 100) : 0;
  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-b border-line bg-paper-2 md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5"><Logo size={22} /><span className="tag-label border border-line bg-white px-1.5 py-0.5 text-[10px]">{c.plan.name}</span></div>
        <p className="truncate px-5 pb-3 text-sm text-ink-soft">{c.workspace.name}</p>
        <AppNav unread={unread ?? 0} isAdmin={c.isAdmin} />
        <div className="mx-4 my-5 border border-line bg-white p-3 text-xs">
          <div className="flex justify-between"><span>AI credits</span><span className="font-mono">{left.toLocaleString()} left</span></div>
          <div className="mt-2 h-1.5 bg-line"><div className="h-full bg-violet" style={{ width: `${pct}%` }} /></div>
          <Link href="/app/billing" className="mt-3 inline-block underline">Upgrade plan</Link>
        </div>
        <div className="border-t border-line px-5 py-4 text-sm">
          <p className="truncate text-ink-soft">{c.user.email}</p>
          <form action={signOut}><button className="mt-2 inline-flex items-center gap-2 underline"><Icon name="arrow" size={14} /> Log out</button></form>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
