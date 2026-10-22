"use client";

import { useState } from "react";
import { Plus, Save, Trash2, XCircle } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton } from "@/components/ui";

type QuizList = {
  id: string;
  title: string;
  moduleTitle: string;
  durationMin: number;
  passScore: number;
  questionCount: number;
  attemptCount: number;
};

type DraftQuestion = { questionText: string; options: string[]; correctAnswer: number; explanation: string };

type DraftQuiz = { title: string; moduleId: string; durationMin: number; passScore: number; questions: DraftQuestion[] };

const EMPTY_Q: DraftQuestion = { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" };

export default function QuizManager({
  modules,
  initial,
}: {
  modules: Array<{ id: string; title: string }>;
  initial: QuizList[];
}) {
  const [list, setList] = useState<QuizList[]>(initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftQuiz>({
    title: "",
    moduleId: modules[0]?.id ?? "",
    durationMin: 15,
    passScore: 75,
    questions: [{ ...EMPTY_Q }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQ(i: number, patch: Partial<DraftQuestion>) {
    setDraft((d) => ({ ...d, questions: d.questions.map((q, qi) => (qi === i ? { ...q, ...patch } : q)) }));
  }

  async function save() {
    setError(null);
    const title = draft.title.trim();
    if (!title || !draft.moduleId) {
      setError("Judul kuis dan modul wajib dipilih.");
      return;
    }
    if (!Number.isFinite(draft.durationMin) || draft.durationMin < 5) {
      setError("Durasi kuis minimal 5 menit.");
      return;
    }
    if (!Number.isFinite(draft.passScore) || draft.passScore < 0 || draft.passScore > 100) {
      setError("Nilai lulus harus antara 0 dan 100.");
      return;
    }

    const startedQuestions = draft.questions.filter(
      (q) => q.questionText.trim() || q.options.some((option) => option.trim()) || q.explanation.trim()
    );
    const invalidQuestionIndex = draft.questions.findIndex(
      (q) =>
        (q.questionText.trim() || q.options.some((option) => option.trim()) || q.explanation.trim()) &&
        (!q.questionText.trim() || q.options.filter((option) => option.trim()).length < 2)
    );
    if (invalidQuestionIndex !== -1) {
      setError(`Lengkapi soal ${invalidQuestionIndex + 1} dengan pertanyaan dan minimal 2 opsi jawaban.`);
      return;
    }

    const validQuestions = startedQuestions;
    if (validQuestions.length < 1) {
      setError("Minimal 1 soal lengkap dengan 2 opsi jawaban.");
      return;
    }
    const hasInvalidAnswer = validQuestions.some(
      (q) => !q.options[q.correctAnswer]?.trim()
    );
    if (hasInvalidAnswer) {
      setError("Pilih jawaban benar dari opsi yang sudah diisi pada setiap soal.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          title,
          questions: validQuestions.map((q) => {
            const options = q.options.map((option) => option.trim()).filter(Boolean);
            const correctAnswer = q.options
              .slice(0, q.correctAnswer)
              .filter((option) => option.trim()).length;
            return {
              ...q,
              questionText: q.questionText.trim(),
              options,
              correctAnswer,
              explanation: q.explanation.trim(),
            };
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan kuis");
      const moduleName = modules.find((m) => m.id === draft.moduleId)?.title ?? "-";
      setList((l) => [
        ...l,
        {
          id: data.quiz.id,
          title,
          moduleTitle: moduleName,
          durationMin: draft.durationMin,
          passScore: draft.passScore,
          questionCount: validQuestions.length,
          attemptCount: 0,
        },
      ]);
      setDraft({ title: "", moduleId: modules[0]?.id ?? "", durationMin: 15, passScore: 75, questions: [{ ...EMPTY_Q }] });
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus kuis ini beserta semua nilai siswanya?")) return;
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menghapus kuis.");
      setList((l) => l.filter((q) => q.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Terjadi kesalahan saat menghapus kuis.");
    }
  }

  return (
    <div className="w-full min-w-0 space-y-3">
      {!open ? (
        <PrimaryButton
          icon={Plus}
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto min-h-11 px-6 bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20"
        >
          Buat Kuis Baru
        </PrimaryButton>
      ) : (
        <DoubleBezel>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Susun Kuis Baru</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup form kuis"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <XCircle size={18} />
            </button>
          </div>
          {error && <p className="text-[13px] text-rose-600 font-medium mt-2">{error}</p>}

          <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Judul kuis, mis. Kuis Bab 2 — Kebugaran Jasmani"
              className="w-full min-w-0 sm:col-span-2 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={draft.moduleId}
              onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })}
              className="w-full min-w-0 sm:col-span-2 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  Modul: {m.title}
                </option>
              ))}
            </select>
            <label className="min-w-0 text-[12px] font-semibold text-slate-500">
              Durasi (menit)
              <input
                type="number"
                min={5}
                value={draft.durationMin}
                onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })}
                className="mt-1 block w-full min-w-0 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="min-w-0 text-[12px] font-semibold text-slate-500">
              Nilai lulus
              <input
                type="number"
                min={0}
                max={100}
                value={draft.passScore}
                onChange={(e) => setDraft({ ...draft, passScore: Number(e.target.value) })}
                className="mt-1 block w-full min-w-0 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="mt-5 space-y-3">
            {draft.questions.map((q, qi) => (
              <div key={qi} className="w-full min-w-0 p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Soal {qi + 1}</p>
                  {draft.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, questions: d.questions.filter((_, i) => i !== qi) }))}
                      aria-label={`Hapus soal ${qi + 1}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-rose-700 hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <input
                  value={q.questionText}
                  onChange={(e) => updateQ(qi, { questionText: e.target.value })}
                  placeholder="Tulis pertanyaan..."
                  className="mt-2 block w-full min-w-0 px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQ(qi, { correctAnswer: oi })}
                        title="Tandai sebagai kunci jawaban"
                        aria-label={`Tandai opsi ${String.fromCharCode(65 + oi)} sebagai jawaban benar untuk soal ${qi + 1}`}
                        aria-pressed={q.correctAnswer === oi}
                        className={`min-h-11 min-w-11 shrink-0 rounded-xl text-sm font-extrabold ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 ${
                          q.correctAnswer === oi
                            ? "bg-emerald-700 text-white ring-emerald-700 shadow-sm"
                            : "bg-white text-emerald-800 ring-slate-300 hover:bg-emerald-50 hover:ring-emerald-400"
                        }`}
                      >
                        {q.correctAnswer === oi ? "✓" : String.fromCharCode(65 + oi)}
                      </button>
                      <input
                        value={opt}
                        onChange={(e) => {
                          const options = [...q.options];
                          options[oi] = e.target.value;
                          updateQ(qi, { options });
                        }}
                        placeholder={`Opsi ${String.fromCharCode(65 + oi)}`}
                        className="block w-full min-w-0 flex-1 px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 outline-none text-[13px] focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <input
                  value={q.explanation}
                  onChange={(e) => updateQ(qi, { explanation: e.target.value })}
                  placeholder="Pembahasan singkat (tampil setelah kuis selesai)"
                  className="mt-2 block w-full min-w-0 px-4 py-2 rounded-xl bg-white ring-1 ring-slate-200 outline-none text-[12px] focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, questions: [...d.questions, { ...EMPTY_Q }] }))}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <Plus size={14} className="text-slate-500" />
              <span>Tambah Soal</span>
            </button>
            <PrimaryButton icon={Save} onClick={save} disabled={loading}>
              {loading ? "Mempublikasi..." : "Publikasi Kuis"}
            </PrimaryButton>
          </div>
        </DoubleBezel>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((q) => (
          <div key={q.id} className="glass-shell ring-1 ring-black/5">
            <div className="bezel-core p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge tone="slate">{q.moduleTitle}</Badge>
                <h3 className="mt-2 font-bold text-slate-900 text-sm">{q.title}</h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  {q.questionCount} soal · {q.durationMin} menit · kuis {q.passScore} · {q.attemptCount} dikerjakan
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(q.id)}
                aria-label={`Hapus kuis ${q.title}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-rose-700 hover:bg-rose-50 hover:text-rose-800 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
