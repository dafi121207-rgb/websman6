import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMediaUploadToken } from "@/lib/supabase-storage";

const UploadRequestSchema = z.discriminatedUnion("purpose", [
  z.object({
    purpose: z.literal("submission"),
    assignmentId: z.string().min(1),
    contentType: z.string(),
    size: z.number().int().positive().max(50 * 1024 * 1024),
  }),
  z.object({
    purpose: z.literal("attendance"),
    sessionId: z.string().min(1),
    contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    size: z.number().int().positive().max(3 * 1024 * 1024),
  }),
]);

const SUBMISSION_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-msvideo",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogg",
  "video/x-msvideo": "avi",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = UploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data unggahan tidak valid." }, { status: 400 });
  }
  const request = parsed.data;

  if (request.purpose === "submission") {
    const student = await requireRole(["SISWA"]);
    if (!student) {
      return NextResponse.json({ error: "Hanya siswa dapat mengunggah tugas." }, { status: 403 });
    }
    if (!SUBMISSION_MIME_TYPES.has(request.contentType)) {
      return NextResponse.json({ error: "Tipe media tidak diizinkan." }, { status: 400 });
    }
    const assignment = await prisma.assignment.findUnique({
      where: { id: request.assignmentId },
      select: { id: true },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
    }
    const path = `submissions/${student.id}/${crypto.randomUUID()}.${EXTENSIONS[request.contentType]}`;
    try {
      return NextResponse.json(
        await createMediaUploadToken(path, request.contentType),
      );
    } catch (error) {
      console.error("Gagal menyiapkan upload tugas ke Supabase Storage:", error);
      return NextResponse.json({ error: "Penyimpanan media belum siap." }, { status: 503 });
    }
  }

  const student = await requireRole(["SISWA"]);
  if (!student) {
    return NextResponse.json({ error: "Hanya siswa dapat mengunggah foto presensi." }, { status: 403 });
  }
  const session = await prisma.attendanceSession.findUnique({
    where: { id: request.sessionId },
  });
  if (!session) {
    return NextResponse.json({ error: "Sesi absensi tidak ditemukan." }, { status: 404 });
  }
  if (!session.isOpen || session.kelas !== student.kelas) {
    return NextResponse.json({ error: "Sesi absensi tidak tersedia untuk akun ini." }, { status: 403 });
  }
  const path = `attendance/${student.id}/${crypto.randomUUID()}.${EXTENSIONS[request.contentType]}`;
  try {
    return NextResponse.json(
      await createMediaUploadToken(path, request.contentType),
    );
  } catch (error) {
    console.error("Gagal menyiapkan foto presensi ke Supabase Storage:", error);
    return NextResponse.json({ error: "Penyimpanan media belum siap." }, { status: 503 });
  }
}
