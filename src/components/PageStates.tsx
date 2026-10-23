import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";

export function SchoolLoading({ label = "Menyiapkan halaman…", compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={`school-loading ${compact ? "school-loading--compact" : ""}`}>
      <div className="school-loading__mark" aria-hidden="true">
        <img src="/logo.png" alt="" width={64} height={72} />
        <img src="/logo.png" alt="" width={64} height={72} className="school-loading__reveal" />
      </div>
      <div><p className="font-bold text-slate-900">SMAN 6 Garut</p><p className="mt-1 text-sm text-slate-600">{label}</p></div>
    </div>
  );
}

export function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return <div className="empty-state">
    <Inbox size={22} aria-hidden="true" className="text-slate-400" />
    <div><h3 className="text-sm font-semibold text-slate-800">{title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
      {href && action && <Link href={href} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-blue-700 hover:underline">{action}<ArrowUpRight size={16} /></Link>}
    </div>
  </div>;
}
