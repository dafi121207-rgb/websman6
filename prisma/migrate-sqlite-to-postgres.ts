import "dotenv/config";
import { PrismaClient as PostgresPrismaClient } from "@prisma/client";
import { PrismaClient as SqlitePrismaClient } from "../node_modules/.prisma/sqlite-client";

const directDatabaseUrl = process.env.DIRECT_URL;
if (!directDatabaseUrl) {
  throw new Error("DIRECT_URL harus disetel untuk import ke Supabase.");
}

const sqlite = new SqlitePrismaClient({
  datasources: { db: { url: "file:./dev.db" } },
});
const postgres = new PostgresPrismaClient({
  datasources: { db: { url: directDatabaseUrl } },
});

async function main() {
  const [
    schoolProfiles,
    users,
    news,
    modules,
    attendanceSessions,
    quizzes,
    questions,
    quizAttempts,
    assignments,
    attendances,
    submissions,
  ] = await Promise.all([
    sqlite.schoolProfile.findMany(),
    sqlite.user.findMany(),
    sqlite.news.findMany(),
    sqlite.module.findMany(),
    sqlite.attendanceSession.findMany(),
    sqlite.quiz.findMany(),
    sqlite.question.findMany(),
    sqlite.quizAttempt.findMany(),
    sqlite.assignment.findMany(),
    sqlite.attendance.findMany(),
    sqlite.submission.findMany(),
  ]);

  const sourceCounts = {
    schoolProfiles: schoolProfiles.length,
    users: users.length,
    news: news.length,
    modules: modules.length,
    attendanceSessions: attendanceSessions.length,
    quizzes: quizzes.length,
    questions: questions.length,
    quizAttempts: quizAttempts.length,
    assignments: assignments.length,
    attendances: attendances.length,
    submissions: submissions.length,
  };

  const destinationCounts = {
    schoolProfiles: await postgres.schoolProfile.count(),
    users: await postgres.user.count(),
    news: await postgres.news.count(),
    modules: await postgres.module.count(),
    attendanceSessions: await postgres.attendanceSession.count(),
    quizzes: await postgres.quiz.count(),
    questions: await postgres.question.count(),
    quizAttempts: await postgres.quizAttempt.count(),
    assignments: await postgres.assignment.count(),
    attendances: await postgres.attendance.count(),
    submissions: await postgres.submission.count(),
  };

  const occupiedTables = Object.entries(destinationCounts)
    .filter(([, count]) => count > 0)
    .map(([model, count]) => `${model}=${count}`);
  if (occupiedTables.length > 0) {
    throw new Error(
      `Import dibatalkan karena tabel tujuan tidak kosong: ${occupiedTables.join(", ")}`,
    );
  }

  const totalRows = Object.values(sourceCounts).reduce(
    (total, count) => total + count,
    0,
  );
  if (totalRows === 0) {
    throw new Error("Database SQLite lokal tidak memiliki data untuk diimpor.");
  }

  await postgres.$transaction(
    async (tx) => {
      if (schoolProfiles.length) await tx.schoolProfile.createMany({ data: schoolProfiles });
      if (users.length) await tx.user.createMany({ data: users });
      if (news.length) await tx.news.createMany({ data: news });
      if (modules.length) await tx.module.createMany({ data: modules });
      if (attendanceSessions.length) {
        await tx.attendanceSession.createMany({ data: attendanceSessions });
      }
      if (quizzes.length) await tx.quiz.createMany({ data: quizzes });
      if (questions.length) await tx.question.createMany({ data: questions });
      if (quizAttempts.length) await tx.quizAttempt.createMany({ data: quizAttempts });
      if (assignments.length) await tx.assignment.createMany({ data: assignments });
      if (attendances.length) await tx.attendance.createMany({ data: attendances });
      if (submissions.length) await tx.submission.createMany({ data: submissions });
    },
    { maxWait: 10_000, timeout: 60_000 },
  );

  const importedCounts = {
    schoolProfiles: await postgres.schoolProfile.count(),
    users: await postgres.user.count(),
    news: await postgres.news.count(),
    modules: await postgres.module.count(),
    attendanceSessions: await postgres.attendanceSession.count(),
    quizzes: await postgres.quiz.count(),
    questions: await postgres.question.count(),
    quizAttempts: await postgres.quizAttempt.count(),
    assignments: await postgres.assignment.count(),
    attendances: await postgres.attendance.count(),
    submissions: await postgres.submission.count(),
  };

  if (JSON.stringify(importedCounts) !== JSON.stringify(sourceCounts)) {
    throw new Error(
      `Verifikasi jumlah baris gagal. Lokal: ${JSON.stringify(sourceCounts)}; Supabase: ${JSON.stringify(importedCounts)}`,
    );
  }

  console.log("Import SQLite ke Supabase berhasil. Jumlah baris per tabel:");
  console.log(JSON.stringify(importedCounts, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error("Import SQLite ke Supabase gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([sqlite.$disconnect(), postgres.$disconnect()]);
  });
