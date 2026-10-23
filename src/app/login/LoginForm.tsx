"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, User, AlertCircle } from "lucide-react";
import { SchoolLoading } from "@/components/PageStates";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError(null); setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Belum bisa masuk. Coba lagi."); setLoading(false); return; }
      const next = params.get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/dashboard");
      router.refresh();
    } catch { setError("Koneksi bermasalah. Periksa internet lalu coba lagi."); setLoading(false); }
  }

  return <main className="login-layout">
    <aside className="login-photo" aria-label="Lingkungan SMAN 6 Garut">
      <img src="/images/school/halaman-sekolah.webp" alt="Halaman SMAN 6 Garut" />
      <div className="login-photo__copy"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/80">Pendidikan Jasmani, Olahraga & Kesehatan</p><h2 className="mt-5 max-w-md text-5xl font-bold leading-tight tracking-tight">Belajar bersama.<br />Bergerak bersama.</h2><p className="mt-5 text-sm text-white/80">SMAN 6 Garut</p></div>
    </aside>
    <section className="login-panel">
      <Link href="/" className="mb-10 inline-flex items-center gap-3 self-start">
        <img src="/logo.png" alt="Logo SMAN 6 Garut" width={48} height={56} className="h-14 w-12 object-contain" />
        <div><p className="text-base font-bold tracking-tight text-[#17324d]">SMAN 6 GARUT</p><p className="mt-1 text-xs text-slate-600">Pembelajaran PJOK</p></div>
      </Link>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Ruang belajar</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Masuk akun</h1>
      <p id="login-help" className="mt-3 text-sm leading-relaxed text-slate-600">Gunakan NISN, NIP, atau username yang terdaftar.</p>
      <form onSubmit={submit} aria-busy={loading} aria-describedby="login-help" className="mt-7 space-y-5">
        <div><label htmlFor="identifier" className="mb-2 block text-sm font-semibold text-slate-700">NISN / NIP / Username</label><div className="relative"><User size={17} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input id="identifier" name="identifier" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={loading} value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Identitas akun" className="login-input" /></div></div>
        <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><div className="relative"><KeyRound size={17} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={loading} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" className="login-input" /><button type="button" disabled={loading} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        {error && <div id="login-error" role="alert" className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={18} className="shrink-0" /><span>{error}</span></div>}
        <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg bg-[#17324d] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"><span>{loading ? "Sedang masuk…" : "Masuk sekarang"}</span><ArrowRight size={18} /></button>
        {loading && <SchoolLoading compact label="Membuka ruang belajarmu…" />}
      </form>
      <div className="mt-8 border-t border-slate-200 pt-5"><p className="text-xs leading-relaxed text-slate-600">Ingin membaca materi saja?</p><Link href="/modul" className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-blue-700 hover:underline">Buka modul tanpa login <ArrowRight size={15} /></Link></div>
      <Link href="/" className="mt-6 self-start text-xs text-slate-600 hover:underline">← Kembali ke beranda</Link>
    </section>
  </main>;
}
