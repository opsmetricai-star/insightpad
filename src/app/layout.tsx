import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Space_Grotesk, Instrument_Serif, Silkscreen } from "next/font/google";
import "./globals.css";

const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const display = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const pixel = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pixel" });

export const metadata: Metadata = {
  title: { default: "InsightPad: The AI analytics engine for decisive teams", template: "%s | InsightPad" },
  description:
    "InsightPad is an AI-native analytics platform. The AI plans, explains and automates analysis while deterministic code computes every figure, so teams decide faster on numbers they can defend.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${body.variable} ${mono.variable} ${display.variable} ${serif.variable} ${pixel.variable}`}>
      <body>{children}</body>
    </html>
  );
}
