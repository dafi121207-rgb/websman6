import Link from "next/link";
import { ArrowDownToLine, ChevronRight, FileSpreadsheet, PlusCircle, Sparkles } from "lucide-react";
import prisma from "@/lib/prisma";
import { Badge, DoubleBezel, statusBadgeTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GuruOverview() {
  const [modCount, quizCount, pending, sessions, recentAttd] = await Promise.all([
    prisma.module.count(),
    prisma.quiz.count(),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.attendanceSession.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { _count: { select: { attendances: true } } },
    }),
    prisma.attendance.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: true } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Badge tone="slate">Dashboard Guru PJOK</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-900">Konsol Guru</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola materi, kuis, presensi lapangan, dan penilaian praktik.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Modul Bab", value: modCount, href: "/guru/materi" },
          { label: "Kuis Aktif", value: quizCount, href: "/guru/kuis" },
          { label: "Tugas Menunggu Penilaian", value: pending, href: "/guru/penilaian" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="glass-shell ring-1 ring-black/5 hover:ring-blue-300 transition bg-white/70">
            <div className="bezel-core p-5 bg-white/95">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Export & Actions Panel */}
      <div className="glass-shell ring-1 ring-black/5 bg-white/70">
        <div className="bezel-core p-5 bg-white/95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                Akses Cepat Ekspor Rekap Nilai &amp; Presensi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Unduh rekap terformat CSV untuk pelaporan nilai wali kelas atau kurikulum.
              </p>
            </div>
            <Link
              href="/guru/rekap"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
            >
              Halaman Rekap Lengkap <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5">
            <a
              href="/api/export?type=nilai"
              download
              className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 ring-1 ring-slate-200 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ArrowDownToLine size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">Unduh Rekap Nilai</p>
                <p className="text-[11px] text-slate-400">Kuis &amp; Tugas Praktik (.CSV)</p>
              </div>
            </a>

            <a
              href="/api/export?type=absensi"
              download
              className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 ring-1 ring-slate-200 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ArrowDownToLine size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">Unduh Rekap Presensi</p>
                <p className="text-[11px] text-slate-400">Semua Sesi Lapangan (.CSV)</p>
              </div>
            </a>

            <Link
              href="/guru/absensi"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 ring-1 ring-slate-200 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <PlusCircle size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 truncate">Buka Presensi Hari Ini</p>
                <p className="text-[11px] text-slate-400">Kontrol Langsung Guru</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Sesi Absensi Terbaru */}
      <DoubleBezel>
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold tracking-tight text-slate-900">Sesi Absensi Terbaru</h2>
          <Link href="/guru/absensi" className="text-xs font-semibold text-blue-600 hover:underline">
            Kelola Sesi ↗
          </Link>
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {sessions.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{s.title}</p>
                <p className="text-[11px] text-slate-400">{s.kelas} · {new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-slate-600">{s._count.attendances} siswa</span>
                <Badge tone={s.isOpen ? "emerald" : "slate"}>{s.isOpen ? "Terbuka" : "Tertutup"}</Badge>
              </div>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-slate-400 mt-2">Belum ada sesi absensi.</p>}
        </div>
      </DoubleBezel>

      {/* Check-in Terakhir */}
      <DoubleBezel>
        <h2 className="font-extrabold tracking-tight text-slate-900">Check-in Terakhir Siswa</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {recentAttd.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">{a.user.name} <span className="font-normal text-slate-400">· {a.user.kelas}</span></p>
              <Badge tone={statusBadgeTone(a.status)}>
                {new Date(a.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </Badge>
            </div>
          ))}
          {recentAttd.length === 0 && <p className="text-sm text-slate-400 mt-2">Belum ada presensi masuk.</p>}
        </div>
      </DoubleBezel>
    </div>
  );
}
