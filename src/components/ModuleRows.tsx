import Link from "next/link";
import { ArrowUpRight, FileText, Play } from "lucide-react";

export type PublicModule = { id: string; title: string; category: string; description: string; videoUrl: string | null; pdfUrl: string | null; order: number };

export default function ModuleRows({ modules }: { modules: PublicModule[] }) {
  return <div className="module-rows">{modules.map((module, index) => <Link key={module.id} href={`/modul/${module.id}`} className="module-row">
    <span className="module-index">{String(index + 1).padStart(2, "0")}</span>
    <div className="module-copy"><span className="category-label">{module.category}</span><h3>{module.title}</h3><p>{module.description}</p><div className="module-formats"><span>Materi</span>{module.videoUrl && <span><Play size={13} /> Video</span>}{module.pdfUrl && <span><FileText size={13} /> E-book</span>}</div></div>
    <ArrowUpRight className="module-arrow" size={24} aria-hidden="true" />
  </Link>)}{modules.length === 0 && <p className="empty-state">Belum ada modul yang tersedia.</p>}</div>;
}
