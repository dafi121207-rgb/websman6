import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import PublicFooter from "@/components/PublicFooter";
import NewsRows from "@/components/NewsRows";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Berita & agenda", description: "Berita dan agenda pembelajaran PJOK SMAN 6 Garut." };
export default async function NewsPage() {
  const news = await prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return <PublicShell><main id="main-content" className="public-main"><header className="page-heading"><div className="site-container"><Link href="/" className="breadcrumb"><ArrowLeft size={14} /> Beranda</Link><p className="eyebrow">Kabar sekolah</p><h1>Berita & agenda</h1></div></header><div className="site-container page-content"><NewsRows news={news} /></div></main><PublicFooter /></PublicShell>;
}
