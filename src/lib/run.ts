import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { agentCell, narrate, planQuestion, type ContextItem } from "./ai";
import { runPlan, type Column, type Plan, type Result, type Row } from "./engine";

export const COST = { question: 1, agent: 2, evalCase: 1 };

export async function loadDataset(supabase: SupabaseClient, ws: string, id: string) {
  const { data, error } = await supabase.from("datasets").select("id, name, columns, rows, row_count").eq("workspace_id", ws).eq("id", id).single();
  if (error || !data) throw new Error("Dataset not found.");
  return data as { id: string; name: string; columns: Column[]; rows: Row[]; row_count: number };
}

export async function loadContext(supabase: SupabaseClient, ws: string, datasetId?: string): Promise<ContextItem[]> {
  const { data } = await supabase.from("context_items").select("kind, name, definition, dataset_id").eq("workspace_id", ws).eq("endorsed", true).limit(50);
  return (data ?? []).filter((c) => !c.dataset_id || c.dataset_id === datasetId).map(({ kind, name, definition }) => ({ kind, name, definition }));
}

export async function assertCredits(supabase: SupabaseClient, ws: string, need: number) {
  const { data } = await supabase.from("subscriptions").select("credits_total, credits_used").eq("workspace_id", ws).single();
  if (!data || data.credits_total - data.credits_used < need) throw new Error("You are out of AI credits. Upgrade your plan on the Billing page.");
}

export async function spend(supabase: SupabaseClient, ws: string, amount: number, kind: string, meta: Record<string, unknown> = {}) {
  const { data, error } = await supabase.rpc("consume_credits", { ws, amount, kind, meta });
  if (error || !data) throw new Error("You are out of AI credits. Upgrade your plan on the Billing page.");
}

export type Answer = { plan: Plan; result: Result; text: string; /** Charges the credit. Only present when deferSpend is set; call it after the result is saved. */ commit: () => Promise<void> };

export async function answerQuestion(supabase: SupabaseClient, ws: string, datasetId: string, question: string, history: { role: string; content: string }[] = [], opts: { narrateText?: boolean; deferSpend?: boolean } = {}): Promise<Answer> {
  await assertCredits(supabase, ws, COST.question);
  const ds = await loadDataset(supabase, ws, datasetId);
  const ctx = await loadContext(supabase, ws, datasetId);
  const plan = await planQuestion({ question, columns: ds.columns, ctx, history });
  const result = runPlan(plan, ds.rows, ds.columns);
  const text = opts.narrateText === false ? "" : (await narrate({ question, plan, result })) || plan.explanation || "";
  const commit = () => spend(supabase, ws, COST.question, "question", { dataset: datasetId });
  if (!opts.deferSpend) await commit();
  return { plan, result, text, commit };
}

export async function runAgent(supabase: SupabaseClient, ws: string, datasetId: string, instruction: string) {
  await assertCredits(supabase, ws, COST.agent);
  const ds = await loadDataset(supabase, ws, datasetId);
  const ctx = await loadContext(supabase, ws, datasetId);
  const out = await agentCell({ instruction, columns: ds.columns, ctx });
  const results = out.plans.map((plan) => ({ plan, result: runPlan(plan, ds.rows, ds.columns) }));
  await spend(supabase, ws, COST.agent, "agent_cell", { dataset: datasetId });
  return { markdown: out.markdown, results };
}
