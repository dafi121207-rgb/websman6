import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ModuleInputSchema } from "@/lib/module-input";
import { InvalidEbookError, validateEbookReference } from "@/lib/ebook-storage";

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
  const input = await req.json().catch(() => null);
  const parsed = ModuleInputSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: "Periksa judul, kategori, deskripsi, dan tautan materi." }, { status: 400 });
  const body = parsed.data;
  const existing = await prisma.module.findUnique({ where: { id }, select: { pdfUrl: true } });
  if (!existing) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
  let pdfUrl: string | null;
  try { pdfUrl = await validateEbookReference(Object.prototype.hasOwnProperty.call(input, "pdfUrl") ? body.pdfUrl : existing.pdfUrl, user.id, existing.pdfUrl); }
  catch (error) {
    if (error instanceof InvalidEbookError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Validasi e-book gagal:", error);
    return NextResponse.json({ error: "Penyimpanan e-book belum tersedia. Coba lagi." }, { status: 503 });
  }
  const mod = await prisma.module.update({
    where: { id },
    data: {
      title: body.title,
      category: body.category,
      description: body.description,
      videoUrl: body.videoUrl || null,
      pdfUrl,
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
