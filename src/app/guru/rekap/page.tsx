import prisma from "@/lib/prisma";
import { Badge, DoubleBezel, PrimaryButton, statusBadgeTone } from "@/components/ui";
import { Download } from "lucide-react";
import { EmptyState } from "@/components/PageStates";

export const dynamic = "force-dynamic";

export default async function GuruRekap() {
  const [attempts, submissions, users] = await Promise.all([
    prisma.quizAttempt.findMany({ include: { quiz: { select: { title: true } }, user: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.submission.findMany({ include: { assignment: { select: { title: true } }, user: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.user.findMany({ where: { role: "SISWA" }, orderBy: [{ kelas: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Rekapitulasi</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Rekap Nilai &amp; Absensi</h1>
        <p className="text-slate-500 text-sm mt-1">
          Unduh rekap nilai kuis + tugas dan absensi lapangan (CSV, kompatibel Excel Standar Kurikulum Merdeka).
        </p>
      </div>

      <DoubleBezel>
        <h2 className="font-extrabold">Unduh Ekspor</h2>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <a
            href="/api/export?type=nilai"
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <Download size={15} /> Rekap Nilai (CSV)
          </a>
          <a
            href="/api/export?type=absensi"
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-500/20 transition cursor-pointer"
          >
            <Download size={15} /> Rekap Absensi (CSV)
          </a>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          File CSV dibuka langsung di Microsoft Excel / Google Sheets. Untuk PDF: buka hasil di Excel lalu cetak ke PDF.
        </p>
      </DoubleBezel>

      <DoubleBezel>
        <h2 className="font-extrabold">Siswa Terdaftar ({users.length})</h2>
        <div className="mt-3 divide-y divide-slate-100 max-h-64 overflow-y-auto">
          {users.map((u) => (
            <div key={u.id} className="py-2 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-700">{u.name}</p>
              <Badge tone="slate">{u.kelas ?? "-"}</Badge>
            </div>
          ))}
        </div>
      </DoubleBezel>

      <DoubleBezel>
        <h2 className="font-extrabold">Nilai Kuis Terbaru</h2>
        <div className="mt-3 divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {attempts.map((a) => (
            <div key={a.id} className="py-2.5 flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-slate-700 truncate">
                {a.user.name} <span className="font-normal text-slate-400">· {a.quiz.title}</span>
              </p>
              <Badge tone={statusBadgeTone(a.isPassed ? "LULUS" : "GAGAL")}>{a.score}</Badge>
            </div>
          ))}
          {attempts.length === 0 && <EmptyState title="Belum ada hasil kuis" description="Nilai akan muncul setelah siswa menyelesaikan kuis." />}
        </div>
      </DoubleBezel>

      <DoubleBezel>
        <h2 className="font-extrabold">Tugas Praktik Terbaru</h2>
        <div className="mt-3 divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {submissions.map((s) => (
            <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-slate-700 truncate">
                {s.user.name} <span className="font-normal text-slate-400">· {s.assignment.title}</span>
              </p>
              <Badge tone={statusBadgeTone(s.status)}>{s.status === "GRADED" ? s.score : s.status}</Badge>
            </div>
          ))}
          {submissions.length === 0 && <EmptyState title="Belum ada hasil praktik" description="Tugas yang dikirim siswa akan masuk ke rekap ini." />}
        </div>
      </DoubleBezel>
    </div>
  );
}
