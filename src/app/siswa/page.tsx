import Link from "next/link";
import { BookOpen, Camera, ClipboardList, HelpCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Badge, DoubleBezel } from "@/components/ui";
import { DashboardIntro, DashboardStats } from "@/components/DashboardIntro";
import { EmptyState } from "@/components/PageStates";

export const dynamic = "force-dynamic";

const QUICK = [
  {
    href: "/siswa/materi",
    label: "Baca Materi",
    sub: "Silabus & Video Teori",
    icon: BookOpen,
    image: "/images/school/halaman-sekolah.webp",
  },
  {
    href: "/siswa/tugas",
    label: "Kumpulkan Tugas",
    sub: "Rekaman Praktik Fisik",
    icon: ClipboardList,
    image: "/images/school/lapangan-basket.webp",
  },
  {
    href: "/siswa/absensi",
    label: "Absen di Lapangan",
    sub: "Presensi di sekolah",
    icon: Camera,
    image: "/images/school/lapangan-sekolah.webp",
  },
  {
    href: "/siswa/kuis",
    label: "Kerjakan Kuis",
    sub: "Uji Pemahaman Bab",
    icon: HelpCircle,
    image: "/images/school/kegiatan-lapangan.webp",
  },
];

export default async function SiswaDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [modCount, quizDone, quizTotal, attdCount, subs] = await Promise.all([
    prisma.module.count(),
    prisma.quizAttempt.count({ where: { userId: session.id } }),
    prisma.quiz.count(),
    prisma.attendance.count({ where: { userId: session.id } }),
    prisma.submission.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { assignment: { select: { title: true } } },
    }),
  ]);

  const stats = [
    { label: "Modul Materi", value: modCount, href: "/siswa/materi" },
    { label: "Kuis Dikerjakan", value: `${quizDone}/${quizTotal}`, href: "/siswa/kuis" },
    { label: "Total Presensi", value: attdCount, href: "/siswa/absensi" },
  ];

  return (
    <div className="space-y-7">
      <DashboardIntro eyebrow={`PJOK / Kelas ${session.kelas ?? "—"}`} title={`Halo, ${session.name.split(",")[0]}.`} description="Baca materi, latih keterampilan, dan catat progres belajarmu." href="/siswa/materi" action="Mulai belajar" />

      {/* Stats */}
      <DashboardStats items={stats} />

      {/* Quick actions with photo backgrounds instead of solid gradient fills */}
      <section><h2 className="mb-4 text-lg font-bold text-slate-900">Kegiatan belajarmu</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="group flex items-center gap-4 border-b border-slate-200 py-5 hover:bg-blue-50/50">
            <q.icon size={22} className="shrink-0 text-blue-700" />
            <div className="flex-1"><p className="text-sm font-bold text-slate-900">{q.label}</p><p className="mt-1 text-xs text-slate-600">{q.sub}</p></div><span aria-hidden="true" className="pr-3 text-blue-700">↗</span>
          </Link>
        ))}
      </div></section>

      {/* Recent submissions */}
      <DoubleBezel>
        <h2 className="font-extrabold tracking-tight text-slate-900">Tugas Terakhir</h2>
        {subs.length === 0 ? (
          <EmptyState title="Belum ada tugas terkumpul" description="Lihat instruksi praktik, lalu kirim hasil tugasmu." href="/siswa/tugas" action="Lihat tugas praktik" />
        ) : (
          <div className="mt-3 divide-y divide-slate-100">
            {subs.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{s.assignment.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                  </p>
                </div>
                <Badge tone={
                  s.status === "GRADED" ? "emerald" : s.status === "REJECTED" ? "rose" : "amber"
                }>
                  {s.status === "GRADED" ? `Nilai ${s.score}` : s.status === "REJECTED" ? "Perlu revisi" : "Menunggu penilaian"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DoubleBezel>
    </div>
  );
}
