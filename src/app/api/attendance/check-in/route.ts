import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { distanceMeters } from "@/lib/school";
import { z } from "zod";
import { assertMediaObjectExists } from "@/lib/supabase-storage";

const CheckInSchema = z.object({
  sessionId: z.string().min(1),
  userLat: z.number(),
  userLng: z.number(),
  storagePath: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const siswa = await requireRole(["SISWA"]);
  if (!siswa) return NextResponse.json({ error: "Akses hanya untuk Siswa" }, { status: 403 });

  let body;
  try {
    body = CheckInSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Data tidak valid. Pastikan foto selfie & lokasi berhasil diambil." },
      { status: 400 }
    );
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { id: body.sessionId },
  });
  if (!session) return NextResponse.json({ error: "Sesi absensi tidak ditemukan" }, { status: 404 });
  if (!session.isOpen) {
    return NextResponse.json({ error: "Sesi absensi masih ditutup oleh guru." }, { status: 409 });
  }
  if (session.kelas !== siswa.kelas) {
    return NextResponse.json(
      { error: `Sesi ini hanya untuk kelas ${session.kelas} (kamu ${siswa.kelas ?? "-"}).` },
      { status: 403 }
    );
  }

  // FR-401: geofence validation
  const targetLat = session.targetLat ?? Number(process.env.NEXT_PUBLIC_FIELD_LAT);
  const targetLng = session.targetLng ?? Number(process.env.NEXT_PUBLIC_FIELD_LNG);
  const radius = session.maxRadiusMeters ?? 100;
  const dist = distanceMeters(body.userLat, body.userLng, targetLat, targetLng);

  if (dist > radius) {
    return NextResponse.json(
      {
        error: "Lokasi Anda di luar jangkauan lapangan SMAN 6 Garut",
        detail: `Jarak Anda ${(dist / 1000).toFixed(2)} km dari pusat lapangan (maksimal ${radius} m).`,
        distance: dist,
      },
      { status: 422 }
    );
  }

  const existing = await prisma.attendance.findUnique({
    where: { sessionId_userId: { sessionId: body.sessionId, userId: siswa.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Anda sudah check-in pada sesi ini." }, { status: 409 });
  }

  try {
    await assertMediaObjectExists(body.storagePath, `attendance/${siswa.id}/`);
  } catch (error) {
    console.error("Validasi foto presensi gagal:", error);
    return NextResponse.json(
      { error: "Foto selfie tidak ditemukan atau belum selesai diunggah." },
      { status: 400 },
    );
  }

  const attendance = await prisma.attendance.create({
    data: {
      sessionId: body.sessionId,
      userId: siswa.id,
      status: "HADIR",
      photoProof: `storage://school-media/${body.storagePath}`,
      userLat: body.userLat,
      userLng: body.userLng,
    },
  });

  return NextResponse.json({
    ok: true,
    attendance,
    distance: dist,
    message: "Presensi berhasil! Status kamu: HADIR",
  });
}
