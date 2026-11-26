import Link from "next/link";
import { Fragment } from "react";
import Shell from "@/components/Shell";
import { Btn, Faq, Icon, Section } from "@/components/ui";
import { compareRows, plans, pricingFaq, type Plan } from "@/content/site";

export const metadata = { title: "Pricing", description: "Plans for individuals and teams running decisions on AI analytics." };

function PlanCard({ p }: { p: Plan }) {
  const href = p.id === "community" ? "/signup" : `/signup?plan=${p.id}`;
  return (
    <div className="flex flex-col p-6 md:p-8">
      <span className="mb-10 grid h-9 w-9 place-items-center border border-night-line text-rose"><Icon name={p.id === "community" ? "db" : p.id === "professional" ? "spark" : p.id === "team" ? "frame" : "shield"} /></span>
      <h2 className="font-display text-3xl font-bold text-white">{p.name}</h2>
      <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-rose">{p.blurb}</p>
      <p className="mt-6 font-display text-3xl font-semibold text-white">{p.price} {p.unit && <span className="block text-sm font-normal text-rose-dim sm:inline">{p.unit}</span>}</p>
      <div className="mt-5"><Btn href={href} dark className="w-full">{p.cta}</Btn></div>
      <p className="tag-label mt-8 text-rose-dim">{p.lead || "Includes:"}</p>
      <ul className="mt-3 space-y-2.5 text-sm">
        {p.features.map((f) => <li key={f} className="flex gap-2.5"><span className="mt-0.5 text-rose"><Icon name="check" size={15} /></span>{f}</li>)}
      </ul>
    </div>
  );
}

function Group({ label, items }: { label: string; items: Plan[] }) {
  return (
    <div className="relative border border-night-line">
      <span className="tag-label absolute -top-3.5 left-1/2 -translate-x-1/2 border border-night-line bg-night px-5 py-1.5 text-rose">{label}</span>
      <div className="grid divide-night-line md:grid-cols-2 md:divide-x">{items.map((p) => <PlanCard key={p.id} p={p} />)}</div>
    </div>
  );
}

export default function Pricing() {
  return (
    <Shell dark>
      <section className="bg-grid-night bg-noise relative px-5 pb-16 pt-16 md:px-8 md:pt-24">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="font-display text-[clamp(52px,9vw,120px)] font-bold leading-none tracking-tight text-white">Pricing</h1>
          <p className="mt-6 max-w-2xl text-rose">Pay for the AI capacity your teams use. Every plan includes notebooks, conversational analytics, Context Studio and evals.</p>
          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <Group label="INDIVIDUAL PLANS" items={plans.filter((p) => p.group === "INDIVIDUAL PLANS")} />
            <Group label="TEAM PLANS" items={plans.filter((p) => p.group === "TEAM PLANS")} />
          </div>
          <p className="mt-6 text-sm text-rose-dim">Paid plans start after you create an account: you pay through checkout, and an administrator verifies the payment before your limits change.</p>
        </div>
      </section>

      <Section dark>
        <h2 className="mb-10 font-display text-[clamp(30px,4vw,52px)] font-bold text-white">Compare plan features</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-night">
              <tr className="border-b border-night-line">
                <th className="w-[28%] py-4" />
                {plans.map((p) => (
                  <th key={p.id} className="py-4 pr-3 align-bottom font-display text-lg text-white">
                    {p.name}
                    <div className="mt-2 font-body text-sm font-normal"><Link href={p.id === "community" ? "/signup" : `/signup?plan=${p.id}`} className="underline">Sign up</Link></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((g) => (
                <Fragment key={g.section}>
                  <tr><td colSpan={5} className="tag-label pb-2 pt-9 text-rose">{g.section}</td></tr>
                  {g.rows.map((r) => (
                    <tr key={g.section + r[0]} className="border-t border-night-line">
                      <td className="py-3.5 pr-3 text-rose">{r[0]}</td>
                      {r.slice(1).map((c, i) => <td key={i} className="py-3.5 pr-3 text-white">{c === "Yes" ? <Icon name="check" size={16} /> : c}</td>)}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section dark>
        <h2 className="mb-8 font-display text-[clamp(30px,4vw,52px)] font-bold text-white">FAQ</h2>
        <Faq items={pricingFaq} dark />
      </Section>
    </Shell>
  );
}
