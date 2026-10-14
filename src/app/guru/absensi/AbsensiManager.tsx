"use client";

import { useState } from "react";
import { Check, CheckCircle2, Clock, MapPin, Plus, UserCheck, Users, X } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton, statusBadgeTone } from "@/components/ui";

type StudentDTO = {
  id: string;
  name: string;
  identifier: string;
  kelas: string | null;
};

type Attd = {
  id: string;
  userId: string;
  status: string;
  userLat: number | null;
  userLng: number | null;
  photoProof: string | null;
  createdAt: string;
  userName: string;
  userKelas: string | null;
  userIdentifier?: string;
};

type SessionDTO = {
  id: string;
  title: string;
  kelas: string;
  isOpen: boolean;
  date: string;
  targetLat: number | null;
  targetLng: number | null;
  maxRadiusMeters: number;
  attendances: Attd[];
};

export default function AbsensiManager({
  initialSessions,
  students,
}: {
  initialSessions: SessionDTO[];
  students: StudentDTO[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ title: "", kelas: "X-1" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(initialSessions[0]?.id ?? null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  async function create() {
    if (!form.title.trim()) {
      setError("Judul sesi presensi wajib diisi");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          kelas: form.kelas,
          isOpen: true,
          maxRadiusMeters: 100, // automatic background default
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat sesi");

      setSessions((ss) => [
        {
          id: data.session.id,
          title: data.session.title,
          kelas: data.session.kelas,
          isOpen: data.session.isOpen,
          date: data.session.date,
          targetLat: data.session.targetLat,
          targetLng: data.session.targetLng,
          maxRadiusMeters: data.session.maxRadiusMeters,
          attendances: [],
        },
        ...ss,
      ]);
      setForm({ title: "", kelas: "X-1" });
      setOpenModal(false);
      setExpanded(data.session.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error membuat sesi");
    } finally {
      setLoading(false);
    }
  }

  async function toggleOpen(s: SessionDTO) {
    const res = await fetch(`/api/attendance/sessions/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !s.isOpen }),
    });
    if (res.ok) {
      setSessions((ss) => ss.map((x) => (x.id === s.id ? { ...x, isOpen: !s.isOpen } : x)));
    }
  }

  async function setStudentStatus(sessionId: string, userId: string, status: string) {
    setUpdatingUser(`${sessionId}-${userId}`);
    try {
      const res = await fetch("/api/attendance/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId, status }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSessions((prev) =>
          prev.map((sess) => {
            if (sess.id !== sessionId) return sess;

            const existingIndex = sess.attendances.findIndex((a) => a.userId === userId);
            let updatedList = [...sess.attendances];

            if (status === "UNCHECK") {
              updatedList = updatedList.filter((a) => a.userId !== userId);
            } else if (existingIndex >= 0) {
              updatedList[existingIndex] = {
                ...updatedList[existingIndex],
                status,
              };
            } else {
              const studentObj = students.find((st) => st.id === userId);
              updatedList.push({
                id: data.attendance.id,
                userId,
                status,
                userLat: null,
                userLng: null,
                photoProof: null,
                createdAt: new Date().toISOString(),
                userName: studentObj?.name ?? "Siswa",
                userKelas: studentObj?.kelas ?? sess.kelas,
                userIdentifier: studentObj?.identifier,
              });
            }
            return { ...sess, attendances: updatedList };
          })
        );
      }
    } catch (err) {
      console.error("Gagal update presensi manual", err);
    } finally {
      setUpdatingUser(null);
    }
  }

  async function markAllHadir(session: SessionDTO, classStudents: StudentDTO[]) {
    for (const st of classStudents) {
      const att = session.attendances.find((a) => a.userId === st.id);
      if (!att || att.status !== "HADIR") {
        await setStudentStatus(session.id, st.id, "HADIR");
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      {!openModal ? (
        <PrimaryButton icon={Plus} onClick={() => setOpenModal(true)}>
          Buat Sesi Absensi Baru
        </PrimaryButton>
      ) : (
        <DoubleBezel>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Buka Sesi Presensi Baru</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih kelas dan masukkan agenda materi latihan hari ini.
              </p>
            </div>
            <button
              onClick={() => setOpenModal(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {error && <p className="text-[13px] text-rose-600 font-medium mt-3">{error}</p>}

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Judul / Materi Pertemuan</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="mis. Presensi Praktik Atletik Lari 100m"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Target Kelas</label>
              <input
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                placeholder="mis. X-1"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <PrimaryButton onClick={create} disabled={loading}>
              {loading ? "Menyimpan..." : "Aktifkan Sesi Sekarang"}
            </PrimaryButton>
          </div>
        </DoubleBezel>
      )}

      {/* Sesi List */}
      <div className="space-y-3.5">
        {sessions.length === 0 && (
          <DoubleBezel>
            <p className="text-sm text-slate-500 text-center py-6">
              Belum ada sesi presensi yang dibuka. Klik tombol &ldquo;Buat Sesi Absensi Baru&rdquo; di atas.
            </p>
          </DoubleBezel>
        )}

        {sessions.map((s) => {
          const isExpanded = expanded === s.id;
          // Filter students for this class
          const classStudents = students.filter(
            (st) => !st.kelas || st.kelas.toUpperCase() === s.kelas.toUpperCase()
          );
          const attendedCount = s.attendances.filter((a) => a.status === "HADIR").length;

          return (
            <div key={s.id} className="glass-shell ring-1 ring-black/5 bg-white/70 shadow-sm transition">
              <div className="bezel-core p-5 bg-white/95">
                {/* Header Sesi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-200">
                        Kelas {s.kelas}
                      </span>
                      <p className="font-extrabold text-slate-900 text-base leading-snug truncate">{s.title}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock size={13} />
                      {new Date(s.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={s.isOpen ? "emerald" : "slate"}>
                      {s.isOpen ? "Sesi Dibuka" : "Ditutup"}
                    </Badge>
                    <button
                      onClick={() => toggleOpen(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        s.isOpen
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {s.isOpen ? "Tutup Sesi" : "Buka Sesi"}
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : s.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Users size={13} />
                      <span>{attendedCount} / {classStudents.length || s.attendances.length} Hadir</span>
                    </button>
                  </div>
                </div>

                {/* Expanded: Manual Checklist + Student Management */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
                    {/* Control Banner */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 ring-1 ring-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <UserCheck size={15} className="text-blue-600" /> Kontrol Presensi Guru Langsung
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tandai kehadiran siswa secara langsung di sini tanpa harus membuka HP di tengah lapangan.
                        </p>
                      </div>
                      <button
                        onClick={() => markAllHadir(s, classStudents)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={14} /> Tandai Semua Hadir
                      </button>
                    </div>

                    {/* Students List with Checkboxes/Status Badges */}
                    <div className="divide-y divide-slate-100">
                      {classStudents.length === 0 && (
                        <p className="py-4 text-xs text-slate-400 text-center">
                          Tidak ada siswa yang terdaftar di kelas {s.kelas}.
                        </p>
                      )}

                      {classStudents.map((st) => {
                        const att = s.attendances.find((a) => a.userId === st.id);
                        const currentStatus = att?.status ?? "BELUM";
                        const isUpdating = updatingUser === `${s.id}-${st.id}`;

                        return (
                          <div
                            key={st.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/50 px-2 rounded-xl transition"
                          >
                            <div className="flex items-center gap-3">
                              {/* Quick Hadir Toggle Checkbox */}
                              <button
                                disabled={isUpdating}
                                onClick={() =>
                                  setStudentStatus(s.id, st.id, currentStatus === "HADIR" ? "UNCHECK" : "HADIR")
                                }
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                  currentStatus === "HADIR"
                                    ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-400 ring-1 ring-slate-200"
                                }`}
                                title="Klik untuk cepat tandai Hadir"
                              >
                                {currentStatus === "HADIR" ? <Check size={16} /> : <span className="text-xs">○</span>}
                              </button>

                              <div>
                                <p className="text-sm font-bold text-slate-800 leading-snug">{st.name}</p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  NISN: {st.identifier}
                                  {att?.createdAt && (
                                    <span>
                                      {" "}· Dicatat:{" "}
                                      {new Date(att.createdAt).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Status Selector Pills */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center">
                              {att?.photoProof && (
                                <a
                                  href={att.photoProof}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-blue-600 font-semibold underline mr-1"
                                >
                                  Foto Selfie
                                </a>
                              )}
                              {(["HADIR", "IZIN", "SAKIT", "ALPA"] as const).map((stat) => (
                                <button
                                  key={stat}
                                  disabled={isUpdating}
                                  onClick={() => setStudentStatus(s.id, st.id, stat)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    currentStatus === stat
                                      ? stat === "HADIR"
                                        ? "bg-emerald-600 text-white"
                                        : stat === "IZIN"
                                        ? "bg-amber-600 text-white"
                                        : stat === "SAKIT"
                                        ? "bg-blue-600 text-white"
                                        : "bg-rose-600 text-white"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {stat}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
