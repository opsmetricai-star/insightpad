import Shell from "./Shell";
import { Btn, Section } from "./ui";
import type { ReactNode } from "react";

export function PageHero({ title, italic, lead, dark }: { title: string; italic?: string; lead?: string; dark?: boolean }) {
  return (
    <section className={`relative overflow-hidden px-5 pb-14 pt-16 md:px-8 md:pt-24 ${dark ? "bg-grid-night" : "bg-dots"}`}>
      {!dark && <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />}
      <div className="relative mx-auto max-w-[1180px]">
        <h1 className={`rise font-display text-[clamp(40px,6.4vw,84px)] font-bold leading-[1] tracking-[-0.03em] ${dark ? "text-white" : ""}`}>
          {title} {italic && <span className="font-serif font-normal italic">{italic}</span>}
        </h1>
        {lead && <p className={`rise rise-2 mt-6 max-w-2xl text-lg leading-relaxed ${dark ? "text-rose" : "text-ink-soft"}`}>{lead}</p>}
      </div>
    </section>
  );
}

export function SimplePage({ title, italic, lead, children, cta = true }: { title: string; italic?: string; lead?: string; children: ReactNode; cta?: boolean }) {
  return (
    <Shell>
      <PageHero title={title} italic={italic} lead={lead} />
      <Section>{children}</Section>
      {cta && (
        <section className="bg-dots px-5 py-20 text-center">
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-bold tracking-tight">Put an AI analyst on your data</h2>
          <div className="mt-7 flex flex-wrap justify-center gap-5"><Btn href="/signup">Sign up</Btn><Btn href="/login">Log in</Btn></div>
        </section>
      )}
    </Shell>
  );
}
