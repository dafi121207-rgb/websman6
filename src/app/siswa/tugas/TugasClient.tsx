"use client";

import { useRef, useState } from "react";
import { CloudUpload, Info } from "lucide-react";
import { Badge, statusBadgeTone } from "@/components/ui";

type AssignmentDTO = {
  id: string;
  title: string;
  instruction: string;
  dueDate: string;
  moduleTitle: string;
  category: string;
  submission: { status: string; score: number | null; notes: string | null; submittedAt: string } | null;
};

const MAX_FALLBACK_MB = 50;

/** Kompresi foto via canvas (max lebar 1280, JPEG q0.75) — FR-503 client-side compression */
function compressImage(file: File): Promise<{ mime: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 1280;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas tidak tersedia"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve({ mime: "image/jpeg", dataUrl: canvas.toDataURL("image/jpeg", 0.75) });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca foto"));
    };
    img.src = url;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function TugasClient({ assignments }: { assignments: AssignmentDTO[] }) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [progressTask, setProgressTask] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  async function upload(assignment: AssignmentDTO) {
    const input = fileRefs.current[assignment.id];
    const file = input?.files?.[0];
    if (!file) {
      setError("Pilih file terlebih dulu.");
      return;
    }
    setError(null);
    setSuccess(null);
    setProgressTask(assignment.id);

    try {
      let payload: string;
      if (file.type.startsWith("image/")) {
        const compressed = await compressImage(file); // auto-kompresi!
        payload = compressed.dataUrl;
      } else if (file.type.startsWith("video/")) {
        if (file.size > MAX_FALLBACK_MB * 1024 * 1024) {
          throw new Error(`Ukuran video melebihi ${MAX_FALLBACK_MB}MB. Rekam ulang dengan durasi/resolusi lebih ringkas.`);
        }
        payload = await fileToDataUrl(file);
      } else {
        throw new Error("Format tidak didukung. Gunakan foto atau video (mp4/webm/mov).");
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          mediaBase64: payload,
          notes: notesDraft[assignment.id] ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload gagal");
      setSuccess(`Tugas "${assignment.title}" berhasil dikumpulkan! Menunggu penilaian guru.`);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat upload");
    } finally {
      setProgressTask(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 ring-1 ring-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-sm font-medium">
          {success}
        </div>
      )}

      {assignments.map((a) => {
        const overdue = new Date(a.dueDate) < new Date() && !a.submission;
        return (
          <div key={a.id} className="glass-shell ring-1 ring-black/5">
            <div className="bezel-core p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Badge tone="slate">{a.category}</Badge>
                  <h3 className="mt-2 font-bold text-slate-900 leading-snug">{a.title}</h3>
                  <p className="text-[12px] text-slate-400">{a.moduleTitle}</p>
                </div>
                {a.submission ? <Badge tone={statusBadgeTone(a.submission.status)}>{a.submission.status === "GRADED" ? "Nilai: " + a.submission.score : a.submission.status}</Badge> : overdue ? <Badge tone="rose">Terlambat</Badge> : <Badge tone="amber">Belum Dikumpulkan</Badge>}
              </div>

              <div className="mt-3 text-[13px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">Instruksi Tugas</p>
                <p>{a.instruction}</p>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <Info size={13} />
                Tenggat: {new Date(a.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>

              {!a.submission && (
                <div className="mt-4 space-y-2.5">
                  <input
                    type="text"
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [a.id]: e.target.value }))}
                    placeholder="Catatan untuk guru (opsional)... "
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    ref={(el) => {
                      fileRefs.current[a.id] = el;
                    }}
                    className="w-full text-[13px] text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-900 file:text-white file:text-[13px] file:font-semibold file:cursor-pointer cursor-pointer"
                  />
                  <button
                    onClick={() => upload(a)}
                    disabled={progressTask === a.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    <CloudUpload size={15} />
                    <span>{progressTask === a.id ? "Mengunggah..." : "Unggah Tugas"}</span>
                  </button>
                </div>
              )}

              {a.submission && (
                <p className="mt-3 text-[12px] text-slate-400">
                  Dikumpulkan {new Date(a.submission.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long" })} — {a.submission.notes ? `"${a.submission.notes}"` : "tanpa catatan"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
