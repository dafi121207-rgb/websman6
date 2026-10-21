import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/public-content";

type News = { id: string; slug: string; title: string; content: string; createdAt: Date };
export default function NewsRows({ news }: { news: News[] }) {
  return <div className="news-rows">{news.map((item) => <article key={item.id}><Link href={`/berita/${encodeURIComponent(item.slug)}`} className="news-row"><time dateTime={item.createdAt.toISOString()}>{formatDate(item.createdAt)}</time><div><h3>{item.title}</h3><p>{item.content}</p><span className="read-link">Baca berita <ArrowUpRight size={15} /></span></div></Link></article>)}{news.length === 0 && <p className="empty-state">Belum ada berita yang dipublikasikan.</p>}</div>;
}
