"use client";
import { useState, useTransition } from "react";
import { addWidget, togglePublish } from "@/lib/actions";

export default function AppBuilder({ appId, published, shareToken, readOnly }: { appId: string; published: boolean; shareToken: string | null; readOnly?: boolean }) {
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [pub, setPub] = useState(published);
  const [pending, start] = useTransition();
  const url = typeof window !== "undefined" && shareToken ? `${window.location.origin}/share/${shareToken}` : `/share/${shareToken}`;
  return (
    <div className="card p-5">
      {!readOnly && (
        <form onSubmit={(e) => { e.preventDefault(); setErr(""); start(async () => { const r = await addWidget(appId, q); if (r.error) setErr(r.error); else setQ(""); }); }} className="flex flex-wrap gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} minLength={3} required aria-label="Widget question" placeholder="Add a widget by asking a question, e.g. revenue by region" className="field min-w-[260px] flex-1" />
          <button disabled={pending} className="btn btn-solid disabled:opacity-60">{pending ? "Building…" : "Add widget (1 credit)"}</button>
        </form>
      )}
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        {!readOnly && (
          <button className="btn btn-sm" disabled={pending} onClick={() => start(async () => { const r = await togglePublish(appId, !pub); if (r.error) setErr(r.error); else setPub(!pub); })}>
            {pub ? "Unpublish" : "Publish"}
          </button>
        )}
        {pub ? <span>Public link: <a className="underline" href={url} target="_blank" rel="noopener noreferrer">{url}</a></span> : <span className="text-ink-soft">Draft. Only your workspace can see it.</span>}
      </div>
    </div>
  );
}
