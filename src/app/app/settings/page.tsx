import Link from "next/link";
import { getCtx } from "@/lib/session";
import { PageTitle } from "@/components/app-ui";
import { ActionForm } from "@/components/Forms";
import { saveSettings } from "@/lib/actions";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const c = await getCtx();
  const { data: p } = await c.supabase.from("profiles").select("full_name, email").eq("id", c.user.id).single();
  return (
    <>
      <PageTitle title="Settings" sub="Your profile and workspace." />
      <section className="card max-w-xl p-6">
        <ActionForm action={saveSettings} submit="Save changes" className="grid gap-4" success="Saved.">
          <label className="grid gap-1.5 text-sm font-medium">Email<input value={p?.email ?? c.user.email ?? ""} readOnly className="field opacity-70" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Full name<input name="full_name" required defaultValue={p?.full_name ?? ""} className="field" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Workspace name<input name="workspace_name" required defaultValue={c.workspace.name} readOnly={c.role !== "owner"} className="field" /></label>
          <p className="text-sm text-ink-soft">Role: {c.role}. Plan: {c.plan.name}.</p>
        </ActionForm>
      </section>
      <section className="card mt-8 max-w-xl p-6">
        <h2 className="font-display text-lg font-semibold">Password</h2>
        <p className="mt-1 text-sm text-ink-soft">To change your password, request a reset link.</p>
        <Link href="/forgot-password" className="btn btn-sm mt-4">Send reset link</Link>
      </section>
    </>
  );
}
