import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEbookUrl } from "@/lib/ebook-storage";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const module = await prisma.module.findUnique({ where: { id }, select: { pdfUrl: true, title: true } });
  if (!module?.pdfUrl) return new NextResponse("E-book belum tersedia.", { status: 404 });
  try {
    const filename = request.nextUrl.searchParams.get("download") === "1" ? `${module.title.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 80) || "materi"}.pdf` : undefined;
    const url = await getEbookUrl(module.pdfUrl, filename);
    if (!url) return new NextResponse("Tautan e-book tidak valid.", { status: 404 });
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    console.error("Gagal membuka e-book:", error);
    return new NextResponse("E-book belum dapat dibuka. Silakan kembali ke modul dan coba lagi.", { status: 503 });
  }
}
