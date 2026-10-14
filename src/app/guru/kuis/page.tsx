import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import QuizManager from "./QuizManager";

export const dynamic = "force-dynamic";

export default async function GuruKuis() {
  const [quizzes, modules] = await Promise.all([
    prisma.quiz.findMany({
      orderBy: { title: "asc" },
      include: {
        module: { select: { title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    }),
    prisma.module.findMany({ select: { id: true, title: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Assessment Engine</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Kelola Kuis Interaktif</h1>
        <p className="text-slate-500 text-sm mt-1">SUSUN soal pilihan ganda beserta kunci jawaban, durasi, dan nilai kelulusan. Penilaian otomatis oleh sistem.</p>
      </div>
      <QuizManager
        modules={modules}
        initial={quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          moduleTitle: q.module?.title ?? "-",
          durationMin: q.durationMin,
          passScore: q.passScore,
          questionCount: q._count.questions,
          attemptCount: q._count.attempts,
        }))}
      />
    </div>
  );
}
