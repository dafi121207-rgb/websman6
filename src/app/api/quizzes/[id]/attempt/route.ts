import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const siswa = await requireRole(["SISWA"]);
  if (!siswa) return NextResponse.json({ error: "Hanya Siswa yang mengerjakan kuis" }, { status: 403 });

  const { id } = await ctx.params;
  const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
  if (!quiz) return NextResponse.json({ error: "Kuis tidak ditemukan" }, { status: 404 });

  const existing = await prisma.quizAttempt.findUnique({
    where: { quizId_userId: { quizId: id, userId: siswa.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Kamu sudah mengerjakan kuis ini." }, { status: 409 });
  }

  const body = await req.json();
  const answers: Record<string, number> = body.answers ?? {};

  let correct = 0;
  const review = quiz.questions.map((q) => {
    const chosen = answers[q.id];
    const correctAnswer = q.correctAnswer;
    const isRight = chosen !== undefined && chosen === correctAnswer;
    if (isRight) correct++;
    return {
      questionText: q.questionText,
      options: JSON.parse(q.options) as string[],
      chosen: chosen ?? null,
      correctAnswer,
      explanation: q.explanation,
    };
  });

  const score = Math.round((correct / quiz.questions.length) * 1000) / 10;
  const isPassed = score >= quiz.passScore;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: siswa.id,
      score,
      isPassed,
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score,
    isPassed,
    passScore: quiz.passScore,
    review,
  });
}
