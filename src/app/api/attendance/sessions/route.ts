import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const session = await requireRole(["SISWA", "GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  if (session.role === "SISWA") {
    const sessions = await prisma.attendanceSession.findMany({
      where: { kelas: session.kelas ?? "___none___" },
      orderBy: { date: "desc" },
      take: 20,
      include: {
        attendances: { where: { userId: session.id }, select: { status: true, id: true } },
      },
    });
    return NextResponse.json({ sessions, myKelas: session.kelas });
  }

  const sessions = await prisma.attendanceSession.findMany({
    orderBy: { date: "desc" },
    take: 50,
    include: {
      attendances: {
        select: { id: true, status: true, userId: true, photoProof: true, userLat: true, userLng: true },
      },
    },
  });
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const body = await req.json();
  if (!body.title || !body.kelas) {
    return NextResponse.json({ error: "Judul dan kelas wajib diisi" }, { status: 400 });
  }
  const s = await prisma.attendanceSession.create({
    data: {
      title: body.title,
      kelas: body.kelas,
      isOpen: body.isOpen ?? true,
      targetLat: body.targetLat != null ? Number(body.targetLat) : Number(process.env.NEXT_PUBLIC_FIELD_LAT),
      targetLng: body.targetLng != null ? Number(body.targetLng) : Number(process.env.NEXT_PUBLIC_FIELD_LNG),
      maxRadiusMeters: body.maxRadiusMeters != null ? Number(body.maxRadiusMeters) : 100,
    },
  });
  return NextResponse.json({ session: s }, { status: 201 });
}
