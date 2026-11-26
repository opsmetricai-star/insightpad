// Stylised product mockups drawn with CSS/SVG. They echo the reference's UI "windows"
// (panels with title bars, charts, chat bubbles, terminals) using original artwork.
import type { ReactNode } from "react";

export function Window({ title, children, dark, className = "" }: { title?: string; children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <div className={`overflow-hidden border ${dark ? "border-night-line bg-night-2 text-rose-dim" : "card text-ink"} ${className}`}>
      <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${dark ? "border-night-line" : "border-line"}`}>
        <span className="h-2 w-2 rounded-full bg-current opacity-30" />
        <span className="h-2 w-2 rounded-full bg-current opacity-30" />
        <span className="h-2 w-2 rounded-full bg-current opacity-30" />
        {title && <span className="tag-label ml-2 opacity-70">{title}</span>}
      </div>
      {children}
    </div>
  );
}

export function BarChart({ data, colors = ["#7a6bb5", "#e8a3a3", "#3c9b7e"], h = 140 }: { data: number[][]; colors?: string[]; h?: number }) {
  const max = Math.max(...data.flat());
  return (
    <div className="flex items-end gap-3 px-1" style={{ height: h }}>
      {data.map((g, i) => (
        <div key={i} className="flex flex-1 items-end gap-1">
          {g.map((v, j) => (
            <div key={j} className="flex-1" style={{ height: `${(v / max) * 100}%`, background: colors[j % colors.length] }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LineChart({ w = 320, h = 140, dashed }: { w?: number; h?: number; dashed?: boolean }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Line chart">
      {[0.2, 0.4, 0.6, 0.8].map((t) => <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="currentColor" opacity="0.1" />)}
      <polyline fill="none" stroke="#7a6bb5" strokeWidth="2.5" points={`0,${h * 0.8} ${w * 0.2},${h * 0.62} ${w * 0.4},${h * 0.66} ${w * 0.6},${h * 0.4} ${w * 0.8},${h * 0.3} ${w},${h * 0.12}`} />
      {dashed && <polyline fill="none" stroke="#7a6bb5" strokeWidth="2" strokeDasharray="5 5" points={`${w * 0.6},${h * 0.4} ${w * 0.8},${h * 0.35} ${w},${h * 0.25}`} />}
      <polyline fill="none" stroke="#e8a3a3" strokeWidth="2.5" points={`0,${h * 0.9} ${w * 0.25},${h * 0.8} ${w * 0.5},${h * 0.82} ${w * 0.75},${h * 0.6} ${w},${h * 0.55}`} />
    </svg>
  );
}

function Bubble({ me, children }: { me?: boolean; children: ReactNode }) {
  return (
    <div className={`flex ${me ? "justify-end" : ""}`}>
      <div className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed ${me ? "bg-ink text-white" : "border border-line bg-paper"}`}>{children}</div>
    </div>
  );
}

export function ChatMock() {
  return (
    <Window title="Galactic revenue insights · Thread">
      <div className="space-y-3 p-5">
        <Bubble me>Get me Q3 sales by product line</Bubble>
        <Bubble>
          I used the endorsed <b>Sales model</b> and grouped revenue by product line:
          <ul className="mt-2 space-y-0.5 font-mono text-[12px]">
            <li>Teleport pads <span className="float-right">$42.3M</span></li>
            <li>Quantum drives <span className="float-right">$38.7M</span></li>
            <li>Wormhole starters <span className="float-right">$33.1M</span></li>
          </ul>
        </Bubble>
        <div className="border border-line p-3"><BarChart data={[[30, 20, 12], [38, 26, 18], [42, 38, 33]]} h={90} /></div>
        <Bubble me>Break it out by region too</Bubble>
        <div className="flex items-center gap-2 text-[12px] text-ink-soft"><span className="h-2 w-2 animate-pulse rounded-full bg-violet" /> Planning query<span className="caret">▍</span></div>
      </div>
    </Window>
  );
}

export function NotebookMock() {
  return (
    <Window title="Revenue model · Notebook">
      <div className="space-y-3 p-5 text-[12px]">
        <div className="border border-line bg-paper p-3 font-mono"><span className="text-violet">SELECT</span> region, <span className="text-violet">SUM</span>(revenue) <span className="text-violet">FROM</span> sales <span className="text-violet">GROUP BY</span> 1</div>
        <div className="grid grid-cols-3 gap-2 font-mono">
          {["Core", "Mid-Rim", "Outer"].map((r, i) => (
            <div key={r} className="border border-line p-2"><div className="text-ink-soft">{r}</div><div className="text-lg">{["$61M", "$48M", "$27M"][i]}</div></div>
          ))}
        </div>
        <div className="border border-line p-3"><LineChart dashed /></div>
        <div className="flex items-center gap-2 border border-dashed border-violet/50 bg-violet/5 p-2.5 text-violet">◆ Agent: add a forecast cell for next quarter</div>
      </div>
    </Window>
  );
}

export function AccountsMock() {
  const rows = [["Forma", "$42k", "↘ -24%"], ["Layers", "$68k", "↘ -18%"], ["Orbit", "$31k", "→ +2%"], ["Nimbus", "$55k", "↘ -12%"]];
  return (
    <Window title="Customer portfolio">
      <div className="p-6">
        <p className="tag-label text-ink-soft">Customer portfolio</p>
        <p className="font-display text-5xl tracking-tight">283 accounts</p>
        <table className="mt-4 w-full text-sm">
          <thead><tr className="text-left text-ink-soft"><th className="py-2 font-normal">Account</th><th className="font-normal">ARR</th><th className="font-normal">Usage</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-line"><td className="py-2.5">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
        </table>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm shadow-sm">Keep an eye on customer accounts</div>
      </div>
    </Window>
  );
}

export function ContextMock({ dark }: { dark?: boolean }) {
  return (
    <Window title="Context Studio · Observability" dark={dark}>
      <div className="p-5 text-[12px]">
        <div className="mb-4 flex flex-wrap gap-2">{["All roles", "All users", "All topics", "Last 7 days"].map((t) => <span key={t} className="border border-current/20 px-2 py-1 opacity-80">{t} ▾</span>)}</div>
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[["Conversations", "461"], ["Unique users", "55"], ["Warnings", "12"]].map(([a, b]) => <div key={a} className="border border-current/15 p-3"><div className="opacity-60">{a}</div><div className="font-display text-2xl">{b}</div></div>)}
        </div>
        <BarChart data={[[30], [38], [26], [44], [35], [48], [40]]} colors={["#e8a3a3"]} h={80} />
        <div className="mt-4 divide-y divide-current/10 font-mono">
          {[["44m", "Revenue change by region", ""], ["1h", "Top product lines by sector", "User doubt"], ["3h", "Negative feedback summary", "Missing context"]].map((r) => (
            <div key={r[1]} className="flex justify-between gap-3 py-2"><span className="opacity-60">{r[0]}</span><span className="flex-1 truncate">{r[1]}</span><span className="text-rose-dim">{r[2]}</span></div>
          ))}
        </div>
      </div>
    </Window>
  );
}

export function EvalsMock() {
  return (
    <Window title="Evals · Q3 launch readiness">
      <div className="p-5 text-[13px]">
        <div className="mb-3 flex gap-3"><span className="bg-mint/15 px-2 py-0.5 text-mint">3 passed</span><span className="bg-red-100 px-2 py-0.5 text-red-700">2 failed</span></div>
        {[["How much ARR from active customers?", "Passed"], ["Which features are in the launch?", "Passed"], ["What migration discounts exist?", "Failed"], ["Which connectors are GA?", "Failed"]].map(([p, s]) => (
          <div key={p} className="flex items-center justify-between border-t border-line py-2.5"><span>{p}</span><span className={s === "Passed" ? "text-mint" : "text-red-600"}>{s}</span></div>
        ))}
      </div>
    </Window>
  );
}

export function TerminalMock({ dark = true }: { dark?: boolean }) {
  return (
    <Window title="Terminal" dark={dark}>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed">
{`$ insightpad thread create "Q3 sales by product line"
   Thread ID:  8f2c91a0-5b1e
   Created:    2026-11-26T16:06:34Z
   Answer:     Teleport pads  $42.3M
   Credits:    1.8
→ ~ `}<span className="caret">▍</span>
      </pre>
    </Window>
  );
}

export function DashboardMock() {
  return (
    <Window title="Revenue overview · App">
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <div className="border border-line p-3"><p className="tag-label mb-2 text-ink-soft">Revenue by quarter</p><BarChart data={[[20, 12], [28, 18], [36, 24], [44, 30]]} h={100} /></div>
        <div className="border border-line p-3"><p className="tag-label mb-2 text-ink-soft">Growth</p><LineChart h={100} /></div>
        <div className="border border-line p-3 sm:col-span-2"><p className="tag-label mb-2 text-ink-soft">Customer demand</p>
          <div className="grid grid-cols-12 gap-1">{Array.from({ length: 36 }).map((_, i) => <div key={i} className="h-5" style={{ background: `rgba(122,107,181,${0.12 + ((i * 37) % 10) / 12})` }} />)}</div>
        </div>
      </div>
    </Window>
  );
}

export function GenericMock({ kind }: { kind: string }) {
  const label: Record<string, string> = { agent: "Agent plan", code: "Python cell", nocode: "Point & click", graph: "Dependency graph", team: "Shared workspace", trust: "Query plan", promote: "Promote to notebook", everyone: "Everyone asks", unified: "Unified context", observe: "Observability", improve: "Suggested improvements", canvas: "App canvas", drill: "Drill-down", loop: "Feedback loop", commands: "Commands", pipeline: "Pipeline", templates: "Templates", switch: "Migration plan", embed: "Embedded view", theme: "Custom theme", mobile: "Mobile view", money: "Premium tier", alert: "Alert rule", shield: "Security", toggles: "Permissions", integrations: "Integrations", enterprise: "Admin console" };
  const items = ["Define", "Connect", "Ask", "Publish"];
  return (
    <Window title={label[kind] || "InsightPad"}>
      <div className="space-y-3 p-5 text-[13px]">
        {items.map((t, i) => (
          <div key={t} className="flex items-center gap-3 border border-line bg-paper p-3">
            <span className="grid h-6 w-6 place-items-center bg-ink font-mono text-[11px] text-white">{i + 1}</span>
            <span className="flex-1">{label[kind] || "InsightPad"} · {t}</span>
            <span className="h-1.5 w-16 bg-violet/40"><span className="block h-full bg-violet" style={{ width: `${40 + i * 18}%` }} /></span>
          </div>
        ))}
        <LineChart h={70} />
      </div>
    </Window>
  );
}

export function Visual({ kind, dark }: { kind: string; dark?: boolean }) {
  switch (kind) {
    case "chat": return <ChatMock />;
    case "notebook": case "code": return <NotebookMock />;
    case "context": case "observe": return <ContextMock dark={dark} />;
    case "evals": return <EvalsMock />;
    case "terminal": case "commands": return <TerminalMock dark />;
    case "app": case "dashboard": case "canvas": case "embed": return <DashboardMock />;
    case "chart": case "drill": return <Window title="Chart"><div className="p-5"><BarChart data={[[20, 12, 8], [28, 18, 12], [36, 24, 14], [44, 30, 22]]} /><div className="mt-4"><LineChart dashed /></div></div></Window>;
    case "accounts": return <AccountsMock />;
    default: return <GenericMock kind={kind} />;
  }
}
