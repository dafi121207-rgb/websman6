import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const mod = await prisma.module.findUnique({
    where: { id },
    include: {
      quizzes: { select: { id: true, title: true, durationMin: true, passScore: true } },
    },
  });
  if (!mod) return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ module: mod });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const mod = await prisma.module.update({
    where: { id },
    data: {
      title: body.title,
      category: body.category,
      description: body.description,
      videoUrl: body.videoUrl || null,
      pdfUrl: body.pdfUrl || null,
    },
  });
  return NextResponse.json({ module: mod });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.module.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
