"use client";
import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword, signIn, signUp, updatePassword, type AuthState } from "@/lib/auth-actions";
import { Logo } from "./ui";

type Mode = "login" | "signup" | "forgot" | "reset";
const cfg = {
  login: { title: "Welcome back", cta: "Log in", action: signIn },
  signup: { title: "Create your workspace", cta: "Create account", action: signUp },
  forgot: { title: "Reset your password", cta: "Send reset link", action: forgotPassword },
  reset: { title: "Choose a new password", cta: "Update password", action: updatePassword },
} as const;

export default function AuthForm({ mode, next, plan, notice }: { mode: Mode; next?: string; plan?: string; notice?: string }) {
  const c = cfg[mode];
  const [state, formAction, pending] = useActionState<AuthState, FormData>(c.action, {});
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="theme-night bg-grid-night bg-noise relative hidden flex-col justify-between p-12 lg:flex">
        <Logo dark />
        <div>
          <p className="font-display text-4xl font-bold leading-tight text-white">Trusted answers from your data, in minutes.</p>
          <p className="mt-4 max-w-md text-rose">Upload a CSV, ask in plain language, and see exactly how every number was computed.</p>
        </div>
        <p className="tag-label">ROW LEVEL SECURITY ON EVERY TABLE</p>
      </div>
      <div className="bg-dots flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{c.title}</h1>
          {plan && mode === "signup" && <p className="mt-2 text-sm text-ink-soft">You will be taken to checkout for the <b>{plan}</b> plan after you sign up.</p>}
          {notice && <p role="status" className="mt-4 border border-line bg-white p-3 text-sm">{notice}</p>}
          <form action={formAction} className="card mt-6 grid gap-4 p-6">
            {next && <input type="hidden" name="next" value={next} />}
            {plan && <input type="hidden" name="plan" value={plan} />}
            {mode === "signup" && <label className="grid gap-1.5 text-sm font-medium">Full name<input name="name" required autoComplete="name" className="field" /></label>}
            {mode !== "reset" && <label className="grid gap-1.5 text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="field" /></label>}
            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <label className="grid gap-1.5 text-sm font-medium">{mode === "reset" ? "New password" : "Password"}
                <input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} className="field" />
              </label>
            )}
            {mode === "reset" && <label className="grid gap-1.5 text-sm font-medium">Confirm password<input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field" /></label>}
            {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
            {state.message && <p role="status" className="text-sm text-mint">{state.message}</p>}
            <button disabled={pending} className="btn btn-solid w-full disabled:opacity-60">{pending ? "Please wait…" : c.cta}</button>
          </form>
          <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm text-ink-soft">
            {mode === "login" && (<><Link className="underline" href="/forgot-password">Forgot password?</Link><span>New here? <Link className="underline" href="/signup">Sign up</Link></span></>)}
            {mode === "signup" && <span>Already have an account? <Link className="underline" href="/login">Log in</Link></span>}
            {(mode === "forgot" || mode === "reset") && <Link className="underline" href="/login">Back to log in</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
