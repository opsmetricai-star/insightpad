"use client";
import { useState } from "react";
import { ChatMock, DashboardMock, EvalsMock } from "./Visuals";

export function ApproachTabs() {
  const tabs = ["Ask a question, get a verified answer", "Publish live data apps", "Prove accuracy with evals"];
  const [i, setI] = useState(0);
  return (
    <div>
      <div role="tablist" className="mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-2">
        {tabs.map((t, k) => (
          <button
            key={t} role="tab" aria-selected={i === k} onClick={() => setI(k)}
            className={`border px-4 py-2 text-sm transition-colors ${i === k ? "border-ink bg-ink text-white" : "border-line bg-white/70 hover:border-ink"}`}
          >{t}</button>
        ))}
      </div>
      <div className="bg-grid bg-noise relative mx-auto max-w-4xl border border-line bg-paper-2 p-4 md:p-10">
        {i === 0 && <ChatMock />}
        {i === 1 && <DashboardMock />}
        {i === 2 && <EvalsMock />}
      </div>
    </div>
  );
}

export function CapabilityStrip({ dark }: { dark?: boolean }) {
  const items = ["Query plans validated against your schema", "Figures computed by code, never by the model", "Row Level Security on every table", "Private storage for every file", "Credit cost logged per action", "Evals against known values"];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden">
      <div className="marquee flex w-max gap-14">
        {row.map((n, i) => (
          <span key={i} className={`whitespace-nowrap font-display text-lg font-medium tracking-tight ${dark ? "text-rose-dim/80" : "text-ink/55"}`}>{n}</span>
        ))}
      </div>
    </div>
  );
}
