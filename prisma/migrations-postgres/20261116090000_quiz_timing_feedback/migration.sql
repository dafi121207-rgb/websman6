-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "durationSeconds" INTEGER;

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "answers" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ratings" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizSession_quizId_userId_key" ON "QuizSession"("quizId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteFeedback_userId_key" ON "WebsiteFeedback"("userId");

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteFeedback" ADD CONSTRAINT "WebsiteFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Access is handled by authenticated Next.js routes, not the public Data API.
ALTER TABLE "QuizSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebsiteFeedback" ENABLE ROW LEVEL SECURITY;
