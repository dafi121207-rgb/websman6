import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET(req: NextRequest) {
  const onlyPublished = req.nextUrl.searchParams.get("all") !== "1";
  const news = await prisma.news.findMany({
    where: onlyPublished ? { published: true } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ news });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const body = await req.json();
  if (!body.title || !body.content) {
    return NextResponse.json({ error: "Judul dan isi wajib diisi" }, { status: 400 });
  }
  const news = await prisma.news.create({
    data: {
      title: body.title,
      slug: `${slugify(body.title)}-${Date.now().toString(36)}`,
      content: body.content,
      published: body.published ?? true,
    },
  });
  return NextResponse.json({ news }, { status: 201 });
}
