"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Btn, Icon, Logo } from "./ui";
import { platformCaps, platformProducts, resourcesNav, solutionsNav, type NavItem } from "@/content/site";

function Item({ it, onClick }: { it: NavItem; onClick?: () => void }) {
  return (
    <Link href={it.href} onClick={onClick} className="group flex gap-3 rounded-sm px-3 py-2.5 hover:bg-black/[0.04]">
      <span className="mt-0.5 text-ink/70"><Icon name={it.icon} /></span>
      <span>
        <span className="block text-[15px] font-medium text-ink">{it.title}</span>
        <span className="block text-[13px] leading-snug text-ink-soft">{it.desc}</span>
      </span>
    </Link>
  );
}

export default function Header({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    onScroll();
    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const txt = dark ? "text-rose" : "text-ink";
  const trigger = (key: string, label: string) => (
    <button
      aria-expanded={open === key}
      onClick={() => setOpen(open === key ? null : key)}
      onMouseEnter={() => setOpen(key)}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[15px] ${txt} ${open === key ? (dark ? "bg-white/10" : "bg-black/[0.07]") : ""}`}
    >
      {label}
      <svg width="9" height="6" viewBox="0 0 9 6" className={`transition-transform ${open === key ? "rotate-180" : ""}`}><path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" /></svg>
    </button>
  );

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-50 transition-colors ${dark ? "bg-night/85 text-rose" : "text-ink"} ${scrolled ? (dark ? "backdrop-blur-md border-b border-night-line" : "bg-paper/85 backdrop-blur-md border-b border-line") : ""}`}
      onMouseLeave={() => setOpen(null)}
    >
      <div className="relative mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 md:justify-center md:gap-10 md:px-8">
        <nav className="hidden items-center md:flex" aria-label="Primary">
          {trigger("platform", "Platform")}
          {trigger("solutions", "Solutions")}
          <Link href="/enterprise" className={`px-3 py-1.5 text-[15px] ${txt}`} onMouseEnter={() => setOpen(null)}>Enterprise</Link>
        </nav>
        <Logo dark={dark} />
        <nav className="hidden items-center md:flex" aria-label="Secondary">
          {trigger("resources", "Resources")}
          <Link href="/pricing" className={`px-3 py-1.5 text-[15px] ${txt}`} onMouseEnter={() => setOpen(null)}>Pricing</Link>
          <Link href="/login" className={`px-3 py-1.5 text-[15px] opacity-80 ${txt}`}>Log in</Link>
          <Btn href="/signup" dark={dark} sm className="ml-2">Sign up</Btn>
        </nav>
        <button className="md:hidden" aria-label="Menu" onClick={() => setMobile(!mobile)}><Icon name={mobile ? "close" : "menu"} size={24} /></button>
      </div>

      {/* Desktop dropdown panels */}
      {open === "platform" && (
        <div className="absolute left-1/2 top-[60px] hidden w-[770px] -translate-x-1/2 border border-line bg-paper p-2 text-ink shadow-2xl md:block">
          <div className="grid grid-cols-2 gap-x-4 p-3">
            <div>
              <p className="tag-label mb-2 px-3 text-ink-soft">Products</p>
              {platformProducts.map((i) => <Item key={i.href} it={i} onClick={() => setOpen(null)} />)}
            </div>
            <div>
              <p className="tag-label mb-2 px-3 text-ink-soft">Capabilities</p>
              {platformCaps.map((i) => <Item key={i.href} it={i} onClick={() => setOpen(null)} />)}
            </div>
          </div>
          <Link href="/capability/ai" onClick={() => setOpen(null)} className="bg-dots bg-rose-bg/70 mx-1 mb-1 block border border-line px-5 py-4 hover:bg-rose-bg">
            <Icon name="db" />
            <span className="mt-2 block text-[15px] font-medium">AI &amp; agents</span>
            <span className="block text-[13px] text-ink-soft">Agentic workflows to empower your entire team</span>
          </Link>
        </div>
      )}
      {open === "solutions" && (
        <div className="absolute left-1/2 top-[60px] hidden w-[400px] -translate-x-[70%] border border-line bg-paper p-3 text-ink shadow-2xl md:block">
          <p className="tag-label mb-2 px-3 text-ink-soft">By team</p>
          {solutionsNav.map((i) => <Item key={i.href} it={i} onClick={() => setOpen(null)} />)}
        </div>
      )}
      {open === "resources" && (
        <div className="absolute left-1/2 top-[60px] hidden w-[620px] translate-x-[-15%] border border-line bg-paper p-3 text-ink shadow-2xl md:block">
          <div className="grid grid-cols-2">
            {resourcesNav.map((i) => <Item key={i.href} it={i} onClick={() => setOpen(null)} />)}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobile && (
        <div className={`max-h-[calc(100vh-68px)] overflow-y-auto border-t px-5 pb-8 md:hidden ${dark ? "border-night-line bg-night" : "border-line bg-paper"}`}>
          {[["Platform", [...platformProducts, ...platformCaps]], ["Solutions", solutionsNav], ["Resources", resourcesNav]].map(([label, items]) => (
            <details key={label as string} className="border-b border-current/10 py-3">
              <summary className="flex justify-between py-1 text-lg font-display">{label as string}<Icon name="arrow" size={16} /></summary>
              <div className="mt-2 grid gap-1">
                {(items as NavItem[]).map((i) => <Item key={i.href} it={i} onClick={() => setMobile(false)} />)}
              </div>
            </details>
          ))}
          <Link href="/enterprise" onClick={() => setMobile(false)} className="block border-b border-current/10 py-4 font-display text-lg">Enterprise</Link>
          <Link href="/pricing" onClick={() => setMobile(false)} className="block border-b border-current/10 py-4 font-display text-lg">Pricing</Link>
          <div className="mt-6 flex gap-3">
            <Btn href="/login" dark={dark}>Log in</Btn>
            <Btn href="/signup" dark={dark} solid={!dark}>Sign up</Btn>
          </div>
        </div>
      )}
    </header>
  );
}
