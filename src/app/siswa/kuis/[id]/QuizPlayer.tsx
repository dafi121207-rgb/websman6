"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Timer, XCircle, AlertTriangle } from "lucide-react";
import type { QuestionDTO, AttemptResultDTO } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type QuizInfo = {
  id: string;
  title: string;
  moduleTitle: string;
  durationMin: number;
  passScore: number;
};

export default function QuizPlayer({
  quiz,
  questions,
  alreadyDone,
}: {
  quiz: QuizInfo;
  questions: QuestionDTO[];
  alreadyDone: boolean;
}) {
  const ordered = useMemo(() => shuffle(questions), [questions]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(quiz.durationMin * 60);
  const [result, setResult] = useState<AttemptResultDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const startedAtRef = useRef<number>(0);

  const current = ordered[idx];
  const answeredCount = Object.keys(answers).length;

  const submit = async (auto = false) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, auto }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim jawaban");
        submittingRef.current = false;
        return;
      }
      setResult(data);
    } catch {
      setError("Koneksi bermasalah.");
    } finally {
      submittingRef.current = false;
    }
  };

  useEffect(() => {
    if (!started || result) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          submit(true); // auto-submit saat waktu habis
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, result]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (alreadyDone && !result) {
    return (
      <div className="glass-shell ring-1 ring-black/5 max-w-xl mx-auto">
        <div className="bezel-core p-8 text-center">
          <p className="text-4xl">🔒</p>
          <h2 className="mt-3 text-xl font-extrabold">Kuis Sudah Dikerjakan</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Setiap siswa hanya bisa mengerjakan kuis ini satu kali.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href={`/siswa/kuis/${quiz.id}/hasil`} className="pjok-btn bg-blue-600">
              <span className="pjok-btn-inner bg-blue-600">Lihat Hasilku</span>
            </Link>
            <Link href="/siswa/kuis" className="pjok-btn bg-slate-100">
              <span className="pjok-btn-inner bg-slate-100! text-slate-700">Kembali</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- RESULT VIEW ---------- */
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-shell ring-1 ring-black/5">
          <div className="bezel-core p-8 text-center">
            <p
              className={`text-5xl font-extrabold ${
                result.isPassed ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {result.score}
            </p>
            <p className="mt-1 text-sm text-slate-500 font-medium">dari skala 100 · lulus ≥ {result.passScore}</p>
            <div
              className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
                result.isPassed
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
              }`}
            >
              {result.isPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {result.isPassed ? "SELAMAT, KAMU LULUS!" : "BELUM LULUS, SEMANGAT!"}
            </div>
          </div>
        </div>

        {/* Review & pembahasan */}
        <div className="space-y-3">
          {result.review.map((r, i) => (
            <div key={i} className="glass-shell ring-1 ring-black/5">
              <div className="bezel-core p-5">
                <div className="flex items-start gap-2.5">
                  {r.chosen === r.correctAnswer ? (
                    <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-800">
                      {i + 1}. {r.questionText}
                    </p>
                    <div className="mt-2 space-y-1">
                      {r.options.map((o, oi) => {
                        const isCorrect = oi === r.correctAnswer;
                        const isChosen = oi === r.chosen;
                        return (
                          <p
                            key={oi}
                            className={`text-[13px] px-3 py-1.5 rounded-xl ring-1 ${
                              isCorrect
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200 font-semibold"
                                : isChosen
                                ? "bg-rose-50 text-rose-800 ring-rose-200"
                                : "bg-slate-50 text-slate-500 ring-slate-100"
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}. {o}
                            {isChosen && oi !== r.correctAnswer && " ← jawabanmu"}
                          </p>
                        );
                      })}
                    </div>
                    {r.explanation && (
                      <p className="mt-2.5 text-[12px] text-blue-800 bg-blue-50 ring-1 ring-blue-100 rounded-xl px-3 py-2">
                        💡 {r.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3 pt-2 pb-6">
          <Link
            href="/siswa/kuis"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] shadow-md shadow-slate-900/15 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Kuis</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- START SCREEN ---------- */
  if (!started) {
    return (
      <div className="glass-shell ring-1 ring-black/5 max-w-xl mx-auto">
        <div className="bezel-core p-8 text-center">
          <p className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">{quiz.moduleTitle}</p>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">{quiz.title}</h1>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-50 ring-1 ring-slate-200 text-slate-700 font-semibold">
              {questions.length} soal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 ring-1 ring-slate-200 text-slate-700 font-semibold">
              <Clock size={13} className="text-slate-500" />
              <span>{quiz.durationMin} menit</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-50 ring-1 ring-slate-200 text-slate-700 font-semibold">
              Lulus ≥ {quiz.passScore}
            </span>
          </div>
          <button
            onClick={() => {
              setStarted(true);
              startedAtRef.current = Date.now();
            }}
            className="mt-6 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <span>Mulai Kerjakan Kuis</span>
            <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- PLAYER ---------- */
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Timer bar */}
      <div className="glass-shell ring-1 ring-black/5 sticky top-[4.25rem] z-30">
        <div className="bezel-core p-3! flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1.5 rounded-xl ring-1 ${
            secondsLeft < 60 ? "bg-rose-50 text-rose-600 ring-rose-200" : "bg-slate-50 text-slate-700 ring-slate-200"
          }`}>
            <Timer size={15} /> {fmt(secondsLeft)}
          </span>
          {/* progress */}
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(answeredCount / ordered.length) * 100}%` }}
            />
          </div>
          <span className="text-[12px] font-bold text-slate-600">{answeredCount}/{ordered.length}</span>
        </div>
      </div>

      {/* Soal */}
      <div className="glass-shell ring-1 ring-black/5">
        <div className="bezel-core p-6">
          <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            Soal {idx + 1} / {ordered.length}
          </p>
          <h2 className="mt-2 font-bold text-slate-900 text-[15px] leading-relaxed">{current.questionText}</h2>
          <div className="mt-4 space-y-2">
            {current.options.map((opt, oi) => {
              const selected = answers[current.id] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers((a) => ({ ...a, [current.id]: oi }))}
                  className={`w-full text-left px-4 py-3 rounded-2xl ring-1 text-[13.5px] transition-all ${
                    selected
                      ? "bg-blue-50 text-blue-800 ring-blue-400 font-semibold shadow-sm"
                      : "bg-slate-50 text-slate-600 ring-slate-200 hover:ring-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <span className="inline-flex w-6 h-6 rounded-lg bg-white ring-1 ring-black/5 items-center justify-center text-[11px] font-bold mr-2">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold disabled:opacity-40"
            >
              ← Sebelumnya
            </button>
            {idx < ordered.length - 1 ? (
              <button
                onClick={() => setIdx((i) => i + 1)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
              >
                Selanjutnya →
              </button>
            ) : (
              <button
                onClick={() => submit()}
                disabled={answeredCount < ordered.length}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-40"
              >
                ✓ Selesai &amp; Kirim
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigasi soal grid */}
      <div className="glass-shell ring-1 ring-black/5">
        <div className="bezel-core p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Navigasi Soal</p>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {ordered.map((q, qi) => (
              <button
                key={q.id}
                onClick={() => setIdx(qi)}
                aria-label={`Buka soal ${qi + 1}${answers[q.id] !== undefined ? ", sudah dijawab" : ""}`}
                aria-current={qi === idx ? "step" : undefined}
                className={`min-h-11 rounded-xl text-[12px] font-bold ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  qi === idx
                    ? "bg-blue-600 text-white ring-blue-600"
                    : answers[q.id] !== undefined
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-slate-50 text-slate-500 ring-slate-200"
                }`}
              >
                {qi + 1}
              </button>
            ))}
          </div>
          {error && (
            <p className="mt-3 text-[13px] text-rose-600 font-medium flex items-center gap-1.5">
              <AlertTriangle size={14} /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
