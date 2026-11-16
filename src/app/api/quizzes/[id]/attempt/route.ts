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

  if (!quiz.questions.length) return NextResponse.json({error:"Kuis belum berisi soal"},{status:400});
  const session = await prisma.quizSession.findUnique({where:{quizId_userId:{quizId:id,userId:siswa.id}}});
  if (!session) return NextResponse.json({error:"Mulai kuis terlebih dahulu"},{status:400});
  const body = await req.json().catch(()=>null);
  if (!body?.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) return NextResponse.json({error:"Jawaban tidak valid"},{status:400});
  const answers: Record<string, number> = Date.now() > session.expiresAt.getTime() ? JSON.parse(session.answers) : body.answers;
  const durationSeconds = Math.max(0, Math.min(Math.ceil((Date.now()-session.startedAt.getTime())/1000), Math.ceil((session.expiresAt.getTime()-session.startedAt.getTime())/1000)));

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

  const attempt = await prisma.quizAttempt.upsert({
    where: {quizId_userId:{quizId:id,userId:siswa.id}},
    update: {},
    create: {
      quizId: quiz.id,
      userId: siswa.id,
      score,
      durationSeconds,
      isPassed,
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score: attempt.score,
    durationSeconds: attempt.durationSeconds,
    isPassed: attempt.isPassed,
    passScore: quiz.passScore,
    review,
  });
}
