"use client";
import { useActionState, useEffect, useRef } from "react";

type A = (prev: { error?: string; ok?: boolean }, fd: FormData) => Promise<{ error?: string; ok?: boolean }>;

/** Generic form wrapper that surfaces server action errors and success state and resets on success. */
export function ActionForm({ action, children, submit, className = "", success }: { action: A; children: React.ReactNode; submit: string; className?: string; success?: string }) {
  const [state, fa, pending] = useActionState(action as never as (p: unknown, f: FormData) => Promise<{ error?: string; ok?: boolean }>, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={fa} className={className}>
      {children}
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && success && <p role="status" className="text-sm text-mint">{success}</p>}
      <button disabled={pending} className="btn btn-solid w-fit disabled:opacity-60">{pending ? "Working…" : submit}</button>
    </form>
  );
}

export function DatasetSelect({ datasets, name = "dataset_id", defaultValue }: { datasets: { id: string; name: string }[]; name?: string; defaultValue?: string }) {
  return (
    <select name={name} required defaultValue={defaultValue} className="field">
      <option value="">Choose a dataset…</option>
      {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select>
  );
}
