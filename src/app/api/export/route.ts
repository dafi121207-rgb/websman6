import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(";")
    )
    .join("\n");
}

export async function GET(req: NextRequest) {
  const session = await requireRole(["GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const type = req.nextUrl.searchParams.get("type") ?? "nilai";

  if (type === "absensi") {
    const sessions = await prisma.attendanceSession.findMany({
      include: {
        attendances: {
          include: { user: { select: { name: true, kelas: true } } },
        },
      },
      orderBy: { date: "desc" },
    });
    const rows: string[][] = [["Judul Sesi", "Kelas", "Nama Siswa", "Status", "Waktu Check-In", "Lat", "Lng"]];
    for (const s of sessions) {
      for (const a of s.attendances) {
        rows.push([
          s.title,
          s.kelas,
          a.user.name,
          a.status,
          new Date(a.createdAt).toLocaleString("id-ID"),
          String(a.userLat ?? ""),
          String(a.userLng ?? ""),
        ]);
      }
    }
    const csv = "\uFEFF" + toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="rekap-absensi-pjok.csv"',
      },
    });
  }

  // default: nilai (kuis + tugas)
  const [users, attempts, submissions] = await Promise.all([
    prisma.user.findMany({ where: { role: "SISWA" }, orderBy: [{ kelas: "asc" }, { name: "asc" }] }),
    prisma.quizAttempt.findMany({ include: { quiz: { select: { title: true } } } }),
    prisma.submission.findMany({ include: { assignment: { select: { title: true } } } }),
  ]);

  const rows: string[][] = [["Nama Siswa", "Kelas", "Jenis", "Tugas/Kuis", "Nilai/Skor", "Status"]];
  for (const u of users) {
    for (const a of attempts.filter((x) => x.userId === u.id)) {
      rows.push([u.name, u.kelas ?? "", "Kuis", a.quiz.title, String(a.score), a.isPassed ? "LULUS" : "GAGAL"]);
    }
    for (const s of submissions.filter((x) => x.userId === u.id)) {
      rows.push([
        u.name,
        u.kelas ?? "",
        "Tugas Praktik",
        s.assignment.title,
        String(s.score ?? "-"),
        s.status,
      ]);
    }
  }
  return new NextResponse("\uFEFF" + toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rekap-nilai-pjok.csv"',
    },
  });
}
