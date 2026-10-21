import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ModuleInputSchema } from "@/lib/module-input";
import { InvalidEbookError, validateEbookReference } from "@/lib/ebook-storage";

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

  const parsed = ModuleInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Periksa judul, kategori, deskripsi, dan tautan materi." }, { status: 400 });
  const body = parsed.data;
  let pdfUrl: string | null;
  try { pdfUrl = await validateEbookReference(body.pdfUrl, user.id); }
  catch (error) {
    if (error instanceof InvalidEbookError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Validasi e-book gagal:", error);
    return NextResponse.json({ error: "Penyimpanan e-book belum tersedia. Coba lagi." }, { status: 503 });
  }
  const last = await prisma.module.findFirst({ orderBy: { order: "desc" } });
  const mod = await prisma.module.create({
    data: {
      title: body.title,
      category: body.category,
      description: body.description,
      videoUrl: body.videoUrl || null,
      pdfUrl,
      order: (last?.order ?? 0) + 1,
    },
  });
  return NextResponse.json({ module: mod }, { status: 201 });
}
