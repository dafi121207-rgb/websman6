"use client";

import Link from "next/link";
import { LogIn, Menu, X } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { href: "/profil-sekolah", label: "Profil Sekolah" },
  { href: "/#tujuan", label: "Tujuan Web" },
  { href: "/#visi", label: "Visi & Misi" },
  { href: "/#materi", label: "Modul PJOK" },
  { href: "/#tim-pembuat", label: "Tim Pengembang" },
  { href: "/#kontak", label: "Kontak & Lokasi" },
];

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-x-clip">
      {/* kinetic ambient glow */}
      <div className="kinetic-blob w-[460px] h-[460px] bg-blue-300/30 -top-40 -left-40 animate-floaty" />
      <div
        className="kinetic-blob w-[400px] h-[400px] bg-amber-200/35 top-[45%] -right-40 animate-floaty"
        style={{ animationDelay: "2s" }}
      />

      {/* Modern Fixed Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#F5F3EF]/85 backdrop-blur-md border-b border-stone-200/70 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo SMAN 6 Garut"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10 shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="font-extrabold tracking-tight text-slate-900 text-base leading-tight">
                SMAN 6 <span className="text-blue-600">GARUT</span>
              </p>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                Portal Pembelajaran PJOK
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-white/60 border border-stone-200/60 shadow-xs">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogIn size={15} />
              <span>Masuk Portal</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-white/80 text-slate-700 border border-stone-200/60 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="fixed inset-x-0 top-18 z-40 lg:hidden p-4 bg-[#F5F3EF]/95 backdrop-blur-xl border-b border-stone-200 shadow-xl">
          <div className="space-y-1.5 max-w-sm mx-auto">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white rounded-xl transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                <LogIn size={16} />
                <span>Masuk NISN / NIP</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
