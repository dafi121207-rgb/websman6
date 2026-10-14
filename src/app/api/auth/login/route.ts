import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signSession, SESSION_COOKIE } from "@/lib/session-token";

const LoginSchema = z.object({
  identifier: z.string().min(1, "NISN/NIP/Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { identifier: parsed.data.identifier.trim() },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan. Periksa NISN/NIP Anda." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(parsed.data.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah." }, { status: 401 });
    }

    const token = await signSession({
      id: user.id,
      identifier: user.identifier,
      name: user.name,
      role: user.role as "ADMIN" | "GURU" | "SISWA",
      kelas: user.kelas,
    });

    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("login error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
