import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { plans, type Plan } from "@/content/site";

export type Ctx = Awaited<ReturnType<typeof getCtx>>;

export const isAdminEmail = (email?: string | null) =>
  !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());

export async function getCtx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: member } = await supabase.from("workspace_members").select("workspace_id, role, workspaces(id, name)").eq("user_id", user.id).order("created_at").limit(1).maybeSingle();
  if (!member) throw new Error("No workspace found for this account. Re-run supabase/schema.sql so the signup trigger exists, then create a new account.");
  const ws = member.workspaces as unknown as { id: string; name: string };
  const { data: sub } = await supabase.from("subscriptions").select("*").eq("workspace_id", ws.id).single();
  const plan = (plans.find((p) => p.id === sub?.plan) ?? plans[0]) as Plan;
  return {
    supabase, user, role: member.role as string,
    workspace: ws, sub: sub as { plan: string; credits_total: number; credits_used: number; status: string; period_end: string | null },
    plan, isAdmin: isAdminEmail(user.email),
  };
}
