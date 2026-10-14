import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const news = await prisma.news.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      published: body.published ?? true,
    },
  });
  return NextResponse.json({ news });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.news.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
