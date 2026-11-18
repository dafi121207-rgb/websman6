"use client";

import { useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Send, AlertCircle } from "lucide-react";
import { feedbackLabels } from "@/lib/feedback";

const scale = ["Sangat kurang", "Kurang", "Cukup", "Baik", "Sangat baik"];

export default function FeedbackForm({ initial }: { initial: { ratings: number[]; comment: string } }) {
  const [ratings, setRatings] = useState(initial.ratings);
  const [comment, setComment] = useState(initial.comment);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const successDialog = useRef<HTMLDialogElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const completed = ratings.filter(value => value > 0).length;

  return (
    <form className="mt-8 min-w-0 space-y-8" aria-busy={busy} onSubmit={async event => {
      event.preventDefault(); setBusy(true); setMessage("");
      try {
        const response = await fetch("/api/evaluasi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ratings, comment }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        successDialog.current?.showModal();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Gagal mengirim. Periksa koneksi dan coba lagi.");
      } finally { setBusy(false); }
    }}>
      <section aria-labelledby="rating-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="rating-heading" className="text-lg font-bold text-[#17324d]">Pengalaman menggunakan website</h2>
            <p className="text-sm tabular-nums text-slate-600" aria-live="polite">{completed} dari {feedbackLabels.length} dinilai</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Pilih nilai 1–5 untuk setiap aspek, sesuai pengalamanmu.</p>
        </div>
        <div className="divide-y divide-slate-200 px-5 sm:px-7">
          {feedbackLabels.map((label, index) => (
            <fieldset key={label} disabled={busy} className="w-full min-w-0 py-6 sm:py-7">
              <legend className="float-left mb-4 w-full text-sm font-semibold leading-6 text-slate-900 sm:text-base">{label}</legend>
              <div className="clear-both grid w-full grid-cols-5 gap-2 sm:gap-3">
                {scale.map((description, option) => {
                  const value = option + 1;
                  return (
                    <label key={value} className="relative min-w-0 cursor-pointer">
                      <input className="peer sr-only" type="radio" required name={`rating-${index}`} value={value} checked={ratings[index] === value} aria-label={`${value} — ${description}`} onChange={() => { setRatings(ratings.map((rating, i) => index === i ? value : rating)); setMessage(""); }} />
                      <span className="flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white text-base font-semibold tabular-nums text-slate-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 peer-checked:border-blue-700 peer-checked:bg-blue-700 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-blue-600 peer-disabled:cursor-wait peer-disabled:opacity-60">{value}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between gap-4 text-xs leading-5 text-slate-500"><span>1 · Sangat kurang</span><span className="text-right">5 · Sangat baik</span></div>
            </fieldset>
          ))}
        </div>
      </section>

      <div>
        <label htmlFor="feedback-comment" className="block text-base font-semibold text-slate-900">Saran atau kendala <span className="text-sm font-normal text-slate-500">(opsional)</span></label>
        <textarea id="feedback-comment" disabled={busy} className="mt-3 block min-h-36 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-base font-normal leading-relaxed text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 disabled:opacity-60" rows={4} maxLength={2000} value={comment} onChange={event => {setComment(event.target.value); setMessage("");}} placeholder="Bagian mana yang perlu kami perbaiki?" aria-describedby="comment-count" />
        <p id="comment-count" className="mt-2 text-right text-xs tabular-nums text-slate-500">{comment.length}/2.000 karakter</p>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <p className="max-w-prose text-sm leading-relaxed text-slate-600">Tanggapan hanya dilihat admin/tim pembuat dan tidak memengaruhi nilai. Pengiriman ulang memperbarui tanggapan sebelumnya.</p>
        <button ref={submitButton} type="submit" disabled={busy} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
          {busy ? <LoaderCircle size={17} aria-hidden="true" className="motion-safe:animate-spin" /> : <Send size={17} aria-hidden="true" />}
          {busy ? "Mengirim…" : "Kirim evaluasi"}
        </button>
        {message && <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 p-4 text-sm leading-relaxed text-rose-800"><AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{message}</span></p>}
      </div>
      <dialog
        ref={successDialog}
        aria-labelledby="evaluation-success-title"
        aria-describedby="evaluation-success-description"
        onClose={() => submitButton.current?.focus()}
        className="m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-900 shadow-xl backdrop:bg-slate-950/50 sm:p-8"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={26} aria-hidden="true" /></span>
        <h2 id="evaluation-success-title" className="mt-4 text-xl font-bold tracking-tight text-[#17324d]">Selesai mengisi evaluasi</h2>
        <p id="evaluation-success-description" className="mt-2 text-sm leading-relaxed text-slate-600">Terima kasih! Evaluasimu berhasil disimpan dan sudah bisa dilihat oleh tim pembuat.</p>
        <button type="button" onClick={() => successDialog.current?.close()} className="mt-6 min-h-12 w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Tutup</button>
      </dialog>
    </form>
  );
}
