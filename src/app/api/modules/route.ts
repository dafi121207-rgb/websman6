import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: { quizzes: { select: { id: true } } },
  });
  return NextResponse.json({ modules });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const body = await req.json();
  if (!body.title || !body.category || !body.description) {
    return NextResponse.json({ error: "Judul, kategori, dan deskripsi wajib diisi" }, { status: 400 });
  }
  const last = await prisma.module.findFirst({ orderBy: { order: "desc" } });
  const mod = await prisma.module.create({
    data: {
      title: body.title,
      category: body.category,
      description: body.description,
      videoUrl: body.videoUrl || null,
      pdfUrl: body.pdfUrl || null,
      order: (last?.order ?? 0) + 1,
    },
  });
  return NextResponse.json({ module: mod }, { status: 201 });
}
