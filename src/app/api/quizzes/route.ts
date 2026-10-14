import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import type { QuizMetaDTO } from "@/lib/types";

export async function GET() {
  const session = await requireRole(["SISWA", "GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const quizzes = await prisma.quiz.findMany({
    orderBy: { title: "asc" },
    include: {
      module: { select: { title: true, category: true } },
      questions: { select: { id: true } },
      attempts: session.role === "SISWA" ? { where: { userId: session.id } } : false,
      _count: session.role === "SISWA" ? undefined : { select: { attempts: true } },
    },
  });

  const dto: QuizMetaDTO[] = quizzes.map((q) => {
    const attempt = (q as { attempts?: Array<{ score: number; isPassed: boolean }> }).attempts?.[0];
    return {
      id: q.id,
      moduleId: q.moduleId,
      title: q.title,
      durationMin: q.durationMin,
      passScore: q.passScore,
      moduleTitle: q.module?.title ?? "-",
      category: q.module?.category ?? "-",
      questionCount: q.questions.length,
      myScore: attempt?.score ?? null,
      myStatus:
        session.role === "SISWA"
          ? !attempt
            ? "BELUM"
            : attempt.isPassed
            ? "LULUS"
            : "GAGAL"
          : undefined,
    };
  });

  return NextResponse.json({ quizzes: dto });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const body = await req.json();
  if (!body.title || !body.moduleId || !Array.isArray(body.questions) || body.questions.length < 1) {
    return NextResponse.json({ error: "Judul, modul, dan minimal 1 soal wajib" }, { status: 400 });
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: body.title,
      moduleId: body.moduleId,
      teacherId: user.id,
      durationMin: Number(body.durationMin) || 30,
      passScore: Number(body.passScore) || 75,
      questions: {
        create: body.questions.map(
          (q: {
            questionText: string;
            options: unknown;
            correctAnswer: number;
            explanation?: string;
          }) => ({
            questionText: q.questionText,
            options: Array.isArray(q.options) ? JSON.stringify(q.options) : q.options,
            correctAnswer: Number(q.correctAnswer),
            explanation: q.explanation || null,
          })
        ),
      },
    },
    include: { questions: true },
  });
  return NextResponse.json({ quiz }, { status: 201 });
}
