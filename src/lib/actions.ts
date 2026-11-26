"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCtx, isAdminEmail } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { plans } from "@/content/site";
import { planSchema, runPlan, tableFromCsv, type Plan, type Result } from "@/lib/engine";
import { COST, answerQuestion, assertCredits, loadDataset, runAgent } from "@/lib/run";

const msg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
export type ActionResult<T = object> = ({ error: string } | ({ error?: undefined } & T));

/* ===================== Datasets ===================== */
export async function uploadDataset(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  try {
    const c = await getCtx();
    if (c.role === "viewer") return { error: "Viewers cannot upload data." };
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file first." };
    if (file.size > 8 * 1024 * 1024) return { error: "Files can be up to 8 MB." };
    if (!/\.(csv|tsv|txt)$/i.test(file.name)) return { error: "Upload a .csv file." };

    const { count } = await c.supabase.from("datasets").select("id", { count: "exact", head: true }).eq("workspace_id", c.workspace.id);
    if ((count ?? 0) >= c.plan.limits.datasets) return { error: `Your ${c.plan.name} plan allows ${c.plan.limits.datasets} datasets. Upgrade to add more.` };

    const text = await file.text();
    const t = tableFromCsv(text, c.plan.limits.rows);
    const path = `${c.workspace.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const up = await c.supabase.storage.from("datasets").upload(path, file, { contentType: "text/csv" });
    if (up.error) return { error: `Storage upload failed: ${up.error.message}` };

    const name = String(fd.get("name") || "").trim() || file.name.replace(/\.[^.]+$/, "");
    const { error } = await c.supabase.from("datasets").insert({
      workspace_id: c.workspace.id, name, filename: file.name, storage_path: path, columns: t.columns, rows: t.rows,
      row_count: t.total, truncated: t.truncated, created_by: c.user.id,
    });
    if (error) {
      await c.supabase.storage.from("datasets").remove([path]);
      return { error: error.message };
    }
    revalidatePath("/app/datasets");
    return { ok: true };
  } catch (e) { return { error: msg(e) }; }
}

export async function deleteDataset(id: string) {
  const c = await getCtx();
  const { data } = await c.supabase.from("datasets").select("storage_path").eq("id", id).eq("workspace_id", c.workspace.id).maybeSingle();
  await c.supabase.from("datasets").delete().eq("id", id).eq("workspace_id", c.workspace.id);
  if (data?.storage_path) await c.supabase.storage.from("datasets").remove([data.storage_path]);
  revalidatePath("/app/datasets");
}

export async function datasetDownloadUrl(id: string) {
  const c = await getCtx();
  const { data } = await c.supabase.from("datasets").select("storage_path").eq("id", id).maybeSingle();
  if (!data?.storage_path) return null;
  const s = await c.supabase.storage.from("datasets").createSignedUrl(data.storage_path, 60);
  return s.data?.signedUrl ?? null;
}

/* ===================== Threads ===================== */
export async function createThread(fd: FormData) {
  const c = await getCtx();
  const datasetId = String(fd.get("dataset_id") || "");
  if (!datasetId) redirect("/app/threads?error=dataset");
  const { data, error } = await c.supabase.from("threads").insert({ workspace_id: c.workspace.id, dataset_id: datasetId, title: "New thread", created_by: c.user.id }).select("id").single();
  if (error || !data) redirect("/app/threads?error=create");
  redirect(`/app/threads/${data.id}`);
}

export type ChatMsg = { id: string; role: "user" | "assistant"; content: string; plan: Plan | null; result: Result | null; credits: number; flagged: boolean };

export async function askThread(threadId: string, question: string): Promise<ActionResult<{ messages: ChatMsg[] }>> {
  try {
    const q = z.string().trim().min(2).max(1000).parse(question);
    const c = await getCtx();
    if (c.role === "viewer") return { error: "Viewers cannot ask questions." };
    const { data: th } = await c.supabase.from("threads").select("id, dataset_id, title").eq("id", threadId).eq("workspace_id", c.workspace.id).single();
    if (!th?.dataset_id) return { error: "This thread has no dataset." };
    const { data: hist } = await c.supabase.from("thread_messages").select("role, content").eq("thread_id", threadId).order("created_at", { ascending: false }).limit(6);
    const ans = await answerQuestion(c.supabase, c.workspace.id, th.dataset_id, q, (hist ?? []).reverse());
    const rows = [
      { thread_id: threadId, workspace_id: c.workspace.id, role: "user", content: q },
      { thread_id: threadId, workspace_id: c.workspace.id, role: "assistant", content: ans.text, plan: ans.plan, result: ans.result, credits: COST.question },
    ];
    const { data: saved, error } = await c.supabase.from("thread_messages").insert(rows).select("id, role, content, plan, result, credits, flagged");
    if (error) return { error: error.message };
    if (th.title === "New thread") await c.supabase.from("threads").update({ title: q.slice(0, 80) }).eq("id", threadId);
    revalidatePath("/app/threads");
    return { messages: (saved ?? []) as ChatMsg[] };
  } catch (e) { return { error: msg(e) }; }
}

export async function flagMessage(id: string, flagged: boolean) {
  const c = await getCtx();
  await c.supabase.from("thread_messages").update({ flagged }).eq("id", id).eq("workspace_id", c.workspace.id);
}

export async function deleteThread(fd: FormData) {
  const c = await getCtx();
  await c.supabase.from("threads").delete().eq("id", String(fd.get("id"))).eq("workspace_id", c.workspace.id);
  revalidatePath("/app/threads");
}

/* ===================== Notebooks ===================== */
export type Cell =
  | { id: string; type: "markdown"; text: string }
  | { id: string; type: "question"; text: string; output?: { plan: Plan; result: Result; summary: string } | { error: string } }
  | { id: string; type: "agent"; text: string; output?: { markdown: string; results: { plan: Plan; result: Result }[] } | { error: string } };

export async function createNotebook(fd: FormData) {
  const c = await getCtx();
  const datasetId = String(fd.get("dataset_id") || "") || null;
  const cells: Cell[] = [{ id: crypto.randomUUID(), type: "markdown", text: "# Analysis\nDescribe what you are investigating." }, { id: crypto.randomUUID(), type: "question", text: "" }];
  const { data } = await c.supabase.from("notebooks").insert({ workspace_id: c.workspace.id, dataset_id: datasetId, title: String(fd.get("title") || "Untitled notebook"), cells, created_by: c.user.id }).select("id").single();
  if (!data) redirect("/app/notebooks?error=create");
  redirect(`/app/notebooks/${data.id}`);
}

export async function saveNotebook(id: string, title: string, cells: Cell[]): Promise<ActionResult> {
  try {
    const c = await getCtx();
    if (c.role === "viewer") return { error: "Viewers cannot edit." };
    const { error } = await c.supabase.from("notebooks").update({ title: title.slice(0, 120) || "Untitled notebook", cells, updated_at: new Date().toISOString() }).eq("id", id).eq("workspace_id", c.workspace.id);
    if (error) return { error: error.message };
    await c.supabase.from("notebook_versions").insert({ notebook_id: id, workspace_id: c.workspace.id, cells });
    // keep only the versions the plan allows (7 community / 30 professional / unlimited otherwise)
    if (c.plan.id === "community" || c.plan.id === "professional") {
      const days = c.plan.id === "community" ? 7 : 30;
      await c.supabase.from("notebook_versions").delete().eq("notebook_id", id).lt("created_at", new Date(Date.now() - days * 864e5).toISOString());
    }
    return {};
  } catch (e) { return { error: msg(e) }; }
}

export async function runCell(notebookId: string, cell: Cell): Promise<ActionResult<{ cell: Cell }>> {
  try {
    const c = await getCtx();
    if (c.role === "viewer") return { error: "Viewers cannot run cells." };
    const { data: nb } = await c.supabase.from("notebooks").select("dataset_id").eq("id", notebookId).eq("workspace_id", c.workspace.id).single();
    if (!nb?.dataset_id) return { error: "Choose a dataset for this notebook first." };
    if (cell.type === "markdown") return { cell };
    if (cell.text.trim().length < 2) return { error: "Write a question or instruction first." };
    if (cell.type === "question") {
      const a = await answerQuestion(c.supabase, c.workspace.id, nb.dataset_id, cell.text);
      return { cell: { ...cell, output: { plan: a.plan, result: a.result, summary: a.text } } };
    }
    const out = await runAgent(c.supabase, c.workspace.id, nb.dataset_id, cell.text);
    return { cell: { ...cell, output: out } };
  } catch (e) { return { error: msg(e) }; }
}

export async function setNotebookDataset(id: string, datasetId: string) {
  const c = await getCtx();
  await c.supabase.from("notebooks").update({ dataset_id: datasetId || null }).eq("id", id).eq("workspace_id", c.workspace.id);
  revalidatePath(`/app/notebooks/${id}`);
}

export async function deleteNotebook(fd: FormData) {
  const c = await getCtx();
  await c.supabase.from("notebooks").delete().eq("id", String(fd.get("id"))).eq("workspace_id", c.workspace.id);
  revalidatePath("/app/notebooks");
}

/* ===================== Data apps ===================== */
export type Widget = { id: string; title: string; plan: Plan };

export async function createApp(fd: FormData) {
  const c = await getCtx();
  const datasetId = String(fd.get("dataset_id") || "");
  if (!datasetId) redirect("/app/apps?error=dataset");
  const { data } = await c.supabase.from("apps").insert({ workspace_id: c.workspace.id, dataset_id: datasetId, title: String(fd.get("title") || "Untitled app"), created_by: c.user.id }).select("id").single();
  if (!data) redirect("/app/apps?error=create");
  redirect(`/app/apps/${data.id}`);
}

export async function addWidget(appId: string, question: string): Promise<ActionResult> {
  try {
    const c = await getCtx();
    if (c.role === "viewer") return { error: "Viewers cannot edit apps." };
    const { data: app } = await c.supabase.from("apps").select("id, dataset_id, widgets").eq("id", appId).eq("workspace_id", c.workspace.id).single();
    if (!app?.dataset_id) return { error: "App not found." };
    const a = await answerQuestion(c.supabase, c.workspace.id, app.dataset_id, question, [], { narrateText: false });
    const widgets = [...(app.widgets as Widget[]), { id: crypto.randomUUID(), title: a.plan.title, plan: a.plan }];
    await c.supabase.from("apps").update({ widgets }).eq("id", appId);
    revalidatePath(`/app/apps/${appId}`);
    return {};
  } catch (e) { return { error: msg(e) }; }
}

export async function removeWidget(appId: string, widgetId: string) {
  const c = await getCtx();
  const { data: app } = await c.supabase.from("apps").select("widgets").eq("id", appId).eq("workspace_id", c.workspace.id).single();
  if (!app) return;
  await c.supabase.from("apps").update({ widgets: (app.widgets as Widget[]).filter((w) => w.id !== widgetId) }).eq("id", appId);
  revalidatePath(`/app/apps/${appId}`);
}

export async function togglePublish(appId: string, publish: boolean): Promise<ActionResult> {
  const c = await getCtx();
  if (publish) {
    const { count } = await c.supabase.from("apps").select("id", { count: "exact", head: true }).eq("workspace_id", c.workspace.id).eq("published", true);
    if ((count ?? 0) >= c.plan.limits.apps) return { error: `Your ${c.plan.name} plan allows ${c.plan.limits.apps} published app(s). Upgrade to publish more.` };
  }
  await c.supabase.from("apps").update({ published: publish }).eq("id", appId).eq("workspace_id", c.workspace.id);
  revalidatePath(`/app/apps/${appId}`);
  return {};
}

export async function deleteApp(fd: FormData) {
  const c = await getCtx();
  await c.supabase.from("apps").delete().eq("id", String(fd.get("id"))).eq("workspace_id", c.workspace.id);
  revalidatePath("/app/apps");
}

/* ===================== Context Studio ===================== */
export async function addContext(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const parsed = z.object({ kind: z.enum(["metric", "term", "dataset_note"]), name: z.string().trim().min(2).max(80), definition: z.string().trim().min(5).max(1000), dataset_id: z.string().optional() }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Add a name (2+ characters) and a definition (5+ characters)." };
  const c = await getCtx();
  const { error } = await c.supabase.from("context_items").insert({ workspace_id: c.workspace.id, kind: parsed.data.kind, name: parsed.data.name, definition: parsed.data.definition, dataset_id: parsed.data.dataset_id || null, created_by: c.user.id });
  if (error) return { error: error.message };
  revalidatePath("/app/context");
  return { ok: true };
}
export async function deleteContext(fd: FormData) {
  const c = await getCtx();
  await c.supabase.from("context_items").delete().eq("id", String(fd.get("id"))).eq("workspace_id", c.workspace.id);
  revalidatePath("/app/context");
}
export async function toggleEndorse(fd: FormData) {
  const c = await getCtx();
  await c.supabase.from("context_items").update({ endorsed: fd.get("endorsed") !== "true" }).eq("id", String(fd.get("id"))).eq("workspace_id", c.workspace.id);
  revalidatePath("/app/context");
}

/* ===================== Evals ===================== */
export async function createSuite(fd: FormData) {
  const c = await getCtx();
  const datasetId = String(fd.get("dataset_id") || "");
  if (!datasetId) redirect("/app/evals?error=dataset");
  const { data } = await c.supabase.from("eval_suites").insert({ workspace_id: c.workspace.id, dataset_id: datasetId, name: String(fd.get("name") || "New suite"), created_by: c.user.id }).select("id").single();
  if (!data) redirect("/app/evals?error=create");
  redirect(`/app/evals/${data.id}`);
}
export async function addCase(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const parsed = z.object({ suite_id: z.string().uuid(), prompt: z.string().trim().min(3).max(500), expected: z.coerce.number(), tolerance: z.coerce.number().min(0).max(1).default(0.01) }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Enter a prompt and a numeric expected value." };
  const c = await getCtx();
  const { error } = await c.supabase.from("eval_cases").insert({ workspace_id: c.workspace.id, ...parsed.data });
  if (error) return { error: error.message };
  revalidatePath(`/app/evals/${parsed.data.suite_id}`);
  return { ok: true };
}
export async function deleteCase(fd: FormData) {
  const c = await getCtx();
  await c.supabase.from("eval_cases").delete().eq("id", String(fd.get("id"))).eq("workspace_id", c.workspace.id);
  revalidatePath(`/app/evals/${String(fd.get("suite_id"))}`);
}
export async function runSuite(suiteId: string): Promise<ActionResult> {
  try {
    const c = await getCtx();
    const { data: suite } = await c.supabase.from("eval_suites").select("id, dataset_id").eq("id", suiteId).eq("workspace_id", c.workspace.id).single();
    const { data: cases } = await c.supabase.from("eval_cases").select("id, prompt, expected, tolerance").eq("suite_id", suiteId);
    if (!suite?.dataset_id || !cases?.length) return { error: "Add at least one case first." };
    await assertCredits(c.supabase, c.workspace.id, cases.length * COST.evalCase);
    const results: { case_id: string; prompt: string; expected: number; actual: number | null; passed: boolean; error?: string; plan?: Plan }[] = [];
    for (const k of cases) {
      try {
        const a = await answerQuestion(c.supabase, c.workspace.id, suite.dataset_id, k.prompt, [], { narrateText: false });
        const actual = typeof a.result.total === "number" ? a.result.total : null;
        const exp = Number(k.expected), tol = Number(k.tolerance);
        const passed = actual !== null && Math.abs(actual - exp) <= Math.max(Math.abs(exp) * tol, 1e-9);
        results.push({ case_id: k.id, prompt: k.prompt, expected: exp, actual, passed, plan: a.plan });
      } catch (e) { results.push({ case_id: k.id, prompt: k.prompt, expected: Number(k.expected), actual: null, passed: false, error: msg(e) }); }
    }
    const passed = results.filter((r) => r.passed).length;
    await c.supabase.from("eval_runs").insert({ suite_id: suiteId, workspace_id: c.workspace.id, passed, failed: results.length - passed, credits: results.length * COST.evalCase, results, created_by: c.user.id });
    revalidatePath(`/app/evals/${suiteId}`);
    return {};
  } catch (e) { return { error: msg(e) }; }
}
export async function deleteSuite(fd: FormData) {
  const c = await getCtx();
  await c.supabase.from("eval_suites").delete().eq("id", String(fd.get("id"))).eq("workspace_id", c.workspace.id);
  revalidatePath("/app/evals");
}

/* ===================== Notifications / settings ===================== */
export async function markAllRead() {
  const c = await getCtx();
  await c.supabase.from("notifications").update({ read: true }).eq("user_id", c.user.id).eq("read", false);
  revalidatePath("/app", "layout");
}
export async function saveSettings(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const c = await getCtx();
  const name = String(fd.get("full_name") || "").trim().slice(0, 100);
  const ws = String(fd.get("workspace_name") || "").trim().slice(0, 100);
  if (!name || !ws) return { error: "Both names are required." };
  await c.supabase.from("profiles").update({ full_name: name }).eq("id", c.user.id);
  if (c.role === "owner") await c.supabase.from("workspaces").update({ name: ws }).eq("id", c.workspace.id);
  revalidatePath("/app", "layout");
  return { ok: true };
}

/* ===================== Billing (claims + admin approval) ===================== */
export async function submitClaim(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  const parsed = z.object({ plan: z.enum(["professional", "team", "enterprise"]), reference: z.string().trim().min(4).max(120), payer_email: z.string().trim().email().optional().or(z.literal("")) }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Choose a plan and enter the order or transaction reference from your receipt." };
  const c = await getCtx();
  const { error } = await c.supabase.from("payment_claims").insert({ workspace_id: c.workspace.id, user_id: c.user.id, plan: parsed.data.plan, reference: parsed.data.reference, payer_email: parsed.data.payer_email || c.user.email, status: "pending" });
  if (error) return { error: error.message };
  revalidatePath("/app/billing");
  return { ok: true };
}

export async function reviewClaim(fd: FormData) {
  const c = await getCtx();
  if (!isAdminEmail(c.user.email)) throw new Error("Not authorised");
  const id = String(fd.get("id"));
  const approve = fd.get("decision") === "approve";
  const admin = createAdminClient();
  const { data: claim } = await admin.from("payment_claims").select("*").eq("id", id).eq("status", "pending").single();
  if (!claim) return;
  if (approve) {
    const p = plans.find((x) => x.id === claim.plan)!;
    await admin.from("subscriptions").update({ plan: p.id, status: "active", credits_total: p.limits.aiCredits, credits_used: 0, period_end: new Date(Date.now() + 30 * 864e5).toISOString(), updated_at: new Date().toISOString() }).eq("workspace_id", claim.workspace_id);
  }
  await admin.from("payment_claims").update({ status: approve ? "approved" : "rejected", reviewed_by: c.user.email, reviewed_at: new Date().toISOString() }).eq("id", id);
  await admin.from("notifications").insert({ user_id: claim.user_id, title: approve ? `Your ${claim.plan} plan is active` : "Payment could not be verified", body: approve ? "Thanks. Your credits and limits have been updated." : "We could not match that reference to a payment. Contact support with your receipt." });
  revalidatePath("/app/admin");
}

// Used by evals/notebooks UI to show deterministic re-run of a stored plan
export async function rerunPlan(datasetId: string, planJson: unknown): Promise<ActionResult<{ result: Result }>> {
  try {
    const c = await getCtx();
    const plan = planSchema.parse(planJson);
    const ds = await loadDataset(c.supabase, c.workspace.id, datasetId);
    return { result: runPlan(plan, ds.rows, ds.columns) };
  } catch (e) { return { error: msg(e) }; }
}
