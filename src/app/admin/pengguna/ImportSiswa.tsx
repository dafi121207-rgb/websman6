"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton, SecondaryButton } from "@/components/ui";

type Status = "NEW" | "UPDATE" | "INVALID";

type Row = {
  line: number;
  identifier: string;
  name: string;
  role: string;
  kelas: string | null;
  status: Status;
  errors: string[];
};

type Credential = { identifier: string; name: string; kelas: string | null; password: string };

const STATUS_META: Record<Status, { label: string; tone: "emerald" | "amber" | "rose" }> = {
  NEW: { label: "Baru", tone: "emerald" },
  UPDATE: { label: "Diperbarui", tone: "amber" },
  INVALID: { label: "Bermasalah", tone: "rose" },
};

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(";")
    )
    .join("\n");
  // BOM supaya Excel di Windows membaca UTF-8 dengan benar.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportSiswa() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [kelas, setKelas] = useState("");
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<{ new: number; update: number; invalid: number } | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [done, setDone] = useState<{ created: number; updated: number; failed: number } | null>(null);
  const [failed, setFailed] = useState<{ line: number; errors: string[] }[]>([]);

  function reset() {
    setRows([]);
    setSummary(null);
    setCredentials([]);
    setDone(null);
    setFailed([]);
    setError(null);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function preview() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Pilih file .xlsx terlebih dahulu.");
      return;
    }
    setBusy("preview");
    setError(null);
    setDone(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (kelas.trim()) form.append("kelas", kelas.trim());

      const res = await fetch("/api/users/import/preview", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membaca file");

      setRows(data.rows);
      setSummary(data.summary);
      // Kalau kelas ditebak dari kop file (mis. "KELAS XII - 3"), isi otomatis.
      if (!kelas.trim() && data.guessedKelas) setKelas(data.guessedKelas);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membaca file");
      setRows([]);
      setSummary(null);
    } finally {
      setBusy(null);
    }
  }

  async function commit() {
    const payload = rows
      .filter((r) => r.status !== "INVALID")
      .map((r) => ({
        identifier: r.identifier,
        name: r.name,
        role: r.role,
        kelas: r.kelas,
      }));

    if (!payload.length) return;

    setBusy("commit");
    setError(null);
    try {
      const res = await fetch("/api/users/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan data");

      setDone({
        created: data.created,
        updated: data.updated,
        failed: data.failed?.length ?? 0,
      });
      setFailed(data.failed ?? []);
      setCredentials(data.credentials ?? []);
      setRows([]);
      setSummary(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan data");
    } finally {
      setBusy(null);
    }
  }

  function downloadCredentials() {
    downloadCsv("data-user-siswa.csv", [
      ["NO", "NO. INDUK", "NAMA", "KELAS", "PASSWORD AWAL"],
      ...credentials.map((c, i) => [i + 1, c.identifier, c.name, c.kelas ?? "", c.password]),
    ]);
  }

  const validCount = rows.filter((r) => r.status !== "INVALID").length;

  return (
    <>
      {!open ? (
        <SecondaryButton icon={Upload} onClick={() => setOpen(true)}>
          Import dari Excel
        </SecondaryButton>
      ) : (
        <DoubleBezel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-extrabold">Import Data Siswa dari Excel</h3>
              <p className="text-[12px] text-slate-500 mt-1">
                Format .xlsx. File absensi sekolah boleh langsung dipakai — baris kop dan baris
                rekap diabaikan otomatis.
              </p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                reset();
              }}
              aria-label="Tutup panel import"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <XCircle size={18} />
            </button>
          </div>

          {/* Laporan setelah commit */}
          {done && (
            <div className="mt-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 text-sm">
              <p className="font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} /> Import selesai
              </p>
              <p className="text-emerald-800 mt-1">
                {done.created} akun baru dibuat, {done.updated} diperbarui
                {done.failed > 0 ? `, ${done.failed} baris gagal` : ""}.
              </p>
              {credentials.length > 0 && (
                <div className="mt-3">
                  <SecondaryButton icon={Download} onClick={downloadCredentials}>
                    Unduh {credentials.length} Data User &amp; Password
                  </SecondaryButton>
                  <p className="text-[11px] text-emerald-700 mt-2">
                    Berisi password awal siswa. Bagikan lewat kanal resmi sekolah, jangan lewat
                    WhatsApp kelas, dan hapus file setelah dipakai.
                  </p>
                </div>
              )}
              {failed.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-rose-800 text-[12px]">Baris gagal ({failed.length}):</p>
                  <ul className="mt-1 space-y-0.5 text-[12px] text-rose-700 list-disc pl-5">
                    {failed.map((f, i) => (
                      <li key={i}>Baris {f.line}: {f.errors.join("; ")}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Pemilih file */}
          {!done && (
            <div className="mt-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-[12px] font-semibold text-slate-500">
                  File Excel (.xlsx)
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xlsm"
                    onChange={(e) => {
                      setFileName(e.target.files?.[0]?.name ?? null);
                      setRows([]);
                      setSummary(null);
                    }}
                    className="mt-1 w-full text-sm px-3 py-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-semibold cursor-pointer"
                  />
                </label>
                <label className="text-[12px] font-semibold text-slate-500">
                  Kelas (opsional)
                  <input
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="mis. XII-3 — dikosongkan jika ada di file"
                    className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <PrimaryButton icon={FileSpreadsheet} onClick={preview} disabled={busy !== null || !fileName}>
                  {busy === "preview" ? "Membaca file..." : "Periksa Data"}
                </PrimaryButton>
                <SecondaryButton
                  icon={Download}
                  href="/api/users/import/template"
                >
                  Unduh Template
                </SecondaryButton>
              </div>

              {error && (
                <p className="text-[13px] text-rose-600 font-medium flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-px" />
                  {error}
                </p>
              )}

              {summary && (
                <>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge tone="emerald">{summary.new} akun baru</Badge>
                    <Badge tone="amber">{summary.update} akan diperbarui</Badge>
                    {summary.invalid > 0 && <Badge tone="rose">{summary.invalid} bermasalah</Badge>}
                  </div>

                  <div className="ring-1 ring-slate-200 rounded-2xl overflow-hidden max-h-[26rem] overflow-y-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="text-left">
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Baris</th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Nama</th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">No. Induk</th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Kelas</th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.map((r) => (
                          <tr
                            key={r.line}
                            className={r.status === "INVALID" ? "bg-rose-50/60" : "hover:bg-slate-50/50"}
                          >
                            <td className="px-4 py-2.5 font-mono text-[12px] text-slate-400">{r.line}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-800">
                              {r.name || <span className="text-rose-600">—</span>}
                              {r.status === "INVALID" && (
                                <ul className="mt-1 space-y-0.5 text-[11px] font-normal text-rose-600 list-disc pl-4">
                                  {r.errors.map((e, i) => (
                                    <li key={i}>{e}</li>
                                  ))}
                                </ul>
                              )}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-[12px] text-slate-500">{r.identifier}</td>
                            <td className="px-4 py-2.5 text-slate-600">{r.kelas ?? "—"}</td>
                            <td className="px-4 py-2.5">
                              <Badge tone={STATUS_META[r.status].tone}>{STATUS_META[r.status].label}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <PrimaryButton
                      icon={CheckCircle2}
                      onClick={commit}
                      disabled={busy !== null || validCount === 0}
                    >
                      {busy === "commit" ? "Menyimpan..." : `Simpan ${validCount} Data`}
                    </PrimaryButton>
                    {summary.invalid > 0 && (
                      <p className="text-[12px] text-slate-500">
                        {summary.invalid} baris bermasalah akan dilewati.
                      </p>
                    )}
                    <button
                      onClick={reset}
                      className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </DoubleBezel>
      )}
    </>
  );
}
