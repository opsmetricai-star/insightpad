import Link from "next/link";
import { Logo } from "./ui";
import { footerCols } from "@/content/site";

export default function Footer({ dark = false }: { dark?: boolean }) {
  return (
    <footer className={`relative border-t px-5 pb-10 pt-16 md:px-8 ${dark ? "border-night-line bg-night text-rose-dim" : "border-line bg-paper-2 text-ink-soft"}`}>
      <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo dark={dark} />
          <p className="mt-4 max-w-[240px] text-sm leading-relaxed">The AI analytics engine for decisive teams.</p>
        </div>
        {footerCols.map((c) => (
          <div key={c.title}>
            <p className={`tag-label mb-4 ${dark ? "text-rose" : "text-ink"}`}>{c.title}</p>
            <ul className="space-y-2.5 text-[14px]">
              {c.links.map(([l, h]) => (
                <li key={l}><Link href={h} className="hover:underline">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`mx-auto mt-14 max-w-[1180px] border-t pt-6 text-[13px] ${dark ? "border-night-line" : "border-line"}`}>
        © 2026 InsightPad, Inc. All rights reserved.
      </div>
    </footer>
  );
}
