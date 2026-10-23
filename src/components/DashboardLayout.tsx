"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Newspaper,
  School,
  Users,
  X,
} from "lucide-react";
import type { SessionUser } from "@/lib/types";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
};

const MENUS: Record<string, MenuItem[]> = {
  SISWA: [
    { href: "/siswa", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/siswa/materi", label: "Materi PJOK", icon: BookOpen },
    { href: "/siswa/tugas", label: "Tugas Praktik", icon: ClipboardList },
    { href: "/siswa/absensi", label: "Presensi Lapangan", icon: MapPin },
    { href: "/siswa/kuis", label: "Kuis & Evaluasi", icon: HelpCircle },
  ],
  GURU: [
    { href: "/guru", label: "Ruang Guru", icon: LayoutDashboard, exact: true },
    { href: "/guru/materi", label: "Modul & E-book", icon: BookOpen },
    { href: "/guru/kuis", label: "Bank Kuis", icon: HelpCircle },
    { href: "/guru/absensi", label: "Presensi Lapangan", icon: MapPin },
    { href: "/guru/penilaian", label: "Penilaian Tugas", icon: Award },
    { href: "/guru/rekap", label: "Rekap & Ekspor", icon: FileSpreadsheet },
  ],
  ADMIN: [
    { href: "/admin", label: "Ruang Admin", icon: LayoutDashboard, exact: true },
    { href: "/guru/materi", label: "Modul & E-book", icon: BookOpen },
    { href: "/admin/profil", label: "Profil Sekolah", icon: School },
    { href: "/admin/berita", label: "Manajemen Berita", icon: Newspaper },
    { href: "/admin/pengguna", label: "Data Pengguna", icon: Users },
  ],
};

const ROLE_CONFIG: Record<string, { label: string; badgeCls: string }> = {
  SISWA: { label: "Siswa", badgeCls: "bg-blue-50 text-blue-700 ring-blue-200" },
  GURU: { label: "Guru PJOK", badgeCls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  ADMIN: { label: "Admin", badgeCls: "bg-purple-50 text-purple-700 ring-purple-200" },
};

export default function DashboardLayout({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key === "Tab") {
        const items = drawer.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); menuButton.current?.focus(); };
  }, [mobileOpen]);

  const menus = MENUS[user.role] ?? MENUS.SISWA;
  const roleInfo = ROLE_CONFIG[user.role] ?? {
    label: user.role,
    badgeCls: "bg-slate-50 text-slate-700 ring-slate-200",
  };

  async function logout() {
    setLoggingOut(true); setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.push("/login"); router.refresh();
    } catch { setLogoutError("Belum bisa keluar. Coba lagi."); setLoggingOut(false); }
  }

  // Get user initials for avatar
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header / Branding */}
      <div>
        <div className="p-5 border-b border-stone-200/70">
          <Link
            href={`/${user.role.toLowerCase()}`}
            className="flex items-center gap-3 group"
            onClick={() => setMobileOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo SMAN 6 Garut"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10 shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <p className="font-extrabold tracking-tight text-slate-900 text-sm leading-tight truncate">
                SMAN 6 <span className="text-blue-600">GARUT</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ${roleInfo.badgeCls}`}
                >
                  {roleInfo.label}
                </span>
                {user.kelas && (
                  <span className="text-[10px] text-slate-500 font-medium font-mono">
                    {user.kelas}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav aria-label="Menu dashboard" className="p-3 space-y-1">
          <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigasi Utama
          </p>
          {menus.map((m) => {
            const isActive = m.exact
              ? pathname === m.href
              : pathname === m.href || pathname.startsWith(m.href + "/");

            const Icon = m.icon;

            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#17324d] text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-stone-200/60"
                }`}
              >
                <Icon size={17} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{m.label}</span>
              </Link>
            );
          })}
          <Link href="/" onClick={() => setMobileOpen(false)} className="mt-6 flex min-h-11 items-center gap-3 border-t border-slate-200 px-3.5 pt-4 text-sm text-slate-600"><School size={17} />Website sekolah</Link>
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-stone-200/70 bg-white/40">
        <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate leading-snug" title={user.name}>
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {user.role === "GURU" ? `NIP ${user.identifier}` : user.identifier}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>{loggingOut ? "Keluar…" : "Keluar Akun"}</span>
          </button>
          {logoutError && <p role="alert" className="text-xs text-rose-700">{logoutError}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="school-workspace min-h-screen flex">
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white h-screen sticky top-0 z-30 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Off-canvas Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Sidebar */}
          <aside ref={drawer} role="dialog" aria-modal="true" aria-label="Navigasi dashboard" id="mobile-dashboard-menu" className="relative w-72 max-w-[85vw] bg-white border-r border-stone-200 h-full flex flex-col z-10 shadow-2xl overflow-y-auto overscroll-contain">
            <div className="absolute top-4 right-3">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="p-3 rounded-lg text-slate-600 hover:bg-stone-200/60"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 px-4 sm:px-8 border-b border-slate-200 bg-[#f6f7f5]/95 sticky top-0 z-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              ref={menuButton}
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-stone-200/60 border border-stone-200/80 cursor-pointer"
              aria-label="Buka Menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-dashboard-menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {menus.find((item) => item.exact ? pathname === item.href : pathname.startsWith(item.href))?.label ?? "Pembelajaran PJOK"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">SMAN 6 Garut</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 text-[11px] font-semibold text-slate-600 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{roleInfo.label}</span>
            </div>

            <div className="lg:hidden flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
