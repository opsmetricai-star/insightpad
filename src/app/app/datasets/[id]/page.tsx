import Link from "next/link";
import { notFound } from "next/navigation";
import { getCtx } from "@/lib/session";
import { PageTitle } from "@/components/app-ui";
import type { Column, Row } from "@/lib/engine";
import { createThread } from "@/lib/actions";

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCtx();
  const { data: d } = await c.supabase.from("datasets").select("id, name, filename, row_count, truncated, columns, rows").eq("id", id).eq("workspace_id", c.workspace.id).maybeSingle();
  if (!d) notFound();
  const cols = d.columns as Column[];
  const rows = (d.rows as Row[]).slice(0, 25);
  return (
    <>
      <PageTitle
        title={d.name}
        sub={`${d.filename} · ${d.row_count.toLocaleString()} rows${d.truncated ? " (only the first rows within your plan limit are queryable)" : ""}`}
        action={<form action={createThread}><input type="hidden" name="dataset_id" value={d.id} /><button className="btn btn-solid">Ask this dataset</button></form>}
      />
      <h2 className="mb-3 font-display text-lg font-semibold">Columns</h2>
      <div className="mb-8 flex flex-wrap gap-2">{cols.map((k) => <span key={k.name} className="border border-line bg-white px-2.5 py-1 font-mono text-xs">{k.name} <span className="text-violet">{k.type}</span></span>)}</div>
      <h2 className="mb-3 font-display text-lg font-semibold">Preview (first 25 rows)</h2>
      <div className="card overflow-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead><tr className="border-b border-line bg-paper">{cols.map((k) => <th key={k.name} className="px-3 py-2 font-medium">{k.name}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-line/60">{cols.map((k) => <td key={k.name} className="px-3 py-1.5 font-mono text-[12.5px]">{String(r[k.name] ?? "")}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="mt-6 text-sm"><Link href="/app/datasets" className="underline">← All datasets</Link></p>
    </>
  );
}
