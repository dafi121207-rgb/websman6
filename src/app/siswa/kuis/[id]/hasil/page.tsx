import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ResultView from "../ResultView";

export const dynamic = "force-dynamic";

export default async function QuizHasil({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { quizId_userId: { quizId: id, userId: session.id } },
    include: {
      quiz: {
        include: {
          questions: true,
          module: { select: { title: true } },
        },
      },
    },
  });
  if (!attempt) notFound();

  return (
    <ResultView
      quizTitle={attempt.quiz.title}
      passScore={attempt.quiz.passScore}
      score={attempt.score}
      isPassed={attempt.isPassed}
      createdAt={attempt.createdAt.toISOString()}
      questions={attempt.quiz.questions.map((q) => ({
        questionText: q.questionText,
        options: JSON.parse(q.options) as string[],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))}
    />
  );
}
