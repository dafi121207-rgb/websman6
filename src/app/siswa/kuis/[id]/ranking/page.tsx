import Link from "next/link";
import { ArrowLeft, Trophy, Medal, Clock3 } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function duration(seconds: number | null) {
  return seconds === null ? "Belum tercatat" : `${Math.floor(seconds / 60)}m ${seconds % 60}d`;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SISWA"]);
  if (!user) redirect("/login");
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz) notFound();
  const rows = await prisma.quizAttempt.findMany({
    where: { quizId: id }, orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    include: { user: { select: { name: true } } },
  });
  let rank = 0;
  const ranked = rows.map((row, index) => {
    if (index === 0 || rows[index - 1].score !== row.score) rank = index + 1;
    return { ...row, rank, displayName: row.userId === user.id ? row.user.name : row.user.name.split(" ").map((word, i) => i === 0 ? word : `${word[0]}.`).join(" ") };
  });
  const mine = ranked.find(row => row.userId === user.id);
  const rest = ranked.filter(row => row.rank > 3);

  return (
    <section className="mx-auto w-full min-w-0 max-w-3xl">
      <Link href="/siswa/kuis" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" /> Daftar kuis</Link>
      <header className="mt-4 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#17324d]">Ranking kuis</h1>
        <p className="mt-2 text-base font-medium text-slate-700">{quiz.title}</p>
        <p className="mt-2 text-sm text-slate-500">{rows.length} peserta telah menyelesaikan kuis</p>
      </header>

      {!rows.length ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Trophy size={32} className="mx-auto text-blue-700" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold">Ranking belum tersedia</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Hasil akan muncul setelah ada peserta yang menyelesaikan kuis.</p>
          <Link href={`/siswa/kuis/${id}`} className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800">Buka kuis</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#17324d] px-5 py-4 text-white">
            {mine ? <><p className="text-sm">Peringkatmu <strong className="ml-2 text-lg tabular-nums">#{mine.rank}</strong></p><p className="text-sm"><strong>{mine.score}</strong> poin <span className="mx-2 text-slate-300">·</span> {duration(mine.durationSeconds)}</p></> : <p className="text-sm leading-relaxed">Selesaikan kuis untuk melihat peringkatmu di sini.</p>}
          </div>

          <section aria-labelledby="podium-title" className="mt-8">
            <h2 id="podium-title" className="text-lg font-bold text-[#17324d]">Peringkat teratas</h2>
            <div className="mt-6 grid grid-cols-3 items-end gap-2 border-b border-slate-200 sm:gap-4">
              {[2, 1, 3].map(place => {
                const winners = ranked.filter(row => row.rank === place);
                const tone = place === 1 ? "border-amber-200 bg-amber-50 text-amber-900" : place === 2 ? "border-slate-200 bg-slate-100 text-slate-700" : "border-orange-200 bg-orange-50 text-orange-900";
                return (
                  <div key={place} className="flex min-w-0 flex-col text-center">
                    <div className="pb-4">
                      {winners.length ? winners.map(row => <div key={row.id} className="px-1 [&+div]:mt-4">
                        <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border sm:h-12 sm:w-12 ${tone}`}>{place === 1 ? <Trophy size={20} aria-hidden="true" /> : <Medal size={20} aria-hidden="true" />}</div>
                        <p className="break-words text-xs font-semibold leading-5 text-slate-900 sm:text-sm">{row.displayName}</p>
                        {row.userId === user.id && <p className="mt-1 text-xs font-semibold text-blue-700">Kamu</p>}
                        <p className="mt-2 text-lg font-bold tabular-nums text-[#17324d] sm:text-2xl">{row.score}<span className="block text-xs font-normal text-slate-500">poin</span></p>
                        <p className="mt-2 text-xs tabular-nums text-slate-500">{duration(row.durationSeconds)}</p>
                      </div>) : <p className="px-1 text-xs leading-5 text-slate-500">Belum ada<br />peserta</p>}
                    </div>
                    <div aria-label={`Peringkat ${place}`} className={`flex items-center justify-center rounded-t-xl border border-b-0 ${tone} ${place === 1 ? "h-28 sm:h-36" : place === 2 ? "h-20 sm:h-24" : "h-14 sm:h-16"}`}><span className="text-3xl font-bold tabular-nums sm:text-4xl">{place}</span></div>
                  </div>
                );
              })}
            </div>
          </section>

          <p className="mt-4 text-xs leading-5 text-slate-500">Nilai sama mendapat peringkat yang sama, termasuk di podium. Waktu pengerjaan hanya sebagai informasi.</p>

          {rest.length > 0 && <section aria-labelledby="other-ranks" className="mt-8">
            <h2 id="other-ranks" className="mb-4 text-lg font-bold text-[#17324d]">Peringkat lainnya</h2>
            <ol className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {rest.map(row => <li key={row.id} value={row.rank} className={`flex min-w-0 items-center gap-3 px-4 py-4 sm:gap-5 sm:px-5 ${row.userId === user.id ? "bg-blue-50" : ""}`}>
                <span className="w-8 shrink-0 text-sm font-semibold tabular-nums text-slate-500">#{row.rank}</span>
                <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-slate-900">{row.displayName}{row.userId === user.id && <span className="ml-2 text-xs text-blue-700">Kamu</span>}</p><p className="mt-1 flex items-center gap-1.5 text-xs tabular-nums text-slate-500"><Clock3 size={12} aria-hidden="true" />{duration(row.durationSeconds)}</p></div>
                <div className="shrink-0 text-right"><strong className="text-lg tabular-nums text-[#17324d]">{row.score}</strong><p className="text-xs text-slate-500">poin</p></div>
              </li>)}
            </ol>
          </section>}
        </>
      )}
    </section>
  );
}
