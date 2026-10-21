import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import PublicFooter from "@/components/PublicFooter";
import { formatDate, safeWebUrl } from "@/lib/public-content";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
const getNews = cache((slug: string) => prisma.news.findFirst({ where: { slug, published: true } }));
export async function generateMetadata({ params }: Props) { const news = await getNews((await params).slug); return { title: news?.title ?? "Berita tidak ditemukan" }; }
export default async function NewsDetail({ params }: Props) {
  const news = await getNews((await params).slug);
  if (!news) notFound();
  const cover = news.coverImage?.startsWith("/images/") ? news.coverImage : safeWebUrl(news.coverImage);
  return <PublicShell><main id="main-content" className="public-main"><header className="page-heading"><div className="site-container"><Link href="/berita" className="breadcrumb"><ArrowLeft size={14} /> Semua berita</Link><p className="eyebrow">Kabar sekolah</p><h1>{news.title}</h1><p className="section-intro"><time dateTime={news.createdAt.toISOString()}>{formatDate(news.createdAt)}</time></p></div></header><article className="site-container"><div className="article-body reading-body">{cover && <img src={cover} alt={news.title} className="article-cover" />}{news.content.split(/\n\s*\n/).map((paragraph,index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>)}<Link href="/berita" className="text-link mt-8"><ArrowLeft size={16} /> Kembali ke berita</Link></div></article></main><PublicFooter /></PublicShell>;
}
