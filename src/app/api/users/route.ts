import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      identifier: true,
      name: true,
      role: true,
      kelas: true,
      email: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });

  const body = await req.json();
  if (!body.identifier || !body.name || !body.password || !body.role) {
    return NextResponse.json(
      { error: "Identifier, nama, password, dan role wajib diisi" },
      { status: 400 }
    );
  }
  const exists = await prisma.user.findUnique({ where: { identifier: body.identifier } });
  if (exists) {
    return NextResponse.json({ error: "NISN/NIP sudah terdaftar" }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: {
      identifier: String(body.identifier).trim(),
      name: body.name,
      password: bcrypt.hashSync(String(body.password), 10),
      role: body.role,
      kelas: body.kelas || null,
    },
    select: { id: true, identifier: true, name: true, role: true, kelas: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
