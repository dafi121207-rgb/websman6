import Link from "next/link";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import { EmptyState } from "@/components/PageStates";

export const dynamic = "force-dynamic";

export default async function SiswaMateri() {
  const modules = await prisma.module.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">Bab Pembelajaran</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Modul Materi PJOK</h1>
      </div>

      {modules.length === 0 && <EmptyState title="Materi belum tersedia" description="Materi dari guru akan tampil di sini setelah diterbitkan." href="/siswa" action="Kembali ke ruang belajar" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modules.map((m) => (
          <Link key={m.id} href={`/siswa/materi/${m.id}`} className="glass-shell ring-1 ring-black/5 misi-card block">
            <div className="bezel-core p-5 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <Badge>{m.category}</Badge>
                {m.videoUrl && <PlayCircle size={18} className="text-blue-600" />}
              </div>
              <h3 className="mt-2.5 font-bold text-slate-900 leading-snug">{m.title}</h3>
              <p className="mt-1.5 text-[13px] text-slate-500 line-clamp-3 flex-1">{m.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600">
                Buka Modul <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
