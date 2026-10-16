import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  assertMediaObjectExists,
  signMediaReferences,
} from "@/lib/supabase-storage";

const SubmissionSchema = z.object({
  assignmentId: z.string().min(1),
  storagePath: z.string().min(1),
  notes: z.string().max(2000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireRole(["SISWA"]);
  if (!session) {
    return NextResponse.json(
      { error: "Hanya siswa dapat mengumpulkan tugas." },
      { status: 403 },
    );
  }

  const parsed = SubmissionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ID tugas, file unggahan, dan catatan yang valid wajib diisi." },
      { status: 400 },
    );
  }
  const { assignmentId, storagePath, notes } = parsed.data;
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }

  try {
    await assertMediaObjectExists(storagePath, `submissions/${session.id}/`);
  } catch (error) {
    console.error("Validasi media tugas gagal:", error);
    return NextResponse.json(
      { error: "File tugas tidak ditemukan atau belum selesai diunggah." },
      { status: 400 },
    );
  }

  const submission = await prisma.submission.create({
    data: {
      assignmentId,
      userId: session.id,
      mediaUrl: `storage://school-media/${storagePath}`,
      notes: notes || null,
      status: "PENDING",
    },
  });
  return NextResponse.json({ submission }, { status: 201 });
}

export async function GET() {
  const session = await requireRole(["GURU", "ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, kelas: true } },
      assignment: { select: { title: true } },
    },
  });
  const mediaUrls = await signMediaReferences(
    submissions.map((submission) => submission.mediaUrl),
  );
  return NextResponse.json({
    submissions: submissions.map((submission, index) => ({
      ...submission,
      mediaUrl: mediaUrls[index],
    })),
  });
}
