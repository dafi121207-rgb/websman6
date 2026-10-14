"use client";

import { useState } from "react";
import { Badge, DoubleBezel, statusBadgeTone } from "@/components/ui";

type Sub = {
  id: string;
  status: string;
  score: number | null;
  notes: string | null;
  mediaUrl: string;
  createdAt: string;
  assignmentTitle: string;
  userName: string;
  userKelas: string | null;
};

export default function PenilaianClient({ initial }: { initial: Sub[] }) {
  const [subs, setSubs] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});

  async function grade(sub: Sub, status: "GRADED" | "REJECTED") {
    const score = status === "GRADED" ? Number(scores[sub.id] || "0") : null;
    const res = await fetch(`/api/submissions/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(score !== null && Number.isFinite(score) ? { score } : {}) }),
    });
    if (res.ok) {
      setSubs((ss) => ss.map((x) => (x.id === sub.id ? { ...x, status, score: score ?? null } : x)));
      setExpanded(null);
    }
  }

  if (subs.length === 0) {
    return (
      <DoubleBezel>
        <p className="text-sm text-slate-400">Belum ada tugas praktik yang dikumpulkan siswa.</p>
      </DoubleBezel>
    );
  }

  return (
    <div className="space-y-3">
      {subs.map((s) => {
        const isVideo = /\.(mp4|webm|mov|ogg|avi)$/i.test(s.mediaUrl);
        return (
          <div key={s.id} className="glass-shell ring-1 ring-black/5">
            <div className="bezel-core p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{s.assignmentTitle}</p>
                  <p className="text-[12px] text-slate-500">
                    {s.userName} · {s.userKelas} ·{" "}
                    {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                    {s.notes ? ` · "${s.notes}"` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.status === "GRADED" ? (
                    <Badge tone="emerald">Nilai {s.score}</Badge>
                  ) : s.status === "REJECTED" ? (
                    <Badge tone="rose">Ditolak</Badge>
                  ) : (
                    <Badge tone="amber">Menunggu</Badge>
                  )}
                  <button
                    onClick={() => setExpanded(expanded !== s.id ? s.id : null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:opacity-90"
                  >
                    {expanded === s.id ? "Tutup" : "Periksa"}
                  </button>
                </div>
              </div>

              {expanded === s.id && (
                <div className="mt-3">
                  <div className="rounded-2xl overflow-hidden ring-1 ring-black/10 bg-slate-950/5">
                    {isVideo ? (
                      <video src={s.mediaUrl} controls className="w-full max-h-96" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.mediaUrl} alt={`Bukti ${s.userName}`} className="w-full max-h-96 object-contain" />
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Nilai 0-100"
                      value={scores[s.id] ?? ""}
                      onChange={(e) => setScores((x) => ({ ...x, [s.id]: e.target.value }))}
                      className="w-32 px-3 py-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => grade(s, "GRADED")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[12px] font-bold hover:bg-emerald-500"
                    >
                      Simpan Nilai
                    </button>
                    <button
                      onClick={() => grade(s, "REJECTED")}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white text-[12px] font-bold hover:bg-rose-500"
                    >
                      Tolak/Revisi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
