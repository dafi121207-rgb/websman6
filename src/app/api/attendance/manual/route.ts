import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const teacher = await requireRole(["GURU", "ADMIN"]);
  if (!teacher) {
    return NextResponse.json({ error: "Akses hanya untuk Guru / Admin" }, { status: 403 });
  }

  try {
    const { sessionId, userId, status = "HADIR", action } = await req.json();

    if (!sessionId || !userId) {
      return NextResponse.json({ error: "SessionId dan UserId wajib disertakan" }, { status: 400 });
    }

    // Check if session exists
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      return NextResponse.json({ error: "Sesi absensi tidak ditemukan" }, { status: 404 });
    }

    if (action === "DELETE" || status === "UNCHECK") {
      await prisma.attendance.deleteMany({
        where: { sessionId, userId },
      });
      return NextResponse.json({ ok: true, message: "Presensi siswa dibatalkan" });
    }

    const attendance = await prisma.attendance.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      update: {
        status,
      },
      create: {
        sessionId,
        userId,
        status,
        photoProof: null,
        userLat: null,
        userLng: null,
      },
      include: {
        user: { select: { id: true, name: true, kelas: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      attendance: {
        id: attendance.id,
        sessionId: attendance.sessionId,
        userId: attendance.userId,
        status: attendance.status,
        userLat: attendance.userLat,
        userLng: attendance.userLng,
        photoProof: attendance.photoProof,
        createdAt: attendance.createdAt.toISOString(),
        userName: attendance.user.name,
        userKelas: attendance.user.kelas,
      },
      message: `Presensi siswa berhasil ditandai sebagai ${status}`,
    });
  } catch (error) {
    console.error("Error manual attendance:", error);
    return NextResponse.json({ error: "Gagal memperbarui presensi" }, { status: 500 });
  }
}
