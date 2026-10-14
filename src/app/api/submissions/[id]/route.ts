import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireRole(["GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json();
  const data: { score?: number; status?: string } = {};
  if (body.score !== undefined) data.score = Number(body.score);
  if (body.status) data.status = body.status;

  const submission = await prisma.submission.update({
    where: { id },
    data,
  });
  return NextResponse.json({ submission });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await requireRole(["GURU", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.submission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
