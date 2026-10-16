import Link from "next/link";
import { BookOpen, Camera, ClipboardList, HelpCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Badge, DoubleBezel } from "@/components/ui";

export const dynamic = "force-dynamic";

const QUICK = [
  {
    href: "/siswa/materi",
    label: "Baca Materi",
    sub: "Silabus & Video Teori",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=600&q=80",
  },
  {
    href: "/siswa/tugas",
    label: "Kumpulkan Tugas",
    sub: "Rekaman Praktik Fisik",
    icon: ClipboardList,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
  },
  {
    href: "/siswa/absensi",
    label: "Absen di Lapangan",
    sub: "Presensi Geolocation",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
  },
  {
    href: "/siswa/kuis",
    label: "Kerjakan Kuis",
    sub: "Uji Pemahaman Bab",
    icon: HelpCircle,
    image: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?auto=format&fit=crop&w=600&q=80",
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
    <div className="space-y-5">
      <div>
        <Badge tone="slate">Kelas {session.kelas ?? "-"}</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-900">
          Selamat Datang, <span className="text-blue-600">{session.name.split(",")[0]}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Sehatkan badanmu, mantapkan prestasimu di SMAN 6 Garut!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="glass-shell ring-1 ring-black/5 hover:ring-blue-300 transition bg-white/70">
            <div className="bezel-core p-5 bg-white/95">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions with photo backgrounds instead of solid gradient fills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="glass-shell ring-1 ring-black/5 group overflow-hidden bg-white/70">
            <div className="bezel-core! p-0 rounded-[1.5rem] h-36 relative overflow-hidden">
              {/* Background Photo */}
              <img
                src={q.image}
                alt={q.label}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              {/* Dark Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
              {/* Glass Icon Pill */}
              <div className="absolute top-3.5 left-3.5 p-2 rounded-xl bg-white/20 backdrop-blur-md ring-1 ring-white/30 text-white">
                <q.icon size={18} />
              </div>
              {/* Card Label */}
              <div className="absolute bottom-3 left-3.5 right-3">
                <p className="text-white text-sm font-bold leading-tight">{q.label}</p>
                <p className="text-white/75 text-[11px] mt-0.5 font-medium">{q.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent submissions */}
      <DoubleBezel>
        <h2 className="font-extrabold tracking-tight text-slate-900">Tugas Terakhir</h2>
        {subs.length === 0 ? (
          <p className="text-sm text-slate-400 mt-3">Belum ada tugas yang dikumpulkan. Yuk buka menu Tugas!</p>
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
                  {s.status === "GRADED" ? `Nilai ${s.score}` : s.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DoubleBezel>
    </div>
  );
}
