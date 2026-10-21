import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, Download } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import PublicFooter from "@/components/PublicFooter";
import prisma from "@/lib/prisma";
import { safeWebUrl, videoEmbedUrl } from "@/lib/public-content";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
const getModule = cache((id: string) => prisma.module.findUnique({ where: { id }, select: { id:true,title:true,category:true,description:true,videoUrl:true,pdfUrl:true } }));
export async function generateMetadata({ params }: Props) { const mod = await getModule((await params).id); return { title: mod?.title ?? "Modul tidak ditemukan" }; }

export default async function ModuleDetail({ params }: Props) {
  const mod = await getModule((await params).id);
  if (!mod) notFound();
  const video = videoEmbedUrl(mod.videoUrl);
  const videoLink = safeWebUrl(mod.videoUrl);
  return <PublicShell><main id="main-content" className="public-main"><header className="page-heading"><div className="site-container"><Link href="/modul" className="breadcrumb"><ArrowLeft size={14} /> Semua modul</Link><p className="eyebrow">{mod.category}</p><h1>{mod.title}</h1><p className="section-intro">Materi terbuka · PJOK SMAN 6 Garut</p></div></header><div className="site-container page-content reading-layout"><div className="reading-body"><section><h2>Materi</h2><p className="whitespace-pre-wrap">{mod.description}</p></section>{video && <section><h2>Video pembelajaran</h2><div className="aspect-video overflow-hidden rounded-lg bg-slate-100"><iframe src={video} title={`Video: ${mod.title}`} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen className="w-full h-full border-0" /></div></section>}{!video && videoLink && <a href={videoLink} target="_blank" rel="noopener noreferrer" className="text-link">Buka video pembelajaran <ArrowUpRight size={18} /></a>}</div><aside className="reading-aside"><h2>E-book materi</h2>{mod.pdfUrl ? <><p>Baca atau simpan PDF untuk belajar mandiri.</p><a href={`/modul/${mod.id}/ebook`} target="_blank" rel="noopener noreferrer" className="site-button w-full"><BookOpen size={17} /> Baca e-book</a><a href={`/modul/${mod.id}/ebook?download=1`} target="_blank" rel="noopener noreferrer" className="text-link"><Download size={16} /> Unduh PDF</a></> : <p>E-book belum ditambahkan untuk modul ini.</p>}<div className="border-t border-slate-200 mt-6 pt-6"><h2>Kuis & tugas</h2><p>Masuk dengan akun siswa untuk mengikuti kuis dan mengumpulkan tugas.</p><Link href={`/siswa/materi/${mod.id}`} className="text-link">Buka ruang siswa <ArrowUpRight size={16} /></Link></div></aside></div></main><PublicFooter /></PublicShell>;
}
