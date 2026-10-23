import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function DashboardIntro({ eyebrow, title, description, href, action }: { eyebrow: string; title: string; description: string; href: string; action: string }) {
  return <section className="dashboard-intro">
    <div className="dashboard-intro__copy">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600">{description}</p>
      <Link href={href} className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-lg bg-[#17324d] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{action}<ArrowUpRight size={17} /></Link>
    </div>
    <div className="dashboard-intro__photo">
      <img src="/images/school/lapangan-sekolah.webp" alt="Lapangan SMAN 6 Garut" width={640} height={480} />
      <span>RUANG BELAJAR KITA · SMAN 6 GARUT</span>
    </div>
  </section>;
}

export function DashboardStats({ items }: { items: { label: string; value: string | number; href: string }[] }) {
  return <div className="dashboard-stats">{items.map((item) => <Link key={item.label} href={item.href} className="dashboard-stat">
    <span className="text-sm text-slate-600">{item.label}</span><span className="mt-2 block text-3xl font-bold tabular-nums tracking-tight text-[#17324d]">{item.value}</span><ArrowUpRight size={16} aria-hidden="true" className="absolute right-4 top-4 text-slate-400" />
  </Link>)}</div>;
}
