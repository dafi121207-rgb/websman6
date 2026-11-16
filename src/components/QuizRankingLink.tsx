import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";

export default function QuizRankingLink({ quizId }: { quizId: string }) {
  return (
    <Link
      href={`/siswa/kuis/${quizId}/ranking`}
      className="group flex min-h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#17324d] transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:w-fit"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Trophy size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 leading-snug">Ranking &amp; waktu pengerjaan</span>
      <ArrowUpRight size={18} aria-hidden="true" className="ml-1 shrink-0 text-slate-500 group-hover:text-blue-700" />
    </Link>
  );
}
