import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import type { QuestionDTO } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await requireRole(["SISWA", "GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const { id } = await ctx.params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      module: { select: { title: true, category: true } },
      questions: true,
    },
  });
  if (!quiz) return NextResponse.json({ error: "Kuis tidak ditemukan" }, { status: 404 });

  // Untuk SISWA: strip kunci jawaban agar tidak membocorkan otomatis
  const questions: QuestionDTO[] = quiz.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: JSON.parse(q.options),
  }));
  const previous = await prisma.quizAttempt.findUnique({
    where: { quizId_userId: { quizId: id, userId: session.id } },
  });

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      durationMin: quiz.durationMin,
      passScore: quiz.passScore,
      moduleTitle: quiz.module?.title,
    },
    questions: session.role === "SISWA" ? questions : quiz.questions,
    previousAttempt: previous,
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.quiz.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
