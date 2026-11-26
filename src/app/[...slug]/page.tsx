// Secondary public pages (company, resources, legal) rendered from one data-driven route.
// Specific routes (/, /pricing, /product/*, /solutions/[slug], /app/*, /login ...) take priority over this catch-all.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SimplePage } from "@/components/Simple";
import { Icon } from "@/components/ui";
import { docsEntries, solutionsNav } from "@/content/site";

type Entry = { title: string; italic?: string; lead?: string; cta?: boolean; body: () => ReactNode };

const Cards = ({ items }: { items: [string, string][] }) => (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {items.map(([t, b]) => (
      <article key={t} className="card p-7">
        <h2 className="font-display text-xl font-semibold leading-snug">{t}</h2>
        <p className="mt-2 text-ink-soft">{b}</p>
      </article>
    ))}
  </div>
);
const Prose = ({ p }: { p: string[] }) => <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-ink-soft">{p.map((x) => <p key={x}>{x}</p>)}</div>;

const compare = [
  ["Agentic notebook with an AI analyst", "Yes", "Limited", "Manual"],
  ["Plain-language questions on governed definitions", "Yes", "Limited", "No"],
  ["Query plan visible for every answer", "Yes", "No", "Manual"],
  ["Accuracy evals against known values", "Yes", "No", "No"],
  ["Live, shareable data apps", "Yes", "Yes", "Limited"],
  ["Credit cost logged per AI action", "Yes", "No", "No"],
];

const entries: Record<string, Entry> = {
  solutions: {
    title: "Solutions", italic: "for every function", lead: "Each team asks its own questions of its own data and gets a verified answer.",
    body: () => (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {solutionsNav.map((s) => (
          <Link key={s.href} href={s.href} className="card p-7 transition-transform hover:-translate-y-1">
            <Icon name={s.icon} size={26} />
            <h2 className="mt-5 font-display text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-ink-soft">{s.desc}</p>
          </Link>
        ))}
      </div>
    ),
  },
  about: {
    title: "Faster decisions from", italic: "trusted data", lead: "We build the analytics engine where AI does the analysis and code guarantees the numbers.",
    body: () => <Cards items={[["Our mission", "Remove the gap between a business question and a trustworthy answer."], ["Our principle", "AI plans, code computes, people verify. No figure is ever produced by a language model."], ["Our standard", "Every answer shows its logic, and every definition can be tested against known values."]]} />,
  },
  compare: {
    title: "InsightPad compared with", italic: "legacy tools", lead: "A capability comparison against typical BI dashboards and standalone notebooks.",
    body: () => (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-b border-ink"><th className="py-3">Capability</th><th>InsightPad</th><th>Typical BI tool</th><th>Standalone notebook</th></tr></thead>
          <tbody>{compare.map((r) => <tr key={r[0]} className="border-b border-line">{r.map((c, i) => <td key={i} className="py-3.5 pr-4">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    ),
  },
  docs: { title: "Documentation", lead: "How each part of InsightPad works.", body: () => <Cards items={docsEntries} /> },
  trust: {
    title: "Trust", italic: "center", lead: "How InsightPad protects your data.",
    body: () => <Cards items={[["Row Level Security", "Every table enforces per-workspace access in the database itself."], ["Private storage", "Uploaded files live in private buckets and are served by short-lived signed URL."], ["Server-only secrets", "AI and service keys are never sent to the browser."], ["Minimal model exposure", "The model sees column names, types and a few sample values, never full tables."], ["Usage visibility", "Every AI action is logged with its credit cost."], ["Verified billing", "Plans change only after an administrator verifies a payment."]]} />,
  },
  "legal/privacy": {
    title: "Privacy policy", cta: false,
    body: () => <Prose p={["InsightPad collects the account details you provide, the datasets you upload and the usage events needed to operate and bill the service.", "Datasets are stored in private storage and are accessible only to members of your workspace. To plan a query, we send an AI provider the column names, types and a few sample values from the relevant dataset, together with your question and endorsed definitions.", "We do not sell personal data. Workspace owners and editors can delete datasets, notebooks and apps at any time from within the application.", "Last updated: November 2026."]} />,
  },
  "legal/terms": {
    title: "Terms and conditions", cta: false,
    body: () => <Prose p={["By using InsightPad you agree to use the service lawfully and not to attempt to access another workspace's data.", "Paid plans are billed through our checkout partner and activate after an administrator verifies the payment. AI actions consume credits as described on the Pricing page.", "You retain ownership of the data you upload. We may suspend accounts that abuse the service or its limits.", "Last updated: November 2026."]} />,
  },
};

export function generateStaticParams() {
  return Object.keys(entries).map((k) => ({ slug: k.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const e = entries[slug.join("/")];
  return e ? { title: e.title } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const e = entries[slug.join("/")];
  if (!e) notFound();
  return <SimplePage title={e.title} italic={e.italic} lead={e.lead} cta={e.cta ?? true}>{e.body()}</SimplePage>;
}
