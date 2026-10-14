import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });
  const { id } = await ctx.params;
  if (id === admin.id) {
    return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
  }
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    // P2025 = record tidak ditemukan (akun sudah dihapus / id salah).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}
