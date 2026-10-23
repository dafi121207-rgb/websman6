import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";
import { Badge, statusBadgeTone } from "@/components/ui";
import { EmptyState } from "@/components/PageStates";

export const dynamic = "force-dynamic";

export default async function SiswaKuis() {
  const session = await getSession();
  if (!session) return null;

  const quizzes = await prisma.quiz.findMany({
    orderBy: { title: "asc" },
    include: {
      module: { select: { title: true, category: true } },
      _count: { select: { questions: true } },
      attempts: { where: { userId: session.id } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Evaluasi Otomatis</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Kuis Interaktif</h1>
        <p className="text-slate-500 text-sm mt-1">Soal diacak tiap sesi, dinilai otomatis langsung setelah submit.</p>
      </div>

      {quizzes.length === 0 && <EmptyState title="Belum ada kuis" description="Sambil menunggu kuis dari guru, kamu bisa membaca materi." href="/siswa/materi" action="Baca materi" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quizzes.map((q) => {
          const attempt = q.attempts[0];
          return (
            <Link
              key={q.id}
              href={attempt ? `/siswa/kuis/${q.id}/hasil` : `/siswa/kuis/${q.id}`}
              className="glass-shell ring-1 ring-black/5 misi-card block"
            >
              <div className="bezel-core p-5 h-full flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="slate">{q.module?.category ?? "-"}</Badge>
                  {attempt && <Badge tone={attempt.isPassed ? "emerald" : "rose"}>Skor {attempt.score}</Badge>}
                </div>
                <h3 className="mt-2.5 font-bold text-slate-900 leading-snug">{q.title}</h3>
                <p className="text-[12px] text-slate-400 mt-0.5">{q.module?.title}</p>
                <div className="mt-4 flex items-center justify-between text-[12px] text-slate-500 font-medium">
                  <span>{q._count.questions} soal · {q.durationMin} menit · lulus ≥ {q.passScore}</span>
                  <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                    {attempt ? "Lihat Hasil" : "Mulai"} <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
