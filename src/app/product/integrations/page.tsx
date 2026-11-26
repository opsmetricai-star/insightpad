import Shell from "@/components/Shell";
import { Btn, Section } from "@/components/ui";
import { dataConnections } from "@/content/site";

export const metadata = { title: "Data connections" };

export default function Page() {
  return (
    <Shell>
      <section className="bg-dots px-5 pb-16 pt-20 text-center md:px-8">
        <h1 className="font-display text-[clamp(38px,6vw,76px)] font-bold leading-none tracking-tight">How your data <span className="font-serif font-normal italic">enters the engine</span></h1>
      </section>
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {dataConnections.map((g) => (
            <div key={g.title} className="card p-7">
              <h2 className="font-display text-xl font-semibold">{g.title}</h2>
              <p className="mt-2 text-ink-soft">{g.blurb}</p>
              <div className="mt-5 flex flex-wrap gap-2">{g.items.map((i) => <span key={i} className="border border-line bg-paper px-2.5 py-1 font-mono text-xs">{i}</span>)}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex gap-5"><Btn href="/signup">Sign up</Btn><Btn href="/login">Log in</Btn></div>
      </Section>
    </Shell>
  );
}
