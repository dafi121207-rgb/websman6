import type { Metadata, Viewport } from "next";
import SwRegister from "@/components/SwRegister";
import { Barlow_Condensed, Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./public.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SMAN 6 GARUT — Portal PJOK Digital",
    template: "%s | SMAN 6 GARUT",
  },
  description:
    "Portal resmi SMAN 6 Garut & Learning Management System PJOK: materi, kuis interaktif, absensi lapangan geolocation, dan tugas praktik video.",
  manifest: "/manifest.json",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${jakarta.variable} ${geist.variable} ${geistMono.variable} ${display.variable} font-sans bg-[#F5F3EF] text-slate-900 min-h-screen antialiased selection:bg-blue-600 selection:text-white`}
        style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
      >
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
