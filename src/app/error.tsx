"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { SchoolLoading } from "@/components/PageStates";

export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (pending) return <SchoolLoading label="Mencoba memuat kembali…" />;
  return <section role="alert" className="mx-auto my-12 max-w-lg rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
    <AlertCircle className="text-amber-600" size={28} />
    <h1 className="mt-4 text-2xl font-bold text-slate-900">Halaman belum bisa dimuat</h1>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">Periksa koneksi internet, lalu coba lagi. Jika masih gagal, hubungi pengelola sekolah.</p>
    <div className="mt-6 flex flex-wrap gap-4">
      <button onClick={() => startTransition(() => { router.refresh(); reset(); })} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white"><RotateCcw size={16} />Coba lagi</button>
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700">Ke beranda</Link>
    </div>
  </section>;
}
