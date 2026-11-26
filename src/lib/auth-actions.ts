"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type AuthState = { error?: string; message?: string };

const safeNext = (n: FormDataEntryValue | null) => (typeof n === "string" && n.startsWith("/app") ? n : "/app");

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
}

const NOT_CONFIGURED = "Sign-in is temporarily unavailable. Please try again shortly.";

export async function signIn(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!supabaseConfigured()) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(fd.get("email") ?? "").trim(), password: String(fd.get("password") ?? "") });
  if (error) return { error: error.message };
  redirect(safeNext(fd.get("next")));
}

export async function signUp(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!supabaseConfigured()) return { error: NOT_CONFIGURED };
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  const plan = String(fd.get("plan") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(fd.get("email") ?? "").trim(),
    password,
    options: { data: { full_name: String(fd.get("name") ?? "").trim() }, emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(plan ? `/app/billing?plan=${plan}` : "/app")}` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect(plan ? `/app/billing?plan=${encodeURIComponent(plan)}` : "/app");
  return { message: "Check your inbox to confirm your email, then log in." };
}

export async function forgotPassword(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!supabaseConfigured()) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(String(fd.get("email") ?? "").trim(), { redirectTo: `${await origin()}/auth/callback?next=/reset-password` });
  if (error) return { error: error.message };
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!supabaseConfigured()) return { error: NOT_CONFIGURED };
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "Passwords do not match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/app");
}

export async function signOut() {
  if (supabaseConfigured()) { const supabase = await createClient(); await supabase.auth.signOut(); }
  redirect("/");
}
