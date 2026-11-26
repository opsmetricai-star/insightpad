"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./ui";

const items = [
  ["/app", "Overview", "home"], ["/app/datasets", "Datasets", "db"], ["/app/threads", "Threads", "chat"], ["/app/notebooks", "Notebooks", "layers"],
  ["/app/apps", "Data apps", "app"], ["/app/context", "Context Studio", "book"], ["/app/evals", "Evals", "flask"], ["/app/usage", "Usage", "grid"],
  ["/app/notifications", "Notifications", "bell"], ["/app/billing", "Billing", "card"], ["/app/settings", "Settings", "cog"],
];

export default function AppNav({ unread, isAdmin }: { unread: number; isAdmin: boolean }) {
  const path = usePathname();
  const all = isAdmin ? [...items, ["/app/admin", "Admin", "shield"]] : items;
  return (
    <nav aria-label="App" className="flex gap-1 overflow-x-auto px-3 md:block md:space-y-0.5 md:overflow-visible">
      {all.map(([href, label, icon]) => {
        const active = href === "/app" ? path === "/app" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-3 px-3 py-2 text-sm ${active ? "bg-ink text-white" : "hover:bg-black/[0.05]"}`}>
            <Icon name={icon} size={16} /> {label}
            {label === "Notifications" && unread > 0 && <span className="ml-auto rounded-full bg-rose px-1.5 text-[10px] font-medium text-ink">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
