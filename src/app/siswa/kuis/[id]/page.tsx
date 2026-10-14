import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import QuizPlayer from "./QuizPlayer";
import type { QuestionDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function QuizPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/siswa/kuis/${id}`);

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      module: { select: { title: true } },
      questions: true,
    },
  });
  if (!quiz) redirect("/siswa/kuis");

  const previous = await prisma.quizAttempt.findUnique({
    where: { quizId_userId: { quizId: id, userId: session.id } },
  });

  const questions: QuestionDTO[] = quiz.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: JSON.parse(q.options),
  }));

  return (
    <QuizPlayer
      quiz={{
        id: quiz.id,
        title: quiz.title,
        moduleTitle: quiz.module?.title ?? "",
        durationMin: quiz.durationMin,
        passScore: quiz.passScore,
      }}
      questions={questions}
      alreadyDone={!!previous}
    />
  );
}
