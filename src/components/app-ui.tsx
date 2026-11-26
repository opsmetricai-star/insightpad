import type { ReactNode } from "react";

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-ink-soft">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="bg-grid border border-dashed border-ink/30 bg-white/60 p-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "error" }) {
  return <p role={tone === "error" ? "alert" : "status"} className={`mb-6 border p-3 text-sm ${tone === "error" ? "border-red-300 bg-red-50 text-red-700" : "border-line bg-white"}`}>{children}</p>;
}

export const fmtDate = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
