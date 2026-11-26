import Link from "next/link";
import type { ReactNode } from "react";

export function Logo({ dark = false, size = 26 }: { dark?: boolean; size?: number }) {
  return (
    <Link href="/" aria-label="InsightPad home" className="inline-flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
        {/* pixel "pad" mark */}
        {[
          [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
          [1, 2], [7, 2], [1, 3], [3, 3], [4, 3], [5, 3], [7, 3],
          [1, 4], [3, 4], [5, 4], [7, 4], [1, 5], [3, 5], [4, 5], [5, 5], [7, 5],
          [1, 6], [7, 6], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
        ].map(([x, y], i) => (
          <rect key={i} x={x * 2} y={y * 2} width="2" height="2" fill={dark ? "#f0b8b8" : "#1b1727"} />
        ))}
      </svg>
      <span className="font-pixel font-bold tracking-wide" style={{ fontSize: size * 0.7, color: dark ? "#f0b8b8" : "#1b1727" }}>
        INSIGHTPAD
      </span>
    </Link>
  );
}

export function Btn({ href, children, dark, solid, sm, className = "", ...rest }: { href: string; children: ReactNode; dark?: boolean; solid?: boolean; sm?: boolean; className?: string } & Record<string, unknown>) {
  const cls = `btn ${dark ? "btn-dark" : ""} ${solid ? "btn-solid" : ""} ${sm ? "btn-sm" : ""} ${className}`;
  const external = href.startsWith("http");
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
  ) : (
    <Link href={href} className={cls} {...rest}>{children}</Link>
  );
}

export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`tag-label inline-block border px-2 py-1 ${dark ? "border-night-line text-rose-dim" : "border-line text-ink-soft bg-white/60"}`}>
      {children}
    </span>
  );
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "square" as const };
  switch (name) {
    case "layers": return <svg {...p}><rect x="4" y="4" width="16" height="4" /><rect x="4" y="10" width="16" height="4" /><rect x="4" y="16" width="16" height="4" /></svg>;
    case "chat": return <svg {...p}><path d="M4 6h12v8H9l-4 3v-3H4z" /><path d="M18 9h2v8h-3v3l-3-3h-4" /></svg>;
    case "book": return <svg {...p}><rect x="4" y="4" width="16" height="16" /><path d="M9 4v16M12 9h5M12 13h5" /></svg>;
    case "app": return <svg {...p}><rect x="4" y="4" width="16" height="16" /><path d="M4 12h16M12 12v8" /></svg>;
    case "terminal": return <svg {...p}><path d="M5 8l4 4-4 4M12 17h7" /></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>;
    case "grid": return <svg {...p}><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><path d="M13 13h7v7h-7z" /></svg>;
    case "download": return <svg {...p}><path d="M12 5v10M8 11l4 4 4-4M5 19h14" /></svg>;
    case "plug": return <svg {...p}><rect x="4" y="5" width="6" height="6" /><rect x="14" y="13" width="6" height="6" /><path d="M10 8h4v8" /></svg>;
    case "frame": return <svg {...p}><path d="M5 5h3M16 5h3M5 19h3M16 19h3M5 5v3M5 16v3M19 5v3M19 16v3" /><rect x="9" y="9" width="6" height="6" /></svg>;
    case "spark": return <svg {...p}><path d="M12 3v7M12 14v7M3 12h7M14 12h7" /><circle cx="12" cy="12" r="2" /></svg>;
    case "burst": return <svg {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M10 14l-4 4" /></svg>;
    case "fan": return <svg {...p}><path d="M12 20L4 6M12 20L8 5M12 20l4-15M12 20l8-14M12 20V4" /></svg>;
    case "globe": return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c-3 3-3 13 0 16M12 4c3 3 3 13 0 16" /></svg>;
    case "check": return <svg {...p}><path d="M5 12l5 5 9-10" /></svg>;
    case "arrow": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "db": return <svg {...p}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3 3 7 3s7-1.3 7-3" /></svg>;
    case "bell": return <svg {...p}><path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4" /></svg>;
    case "cog": return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></svg>;
    case "card": return <svg {...p}><rect x="3" y="6" width="18" height="12" /><path d="M3 10h18M7 15h4" /></svg>;
    case "flask": return <svg {...p}><path d="M9 4h6M10 4v6l-5 9h14l-5-9V4" /></svg>;
    case "home": return <svg {...p}><path d="M4 11l8-7 8 7v9H4z" /></svg>;
    case "menu": return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "close": return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "shield": return <svg {...p}><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="6" /></svg>;
  }
}

export function Faq({ items, dark }: { items: [string, string][]; dark?: boolean }) {
  return (
    <div className={`border-t ${dark ? "border-night-line" : "border-line"}`}>
      {items.map(([q, a]) => (
        <details key={q} className={`group border-b py-5 ${dark ? "border-night-line" : "border-line"}`}>
          <summary className="flex items-center justify-between gap-6 font-display text-lg font-medium">
            {q}
            <span className="relative h-4 w-4 shrink-0 transition-transform group-open:rotate-45">
              <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
              <span className="absolute left-1/2 top-0 h-full w-px bg-current" />
            </span>
          </summary>
          <p className={`mt-3 max-w-3xl text-[15px] leading-relaxed ${dark ? "text-rose-dim" : "text-ink-soft"}`}>{a}</p>
        </details>
      ))}
    </div>
  );
}

export function Section({ children, className = "", dark, id }: { children: ReactNode; className?: string; dark?: boolean; id?: string }) {
  return (
    <section id={id} className={`relative px-5 py-20 md:px-8 md:py-28 ${dark ? "theme-night" : ""} ${className}`}>
      <div className="mx-auto max-w-[1180px]">{children}</div>
    </section>
  );
}

export function Quote({ text, name, role, dark }: { text: string; name: string; role: string; dark?: boolean }) {
  return (
    <figure className="flex max-w-xl gap-4">
      <div className={`w-px shrink-0 ${dark ? "bg-night-line" : "bg-ink/30"}`} />
      <div>
        <blockquote className="font-display text-lg leading-snug">“{text}”</blockquote>
        <figcaption className="tag-label mt-3 opacity-70">{name}. {role}</figcaption>
      </div>
    </figure>
  );
}
