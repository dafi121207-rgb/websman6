"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/profil-sekolah", label: "Profil sekolah" },
  { href: "/modul", label: "Modul belajar" },
  { href: "/berita", label: "Berita" },
  { href: "/#tim-pembuat", label: "Tim pembuat" },
];

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }
    function outside(event: PointerEvent) { if (!header.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", escape); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <div className="public-site">
    <a href="#main-content" className="skip-link">Lewati ke konten</a>
    <header ref={header} className="site-header">
      <div className="site-container nav-inner">
        <Link href="/" className="site-brand" aria-label="SMAN 6 Garut — Beranda"><img src="/logo.png" alt="" width={40} height={40} /><span><strong>SMAN 6 GARUT</strong><small>Pembelajaran PJOK</small></span></Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">{LINKS.map((link) => <Link key={link.href} href={link.href} aria-current={!link.href.includes("#") && (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)) ? "page" : undefined}>{link.label}</Link>)}</nav>
        <div className="nav-actions"><Link href="/login" className="site-button nav-login">Masuk <ArrowUpRight size={16} /></Link><button ref={toggle} type="button" onClick={() => setOpen(!open)} className="menu-toggle icon-button" aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Navigasi seluler">{LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link href="/#kontak" onClick={() => setOpen(false)}>Kontak sekolah</Link></nav>}
    </header>
    {children}
  </div>;
}
