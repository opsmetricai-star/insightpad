// Deterministic analytics engine. The AI only *plans* a query (a validated JSON object);
// every figure shown to users is computed here from the stored rows.
import { z } from "zod";

export type ColType = "number" | "string" | "date" | "boolean";
export type Column = { name: string; type: ColType; sample: (string | number | boolean | null)[] };
export type Row = Record<string, string | number | boolean | null>;

/* ---------- CSV parsing ---------- */
export function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [], field = "", inQ = false;
  const src = text.replace(/^﻿/, "");
  const delim = (() => {
    const first = src.split(/\r?\n/, 1)[0] || "";
    const c = { ",": 0, ";": 0, "\t": 0 } as Record<string, number>;
    for (const ch of first) if (ch in c) c[ch]++;
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
  })();
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQ) {
      if (ch === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === delim) { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((c) => c.trim() !== "")) out.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) out.push(row);
  return out;
}

const num = (s: string) => {
  const t = s.trim().replace(/[$€£,\s]/g, "").replace(/%$/, "");
  if (t === "" || !/^-?\d*\.?\d+(e[-+]?\d+)?$/i.test(t)) return null;
  return Number(t);
};
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}.*)?$/.test(s.trim()) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s.trim());

export function tableFromCsv(text: string, maxRows: number): { columns: Column[]; rows: Row[]; truncated: boolean; total: number } {
  const grid = parseCsv(text);
  if (grid.length < 2) throw new Error("The file needs a header row and at least one data row.");
  const seen = new Map<string, number>();
  const headers = grid[0].map((h, i) => {
    let n = h.trim() || `column_${i + 1}`;
    const c = seen.get(n) ?? 0;
    seen.set(n, c + 1);
    if (c) n = `${n}_${c + 1}`;
    return n;
  });
  const body = grid.slice(1);
  const total = body.length;
  const used = body.slice(0, maxRows);
  const types: ColType[] = headers.map((_, ci) => {
    const vals = used.map((r) => (r[ci] ?? "").trim()).filter((v) => v !== "");
    if (!vals.length) return "string";
    if (vals.every((v) => num(v) !== null)) return "number";
    if (vals.every((v) => /^(true|false|yes|no)$/i.test(v))) return "boolean";
    if (vals.every(isDate)) return "date";
    return "string";
  });
  const rows: Row[] = used.map((r) => {
    const o: Row = {};
    headers.forEach((h, ci) => {
      const raw = (r[ci] ?? "").trim();
      if (raw === "") o[h] = null;
      else if (types[ci] === "number") o[h] = num(raw);
      else if (types[ci] === "boolean") o[h] = /^(true|yes)$/i.test(raw);
      else o[h] = raw;
    });
    return o;
  });
  const columns: Column[] = headers.map((name, i) => ({ name, type: types[i], sample: rows.slice(0, 3).map((r) => r[name]) }));
  return { columns, rows, truncated: total > maxRows, total };
}

/* ---------- Query plan ---------- */
export const planSchema = z.object({
  title: z.string().max(140),
  aggregate: z.enum(["sum", "avg", "count", "min", "max", "count_distinct"]),
  column: z.string().nullable().optional(), // null for plain count
  groupBy: z.string().nullable().optional(),
  timeGrain: z.enum(["none", "month", "year"]).optional().default("none"),
  filters: z.array(z.object({
    column: z.string(),
    op: z.enum(["=", "!=", ">", ">=", "<", "<=", "contains"]),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })).max(8).default([]),
  sort: z.enum(["asc", "desc", "none"]).default("desc"),
  limit: z.number().int().min(1).max(100).default(20),
  chart: z.enum(["bar", "line", "table", "number"]).default("bar"),
  explanation: z.string().max(600).optional(),
});
export type Plan = z.infer<typeof planSchema>;

export type Result = { columns: string[]; rows: (string | number | null)[][]; total?: number; groupCount: number; rowsScanned: number; rowsMatched: number };

export function validatePlan(plan: Plan, columns: Column[]): string | null {
  const names = new Set(columns.map((c) => c.name));
  const byName = new Map(columns.map((c) => [c.name, c]));
  if (plan.groupBy && !names.has(plan.groupBy)) return `Unknown column "${plan.groupBy}" in groupBy`;
  if (plan.column && !names.has(plan.column)) return `Unknown column "${plan.column}"`;
  if (["sum", "avg", "min", "max"].includes(plan.aggregate)) {
    if (!plan.column) return `Aggregate ${plan.aggregate} needs a column`;
    if (byName.get(plan.column)?.type !== "number") return `Column "${plan.column}" is not numeric, so ${plan.aggregate} is not valid`;
  }
  for (const f of plan.filters) if (!names.has(f.column)) return `Unknown filter column "${f.column}"`;
  return null;
}

function toDate(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  const d = m ? new Date(Number(m[3].length === 2 ? "20" + m[3] : m[3]), Number(m[1]) - 1, Number(m[2])) : new Date(v);
  return isNaN(+d) ? null : d;
}

export function runPlan(plan: Plan, rows: Row[], columns: Column[]): Result {
  const err = validatePlan(plan, columns);
  if (err) throw new Error(err);
  const matches = rows.filter((r) =>
    plan.filters.every((f) => {
      const v = r[f.column];
      if (v === null || v === undefined) return false;
      switch (f.op) {
        case "=": return String(v).toLowerCase() === String(f.value).toLowerCase();
        case "!=": return String(v).toLowerCase() !== String(f.value).toLowerCase();
        case "contains": return String(v).toLowerCase().includes(String(f.value).toLowerCase());
        default: {
          const a = typeof v === "number" ? v : toDate(v)?.getTime() ?? NaN;
          const b = typeof f.value === "number" ? f.value : toDate(f.value)?.getTime() ?? Number(f.value);
          if (isNaN(a) || isNaN(b)) return false;
          return f.op === ">" ? a > b : f.op === ">=" ? a >= b : f.op === "<" ? a < b : a <= b;
        }
      }
    }),
  );

  const agg = (rs: Row[]): number | null => {
    if (plan.aggregate === "count") return plan.column ? rs.filter((r) => r[plan.column!] != null).length : rs.length;
    const col = plan.column!;
    if (plan.aggregate === "count_distinct") return new Set(rs.map((r) => r[col]).filter((v) => v != null)).size;
    const vals = rs.map((r) => r[col]).filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    switch (plan.aggregate) {
      case "sum": return vals.reduce((a, b) => a + b, 0);
      case "avg": return vals.reduce((a, b) => a + b, 0) / vals.length;
      case "min": return Math.min(...vals);
      default: return Math.max(...vals);
    }
  };
  const round = (n: number | null) => (n === null ? null : Math.round(n * 1e6) / 1e6);
  const label = `${plan.aggregate}${plan.column ? "_" + plan.column : ""}`;

  if (!plan.groupBy) {
    return { columns: [label], rows: [[round(agg(matches))]], total: round(agg(matches)) ?? undefined, groupCount: 1, rowsScanned: rows.length, rowsMatched: matches.length };
  }
  const groups = new Map<string, Row[]>();
  for (const r of matches) {
    let k = r[plan.groupBy];
    if (plan.timeGrain !== "none") {
      const d = toDate(k);
      k = d ? (plan.timeGrain === "year" ? String(d.getFullYear()) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`) : null;
    }
    const key = k === null || k === undefined ? "(blank)" : String(k);
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(r);
  }
  let out = [...groups.entries()].map(([k, rs]) => [k, round(agg(rs))] as [string, number | null]);
  const isTime = plan.timeGrain !== "none" || columns.find((c) => c.name === plan.groupBy)?.type === "date";
  if (isTime && plan.chart === "line") out.sort((a, b) => a[0].localeCompare(b[0]));
  else if (plan.sort !== "none") out.sort((a, b) => ((a[1] ?? -Infinity) - (b[1] ?? -Infinity)) * (plan.sort === "asc" ? 1 : -1));
  const groupCount = out.length;
  out = out.slice(0, plan.limit);
  return { columns: [plan.groupBy, label], rows: out, groupCount, rowsScanned: rows.length, rowsMatched: matches.length };
}

export function schemaForPrompt(columns: Column[]) {
  return columns.map((c) => `- ${c.name} (${c.type}); e.g. ${c.sample.filter((s) => s !== null).slice(0, 3).join(", ")}`).join("\n");
}
