import Header from "./Header";
import Footer from "./Footer";
import type { ReactNode } from "react";

export default function Shell({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? "theme-night min-h-screen" : "min-h-screen"}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-2">Skip to content</a>
      <Header dark={dark} />
      <main id="main">{children}</main>
      <Footer dark={dark} />
    </div>
  );
}
