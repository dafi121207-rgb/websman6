import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const session = await requireRole(["SISWA", "GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const assignments = await prisma.assignment.findMany({
    orderBy: { dueDate: "desc" },
    include: {
      module: { select: { title: true, category: true } },
      submissions:
        session.role === "SISWA"
          ? { where: { userId: session.id } }
          : { select: { id: true, status: true, userId: true } },
    },
  });

  return NextResponse.json({
    assignments: assignments.map((a) => ({
      id: a.id,
      moduleId: a.moduleId,
      moduleTitle: a.module?.title,
      category: a.module?.category,
      title: a.title,
      instruction: a.instruction,
      dueDate: a.dueDate,
      mySubmission: session.role === "SISWA" ? a.submissions[0] ?? null : null,
      submissionCount: session.role === "SISWA" ? undefined : a.submissions.length,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const body = await req.json();
  if (!body.moduleId || !body.title || !body.instruction) {
    return NextResponse.json({ error: "Modul, judul, dan instruksi wajib diisi" }, { status: 400 });
  }
  const assignment = await prisma.assignment.create({
    data: {
      moduleId: body.moduleId,
      title: body.title,
      instruction: body.instruction,
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 7 * 86400000),
    },
  });
  return NextResponse.json({ assignment }, { status: 201 });
}
