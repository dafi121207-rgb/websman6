import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function parse(profile: { vision: string; mission: string }) {
  return {
    ...profile,
    mission: JSON.parse(profile.mission),
  };
}

export async function GET() {
  const profile = await prisma.schoolProfile.findUnique({ where: { id: "sman6garut" } });
  if (!profile) return NextResponse.json({ error: "Profil belum di-seed" }, { status: 404 });
  return NextResponse.json(parse(profile));
}

export async function PUT(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.schoolProfile.update({
    where: { id: "sman6garut" },
    data: {
      title: body.title,
      tagline: body.tagline,
      email: body.email,
      phone: body.phone,
      welcomeText: body.welcomeText,
      vision: body.vision,
      mission: Array.isArray(body.mission) ? JSON.stringify(body.mission) : body.mission,
    },
  });
  return NextResponse.json(parse(updated));
}
