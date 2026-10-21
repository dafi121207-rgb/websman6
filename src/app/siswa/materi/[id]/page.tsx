import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, HelpCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { Badge, DoubleBezel, PrimaryButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DetailMateri({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mod = await prisma.module.findUnique({
    where: { id },
    include: {
      quizzes: { select: { id: true, title: true, durationMin: true } },
    },
  });
  if (!mod) notFound();

  return (
    <div className="space-y-4">
      <Link href="/siswa/materi" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} /> Kembali ke daftar materi
      </Link>

      <div>
        <Badge>{mod.category}</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 leading-tight">{mod.title}</h1>
      </div>

      <DoubleBezel>
        <h2 className="font-extrabold text-lg">Deskripsi Materi</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-600 whitespace-pre-line">{mod.description}</p>
      </DoubleBezel>

      {mod.videoUrl ? (
        <DoubleBezel>
          <h2 className="font-extrabold text-lg mb-3">Video Tutorial Gerakan</h2>
          <div className="aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-black/5">
            <iframe
              src={mod.videoUrl}
              title={`Tutorial ${mod.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DoubleBezel>
      ) : null}
      {/* belum ada modul tertaut */}
      {mod.quizzes.length > 0 && (
        <DoubleBezel>
          <h2 className="font-extrabold text-lg">Kuis Terkait</h2>
          <div className="mt-3 space-y-2">
            {mod.quizzes.map((q) => (
              <Link
                key={q.id}
                href={`/siswa/kuis/${q.id}`}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 ring-1 ring-slate-200 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-800">{q.title}</p>
                  <p className="text-[12px] text-slate-400">{q.durationMin} menit</p>
                </div>
                <HelpCircle size={18} className="text-blue-600" />
              </Link>
            ))}
          </div>
        </DoubleBezel>
      )}

      {mod.pdfUrl && (
        <a href={`/modul/${mod.id}/ebook`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm">
          <FileText size={16} /> Unduh PDF Materi
        </a>
      )}
    </div>
  );
}
