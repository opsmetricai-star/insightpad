"use client";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Plan, Result } from "@/lib/engine";

const fmt = (v: unknown) => (typeof v === "number" ? (Math.abs(v) >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(Math.round(v * 1000) / 1000)) : String(v ?? "n/a"));

export default function ResultView({ plan, result, compact }: { plan: Plan; result: Result; compact?: boolean }) {
  const data = result.rows.map((r) => ({ name: String(r[0]), value: typeof r[1] === "number" ? r[1] : 0 }));
  const h = compact ? 180 : 260;
  const chart = plan.groupBy ? plan.chart : plan.chart === "table" ? "table" : "number";

  return (
    <div className="border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="font-display text-sm font-medium">{plan.title}</p>
        <span className="tag-label text-ink-soft">{result.rowsMatched.toLocaleString()} of {result.rowsScanned.toLocaleString()} rows</span>
      </div>
      <div className="p-4">
        {chart === "number" && !plan.groupBy && (
          <p className="font-display text-5xl font-semibold tracking-tight" data-testid="result-number">{fmt(result.total)}</p>
        )}
        {chart === "bar" && plan.groupBy && (
          <div style={{ height: h }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} stroke="#e3dcdc" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={data.length > 6 ? -30 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={data.length > 6 ? 70 : 30} />
                <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={fmt} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="value" fill="#7a6bb5" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {chart === "line" && plan.groupBy && (
          <div style={{ height: h }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} stroke="#e3dcdc" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={fmt} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Line dataKey="value" stroke="#7a6bb5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {(chart === "table" || (!plan.groupBy && chart !== "number")) && null}
        {chart === "table" && (
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-line text-ink-soft">{result.columns.map((c) => <th key={c} className="py-2 pr-4 font-normal">{c}</th>)}</tr></thead>
              <tbody>{result.rows.map((r, i) => <tr key={i} className="border-b border-line/60">{r.map((v, j) => <td key={j} className="py-2 pr-4 font-mono text-[13px]">{fmt(v)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      <details className="border-t border-line text-[12px]">
        <summary className="px-4 py-2 text-ink-soft hover:text-ink">Show query plan</summary>
        <pre className="overflow-x-auto bg-paper px-4 py-3 font-mono text-[11.5px] leading-relaxed">{JSON.stringify({ aggregate: plan.aggregate, column: plan.column, groupBy: plan.groupBy, timeGrain: plan.timeGrain, filters: plan.filters, sort: plan.sort, limit: plan.limit }, null, 2)}</pre>
        {plan.explanation && <p className="px-4 pb-3 text-ink-soft">{plan.explanation}</p>}
      </details>
    </div>
  );
}
