import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import PublicFooter from "@/components/PublicFooter";
import prisma from "@/lib/prisma";
import ModuleCatalog from "./ModuleCatalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Modul belajar PJOK", description: "Baca materi PJOK, tonton video, dan akses e-book SMAN 6 Garut tanpa login." };

export default async function ModulesPage() {
  const modules = await prisma.module.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id:true,title:true,category:true,description:true,videoUrl:true,pdfUrl:true,order:true } });
  return <PublicShell><main id="main-content" className="public-main"><header className="page-heading"><div className="site-container"><Link href="/" className="breadcrumb"><ArrowLeft size={14} /> Beranda</Link><p className="eyebrow">Ruang belajar</p><h1>Modul PJOK</h1><p className="section-intro">Materi, video, dan e-book. Bisa dibaca tanpa akun.</p></div></header><div className="site-container page-content"><ModuleCatalog modules={modules} /></div></main><PublicFooter /></PublicShell>;
}
