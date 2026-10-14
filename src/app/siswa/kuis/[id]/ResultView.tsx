"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Info, XCircle } from "lucide-react";

type ReviewItem = {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
};

export default function ResultView({
  quizTitle,
  passScore,
  score,
  isPassed,
  createdAt,
  questions,
}: {
  quizTitle: string;
  passScore: number;
  score: number;
  isPassed: boolean;
  createdAt: string;
  questions: ReviewItem[];
}) {
  return (
    <div className="max-w-2xl w-full mx-auto space-y-4 px-2 sm:px-0">
      {/* Score Summary Card */}
      <div className="glass-shell ring-1 ring-black/5 bg-white/70 shadow-sm">
        <div className="bezel-core p-6 sm:p-8 text-center bg-white/95">
          <p className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
            Hasil Evaluasi: {quizTitle}
          </p>
          <p
            className={`mt-2 text-5xl sm:text-6xl font-black ${
              isPassed ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {score}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold ring-1 ${
                isPassed
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-rose-200"
              }`}
            >
              {isPassed ? "LULUS EVALUASI" : "BELUM LULUS"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Dikerjakan {new Date(createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · Batas minimal lulus: {passScore}
          </p>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="glass-shell ring-1 ring-black/5 bg-white/70 shadow-xs">
            <div className="bezel-core p-5 bg-white/95">
              <p className="font-bold text-sm text-slate-900 leading-snug">
                {i + 1}. {q.questionText}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 font-semibold">
                  <CheckCircle2 size={14} /> Kunci Jawaban: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
                </span>
              </div>
              {q.explanation && (
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-blue-50/70 ring-1 ring-blue-100 rounded-xl p-3">
                  <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-blue-900">Pembahasan: </span>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Clean, High-Contrast Return Button */}
      <div className="flex justify-center pt-2 pb-6">
        <Link
          href="/siswa/kuis"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] shadow-md shadow-slate-900/15 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Kuis</span>
        </Link>
      </div>
    </div>
  );
}
