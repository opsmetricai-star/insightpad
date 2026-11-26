import Link from "next/link";
import { notFound } from "next/navigation";
import { getCtx } from "@/lib/session";
import NotebookEditor from "@/components/NotebookEditor";
import type { Cell } from "@/lib/actions";

export default async function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCtx();
  const { data: nb } = await c.supabase.from("notebooks").select("id, title, dataset_id, cells").eq("id", id).eq("workspace_id", c.workspace.id).maybeSingle();
  if (!nb) notFound();
  const { data: datasets } = await c.supabase.from("datasets").select("id, name").eq("workspace_id", c.workspace.id);
  const { data: versions } = await c.supabase.from("notebook_versions").select("id, created_at, cells").eq("notebook_id", id).order("created_at", { ascending: false }).limit(10);
  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-4 text-sm"><Link href="/app/notebooks" className="underline">← Notebooks</Link></p>
      <NotebookEditor id={nb.id} title={nb.title} datasetId={nb.dataset_id} initialCells={nb.cells as Cell[]} datasets={datasets ?? []} versions={(versions ?? []) as { id: string; created_at: string; cells: Cell[] }[]} readOnly={c.role === "viewer"} />
    </div>
  );
}
