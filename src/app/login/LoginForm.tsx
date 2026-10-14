"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, KeyRound, User } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login gagal");
        return;
      }
      const next = params.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#F5F3EF]">
      <div className="kinetic-blob w-[420px] h-[420px] bg-blue-300/40 -top-40 -left-40 animate-floaty" />
      <div className="kinetic-blob w-[360px] h-[360px] bg-amber-200/40 -bottom-40 -right-40 animate-floaty" />

      <Link href="/" className="mb-6 flex items-center gap-2.5 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo SMAN 6 Garut" className="w-11 h-11 rounded-2xl ring-1 ring-black/10 group-hover:scale-105 transition-transform" />
        <div>
          <p className="font-extrabold tracking-tight text-slate-900 text-base">SMAN 6 GARUT</p>
          <p className="text-[11px] text-slate-500 font-medium">Portal Pembelajaran PJOK</p>
        </div>
      </Link>

      <div className="glass-shell ring-1 ring-black/5 shadow-2xl w-full max-w-md bg-white/70 backdrop-blur-xl">
        <div className="bezel-core p-7 sm:p-9 bg-white/90">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Masuk Akun</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gunakan NISN (siswa), NIP (guru), atau username (admin) yang terdaftar.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">NISN / NIP / Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan identitas akun"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/80 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 ring-1 ring-rose-200 text-rose-700 text-[13px] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-md shadow-blue-500/25 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? "Memproses..." : "Masuk Sekarang"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>SMAN 6 Garut LMS PJOK</span>
            <Link href="/" className="text-blue-600 hover:underline font-medium">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6">MANDIRI, KOMPETITIF, DAN BERWAWASAN LINGKUNGAN</p>
    </div>
  );
}
