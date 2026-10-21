import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createEbookUploadToken, EBOOK_MAX_SIZE } from "@/lib/ebook-storage";

export async function POST(request: NextRequest) {
  const user = await requireRole(["GURU", "ADMIN"]);
  if (!user) return NextResponse.json({ error: "Hanya guru dan admin dapat mengunggah e-book." }, { status: 403 });
  const parsed = z.object({ contentType: z.literal("application/pdf"), size: z.number().int().positive().max(EBOOK_MAX_SIZE) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pilih PDF dengan ukuran maksimal 20 MB." }, { status: 400 });
  try { return NextResponse.json(await createEbookUploadToken(user.id)); }
  catch (error) { console.error("Gagal menyiapkan unggahan e-book:", error); return NextResponse.json({ error: "Penyimpanan e-book belum tersedia. Coba lagi nanti." }, { status: 503 }); }
}
