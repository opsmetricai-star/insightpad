import Link from "next/link";
import { notFound } from "next/navigation";
import { getCtx } from "@/lib/session";
import ChatClient from "@/components/ChatClient";
import type { ChatMsg } from "@/lib/actions";
import type { Column } from "@/lib/engine";

function suggest(cols: Column[]): string[] {
  const num = cols.find((k) => k.type === "number");
  const cat = cols.find((k) => k.type === "string");
  const out = ["How many rows are there?"];
  if (num) out.push(`What is the total ${num.name}?`);
  if (num && cat) out.push(`${num.name} by ${cat.name}`);
  return out;
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCtx();
  const { data: t } = await c.supabase.from("threads").select("id, title, datasets(name, columns)").eq("id", id).eq("workspace_id", c.workspace.id).maybeSingle();
  if (!t) notFound();
  const { data: msgs } = await c.supabase.from("thread_messages").select("id, role, content, plan, result, credits, flagged").eq("thread_id", id).order("created_at");
  const ds = t.datasets as unknown as { name: string; columns: Column[] } | null;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-4 text-sm"><Link href="/app/threads" className="underline">← Threads</Link></p>
      <h1 className="font-display text-2xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">Dataset: {ds?.name ?? "none"} · {ds?.columns.map((k) => k.name).slice(0, 8).join(", ")}</p>
      <ChatClient threadId={id} initial={(msgs ?? []) as ChatMsg[]} disabled={c.role === "viewer"} suggestions={ds ? suggest(ds.columns) : []} />
    </div>
  );
}
