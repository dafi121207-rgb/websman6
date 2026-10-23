import Link from "next/link";
import { Newspaper, School, UserPlus } from "lucide-react";
import prisma from "@/lib/prisma";
import { Badge, DoubleBezel } from "@/components/ui";
import { DashboardIntro, DashboardStats } from "@/components/DashboardIntro";
import { EmptyState } from "@/components/PageStates";

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
    <div className="space-y-7">
      <DashboardIntro eyebrow="SMAN 6 Garut / Ruang admin" title="Informasi sekolah, terkelola." description="Perbarui kabar sekolah, materi pembelajaran, dan akses warga sekolah." href="/admin/berita" action="Kelola kabar sekolah" />
      <DashboardStats items={stats} />

      <DoubleBezel>
        <h2 className="font-extrabold text-base text-slate-900">Kelola website sekolah</h2>
        <p className="mt-2 text-sm text-slate-600">Mulai dari informasi yang perlu diperbarui.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/profil"
            className="flex min-h-20 items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-800 hover:bg-blue-50"
          >
            <School size={16} />
            <span>Perbarui Profil Sekolah</span>
          </Link>
          <Link
            href="/admin/berita"
            className="flex min-h-20 items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-800 hover:bg-blue-50"
          >
            <Newspaper size={16} className="text-slate-500" />
            <span>Kelola Berita &amp; Pengumuman</span>
          </Link>
          <Link
            href="/admin/pengguna"
            className="flex min-h-20 items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-800 hover:bg-blue-50"
          >
            <UserPlus size={16} />
            <span>Tambah Akun Pengguna</span>
          </Link>
        </div>
        {newsCount === 0 && <EmptyState title="Belum ada berita sekolah" description="Terbitkan kabar pertama untuk ditampilkan di website." href="/admin/berita" action="Tulis berita" />}
      </DoubleBezel>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm"><p className="text-slate-600">Tinjau hasil perubahan dari sisi pengunjung.</p><Link href="/" className="font-semibold text-blue-700 hover:underline">Buka website sekolah ↗</Link></div>
    </div>
  );
}
