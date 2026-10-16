import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

import bcrypt from "bcryptjs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });

  const { identifier, name, role, kelas, password } = body;
  if (!identifier || !name || !role) {
    return NextResponse.json(
      { error: "Nama, nomor identitas, dan role wajib diisi" },
      { status: 400 }
    );
  }

  // Cek duplikasi identifier di akun lain
  const conflict = await prisma.user.findFirst({
    where: {
      identifier: String(identifier).trim(),
      NOT: { id },
    },
    select: { id: true },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Nomor identitas (NISN/NIP/Username) sudah dipakai akun lain" },
      { status: 409 }
    );
  }

  const updateData: {
    identifier: string;
    name: string;
    role: string;
    kelas?: string | null;
    password?: string;
  } = {
    identifier: String(identifier).trim(),
    name: String(name).trim(),
    role: String(role).trim(),
    kelas: role === "SISWA" ? (kelas || null) : null,
  };

  if (password && String(password).trim().length > 0) {
    updateData.password = await bcrypt.hash(String(password).trim(), 10);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        identifier: true,
        name: true,
        role: true,
        kelas: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ user: updated });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
    }
    throw e;
  }
}

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
