"use client";
import { useState, useTransition } from "react";
import { runSuite } from "@/lib/actions";

export default function RunSuite({ suiteId, disabled }: { suiteId: string; disabled?: boolean }) {
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="text-right">
      <button disabled={disabled || pending} onClick={() => { setErr(""); start(async () => { const r = await runSuite(suiteId); if (r.error) setErr(r.error); }); }} className="btn btn-solid disabled:opacity-50">{pending ? "Running evals…" : "Run suite"}</button>
      {err && <p role="alert" className="mt-2 max-w-xs text-sm text-red-600">{err}</p>}
    </div>
  );
}
