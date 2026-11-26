import Shell from "./Shell";
import { Btn, Eyebrow, Faq, Section } from "./ui";
import { Visual } from "./Visuals";
import type { PageDef } from "@/content/site";

export default function ContentPage({ def }: { def: PageDef }) {
  const dark = def.theme === "night";
  return (
    <Shell dark={dark}>
      <section className={`relative overflow-hidden px-5 pb-20 pt-16 md:px-8 md:pt-24 ${dark ? "bg-grid-night" : "bg-dots"}`}>
        {!dark && <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />}
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 md:grid-cols-[1.05fr_1fr]">
          <div className="rise">
            {def.kicker && <Eyebrow dark={dark}>{def.kicker}</Eyebrow>}
            <h1 className={`mt-5 font-display text-[clamp(38px,5.6vw,72px)] font-bold leading-[1.02] tracking-[-0.03em] ${dark ? "text-white" : "text-ink"}`}>{def.h1}</h1>
            <p className={`mt-6 max-w-xl text-lg leading-relaxed ${dark ? "text-rose" : "text-ink-soft"}`}>{def.lead}</p>
            <div className="mt-9 flex flex-wrap gap-5">
              <Btn href="/signup" dark={dark}>Sign up</Btn>
              <Btn href="/login" dark={dark}>Log in</Btn>
            </div>
          </div>
          <div className="rise rise-2"><Visual kind={def.visual} dark={dark} /></div>
        </div>
      </section>

      {def.blocks.map((b, i) => (
        <Section key={b.title} dark={dark} className={dark ? (i % 2 ? "bg-night-2/40" : "") : i % 2 ? "bg-paper-2" : ""}>
          <div className={`grid items-center gap-12 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <span className="tag-label opacity-60">0{i + 1}</span>
              <h2 className={`mt-3 font-display text-[clamp(26px,3.2vw,40px)] font-semibold leading-tight tracking-tight ${dark ? "text-white" : ""}`}>{b.title}</h2>
              <p className={`mt-4 max-w-lg text-[17px] leading-relaxed ${dark ? "text-rose-dim" : "text-ink-soft"}`}>{b.body}</p>
              {b.bullets && (
                <ul className="mt-5 space-y-2.5">
                  {b.bullets.map((x) => <li key={x} className="flex gap-3 text-[15px]"><span className="mt-2 h-1.5 w-1.5 shrink-0 bg-violet" />{x}</li>)}
                </ul>
              )}
            </div>
            <Visual kind={b.visual || "unified"} dark={dark && b.visual === "terminal"} />
          </div>
        </Section>
      ))}

      {def.steps && (
        <Section dark={dark}>
          <h2 className={`mb-10 font-display text-[clamp(26px,3.2vw,40px)] font-semibold tracking-tight ${dark ? "text-white" : ""}`}>{def.stepsTitle || "Where to start"}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {def.steps.map((s, i) => (
              <div key={s.title} className={`p-6 ${dark ? "border border-night-line" : "card"}`}>
                <span className="tag-label text-violet">STEP {i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm opacity-80">{s.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {def.faq && (
        <Section dark={dark}>
          <h2 className={`mb-8 font-display text-[clamp(26px,3.2vw,40px)] font-semibold tracking-tight ${dark ? "text-white" : ""}`}>FAQ</h2>
          <Faq items={def.faq} dark={dark} />
        </Section>
      )}

      <section className={`px-5 py-24 text-center md:px-8 ${dark ? "bg-grid-night" : "bg-dots"}`}>
        <h2 className={`mx-auto max-w-3xl font-display text-[clamp(30px,4.4vw,54px)] font-bold leading-tight tracking-tight ${dark ? "text-white" : ""}`}>{def.ctaTitle}</h2>
        <p className={`mx-auto mt-4 max-w-lg text-lg ${dark ? "text-rose" : "text-ink-soft"}`}>{def.ctaBody}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-5">
          <Btn href="/signup" dark={dark}>Sign up</Btn>
          <Btn href="/login" dark={dark}>Log in</Btn>
        </div>
      </section>
    </Shell>
  );
}
