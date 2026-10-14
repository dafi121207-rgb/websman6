import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const session = await requireRole(["SISWA"]);
  if (!session) return NextResponse.json({ error: "Hanya siswa dapat mengumpulkan tugas" }, { status: 403 });

  const body = await req.json();
  const { assignmentId, mediaBase64, notes } = body;
  if (!assignmentId || !mediaBase64 || typeof mediaBase64 !== 'string') {
    return NextResponse.json({ error: "assignmentId dan media wajib diisi" }, { status: 400 });
  }

  const b64 = mediaBase64.split(';base64,')[1];
  if (!b64) return NextResponse.json({ error: "Format media tidak valid" }, { status: 400 });

  const mime = mediaBase64.slice(mediaBase64.indexOf(':') + 1, mediaBase64.indexOf(';'));
  const ext = mime.split('/')[1] || 'bin';
  if (!['mp4', 'webm', 'ogg', 'mov', 'avi', 'jpeg', 'jpg', 'png', 'gif'].includes(ext)) {
    return NextResponse.json({ error: 'Tipe file tidak diizinkan' }, { status: 400 });
  }

  const fileName = `tugas-${session.id}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', 'assignments');
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(b64, 'base64');
  await writeFile(path.join(dir, fileName), buffer);

  const submission = await prisma.submission.create({
    data: {
      assignmentId,
      userId: session.id,
      mediaUrl: `/uploads/assignments/${fileName}`,
      notes,
      status: 'PENDING',
    },
  });
  return NextResponse.json({ submission }, { status: 201 });
}

export async function GET() {
  const session = await requireRole(["GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, kelas: true } },
      assignment: { select: { title: true } },
    },
  });
  return NextResponse.json({ submissions });
}
