import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { planSchema, schemaForPrompt, validatePlan, type Column, type Plan } from "./engine";

export const aiConfigured = () => !!process.env.GEMINI_API_KEY;
// Primary model (GEMINI_MODEL) first, then fallbacks.
const models = () => [...new Set([process.env.GEMINI_MODEL, "gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash"].filter((m): m is string => !!m))];

const planResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    aggregate: { type: Type.STRING, enum: ["sum", "avg", "count", "min", "max", "count_distinct"] },
    column: { type: Type.STRING, nullable: true },
    groupBy: { type: Type.STRING, nullable: true },
    timeGrain: { type: Type.STRING, enum: ["none", "month", "year"] },
    filters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { column: { type: Type.STRING }, op: { type: Type.STRING, enum: ["=", "!=", ">", ">=", "<", "<=", "contains"] }, value: { type: Type.STRING } },
        required: ["column", "op", "value"],
      },
    },
    sort: { type: Type.STRING, enum: ["asc", "desc", "none"] },
    limit: { type: Type.INTEGER },
    chart: { type: Type.STRING, enum: ["bar", "line", "table", "number"] },
    explanation: { type: Type.STRING },
  },
  required: ["title", "aggregate", "chart"],
};

// Retries transient provider errors (overload, rate limit) and never leaks raw provider payloads to users.
// On overload it falls through to the next model in the chain, so one busy model never blocks a user.
async function retry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  const chain = models();
  let transient = false;
  for (let i = 0; i < chain.length; i++) {
    try {
      return await fn(chain[i]);
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      transient = /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|NOT_FOUND/.test(m);
      if (!transient) break;
    }
  }
  throw new Error(transient ? "The AI engine is busy right now. Please try again in a moment." : "The AI engine could not complete this request. Please try again.");
}

export type ContextItem ={ kind: string; name: string; definition: string };

function systemPrompt(columns: Column[], ctx: ContextItem[]) {
  return `You translate a business question into ONE structured query plan over a single table. You never compute numbers yourself.
Columns:
${schemaForPrompt(columns)}

Rules:
- Use only the column names listed above, spelled exactly.
- sum/avg/min/max require a numeric column. Use aggregate "count" (column null) to count rows.
- groupBy is a column name or null. If the question is about a trend over time, group by a date column with timeGrain "month" or "year" and chart "line".
- A single overall figure: groupBy null, chart "number".
- filters compare a column to a value; numbers as plain digits.
- If governed definitions below apply, follow them.
- explanation: one sentence on how you interpreted the question.
${ctx.length ? "\nGoverned definitions (endorsed):\n" + ctx.map((c) => `- [${c.kind}] ${c.name}: ${c.definition}`).join("\n") : ""}`;
}

export async function planQuestion(opts: { question: string; columns: Column[]; ctx: ContextItem[]; history?: { role: string; content: string }[] }): Promise<Plan> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("The AI engine is temporarily unavailable. Please try again shortly.");
  const ai = new GoogleGenAI({ apiKey: key });
  const hist = (opts.history ?? []).slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await retry((model) => ai.models.generateContent({
      model,
      contents: `${hist ? "Conversation so far:\n" + hist + "\n\n" : ""}Question: ${opts.question}${lastErr ? `\n\nYour previous plan was invalid: ${lastErr}. Fix it.` : ""}`,
      config: { systemInstruction: systemPrompt(opts.columns, opts.ctx), responseMimeType: "application/json", responseSchema: planResponseSchema, temperature: 0 },
    }));
    try {
      const raw = JSON.parse(res.text ?? "{}");
      if (Array.isArray(raw.filters)) raw.filters = raw.filters.map((f: { value: unknown }) => ({ ...f, value: typeof f.value === "string" && f.value.trim() !== "" && !isNaN(Number(f.value)) ? Number(f.value) : f.value }));
      for (const k of ["column", "groupBy"]) if (raw[k] === "" || raw[k] === "null") raw[k] = null;
      const plan = planSchema.parse(raw);
      const bad = validatePlan(plan, opts.columns);
      if (bad) { lastErr = bad; continue; }
      return plan;
    } catch (e) {
      lastErr = e instanceof Error ? e.message.slice(0, 200) : "invalid JSON";
    }
  }
  throw new Error(`The model could not produce a valid query plan (${lastErr}). Try rephrasing the question.`);
}

export async function narrate(opts: { question: string; plan: Plan; result: { columns: string[]; rows: unknown[][] } }): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return "";
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const res = await retry((model) => ai.models.generateContent({
      model,
      contents: `Question: ${opts.question}\nComputed result (authoritative, do not alter any number):\n${JSON.stringify(opts.result.rows.slice(0, 20))} with columns ${opts.result.columns.join(", ")}\nWrite 1-3 plain sentences answering the question using ONLY these numbers.`,
      config: { temperature: 0.2 },
    }));
    return (res.text ?? "").trim();
  } catch {
    return "";
  }
}

export async function agentCell(opts: { instruction: string; columns: Column[]; ctx: ContextItem[] }): Promise<{ markdown: string; plans: Plan[] }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("The AI engine is temporarily unavailable. Please try again shortly.");
  const ai = new GoogleGenAI({ apiKey: key });
  const res = await retry((model) => ai.models.generateContent({
    model,
    contents: `Task: ${opts.instruction}\nPropose up to 3 query plans that together address the task and a short markdown summary of your approach.`,
    config: {
      systemInstruction: systemPrompt(opts.columns, opts.ctx),
      responseMimeType: "application/json",
      temperature: 0,
      responseSchema: { type: Type.OBJECT, properties: { markdown: { type: Type.STRING }, plans: { type: Type.ARRAY, items: planResponseSchema } }, required: ["markdown", "plans"] },
    },
  }));
  const raw = JSON.parse(res.text ?? "{}");
  const plans: Plan[] = [];
  for (const p of raw.plans ?? []) {
    if (Array.isArray(p.filters)) p.filters = p.filters.map((f: { value: unknown }) => ({ ...f, value: typeof f.value === "string" && f.value.trim() !== "" && !isNaN(Number(f.value)) ? Number(f.value) : f.value }));
    for (const k of ["column", "groupBy"]) if (p[k] === "" || p[k] === "null") p[k] = null;
    const parsed = planSchema.safeParse(p);
    if (parsed.success && !validatePlan(parsed.data, opts.columns)) plans.push(parsed.data);
  }
  return { markdown: String(raw.markdown ?? ""), plans };
}
