import Link from "next/link";
import { Newspaper, School, UserPlus } from "lucide-react";
import prisma from "@/lib/prisma";
import { Badge, DoubleBezel } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [userCount, siswaCount, guruCount, newsCount, modCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SISWA" } }),
    prisma.user.count({ where: { role: "GURU" } }),
    prisma.news.count(),
    prisma.module.count(),
  ]);

  const stats = [
    { label: "Total Pengguna", value: userCount, href: "/admin/pengguna" },
    { label: "Siswa", value: siswaCount, href: "/admin/pengguna" },
    { label: "Guru PJOK", value: guruCount, href: "/admin/pengguna" },
    { label: "Berita", value: newsCount, href: "/admin/berita" },
    { label: "Modul PJOK", value: modCount, href: "/guru/materi" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <Badge tone="slate">Master Admin Console</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-900">
          Konsol Admin Sekolah
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola profil resmi sekolah, berita &amp; pengumuman, dan akun pengguna.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="glass-shell ring-1 ring-black/5 hover:ring-blue-300 transition bg-white/70"
          >
            <div className="bezel-core p-4 bg-white/95">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <DoubleBezel>
        <h2 className="font-extrabold text-base text-slate-900">Pintasan Manajemen</h2>
        <div className="mt-3.5 flex flex-wrap gap-3">
          <Link
            href="/admin/profil"
            className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <School size={16} />
            <span>Perbarui Profil Sekolah</span>
          </Link>
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm active:scale-[0.98] transition cursor-pointer"
          >
            <Newspaper size={16} className="text-slate-500" />
            <span>Kelola Berita &amp; Pengumuman</span>
          </Link>
          <Link
            href="/admin/pengguna"
            className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-500/20 transition cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Tambah Akun Pengguna</span>
          </Link>
        </div>
      </DoubleBezel>
    </div>
  );
}
