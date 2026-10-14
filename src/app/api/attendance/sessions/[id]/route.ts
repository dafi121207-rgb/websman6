import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json();
  const session = await prisma.attendanceSession.update({
    where: { id },
    data: { isOpen: !!body.isOpen },
  });
  return NextResponse.json({ session });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.attendanceSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
