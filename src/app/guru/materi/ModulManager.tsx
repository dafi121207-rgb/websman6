"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, Save, Trash2, X, Pencil, FileText, ExternalLink } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton } from "@/components/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type Mod = { id: string; title: string; category: string; description: string; videoUrl: string; pdfUrl: string; order: number; quizCount: number };
const CATEGORIES = ["Bola Besar", "Bola Kecil", "Atletik", "Senam", "Renang", "Kebugaran", "Kesehatan Reproduksi"];
const EMPTY = { title: "", category: CATEGORIES[0], description: "", videoUrl: "", pdfUrl: "" };
const INPUT = "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";

export default function ModulManager({ initial }: { initial: Mod[] }) {
  const [mods, setMods] = useState(initial);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useRef<HTMLFormElement>(null);

  function reset() { setForm(EMPTY); setEditingId(null); setFile(null); setOpen(false); setError(null); }
  function selectFile(value: File | undefined) {
    setError(null);
    setFile(null);
    if (!value) return;
    if (!value.name.toLowerCase().endsWith(".pdf") || (value.type && value.type !== "application/pdf") || value.size === 0 || value.size > 20 * 1024 * 1024) {
      setError("Pilih file PDF dengan ukuran maksimal 20 MB.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setFile(value);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null); setNotice(""); setLoading(true);
    try {
      let pdfUrl = form.pdfUrl;
      if (file) {
        const signature = await file.slice(0, 5).text();
        if (signature !== "%PDF-") throw new Error("File tidak dikenali sebagai PDF. Pilih file PDF yang valid.");
        setProgress("Mengunggah PDF…");
        const uploadResponse = await fetch("/api/ebooks/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: "application/pdf", size: file.size }) });
        const upload = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(upload.error ?? "Gagal menyiapkan unggahan PDF.");
        const { error: uploadError } = await createBrowserSupabaseClient().storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, file, { contentType: "application/pdf", cacheControl: "3600" });
        if (uploadError) throw new Error("PDF gagal diunggah. Periksa koneksi lalu coba lagi.");
        pdfUrl = `storage://${upload.bucket}/${upload.path}`;
        setForm((current) => ({ ...current, pdfUrl }));
        setFile(null);
        if (fileInput.current) fileInput.current.value = "";
      }
      setProgress("Menyimpan modul…");
      const response = await fetch(editingId ? `/api/modules/${editingId}` : "/api/modules", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, pdfUrl }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan modul.");
      const saved = { ...result.module, videoUrl: result.module.videoUrl ?? "", pdfUrl: result.module.pdfUrl ?? "" };
      setMods((current) => editingId ? current.map((module) => module.id === editingId ? { ...module, ...saved } : module) : [...current, { ...saved, quizCount: 0 }]);
      reset();
      setNotice("Modul berhasil disimpan dan tersedia di halaman Modul Belajar.");
    } catch (error) { setError(error instanceof Error ? error.message : "Gagal menyimpan modul."); }
    finally { setLoading(false); setProgress(""); }
  }

  async function remove(module: Mod) {
    if (!confirm(`Hapus “${module.title}”? Kuis, tugas, dan data terkait modul ini juga akan dihapus.`)) return;
    setError(null); setNotice(""); setLoading(true);
    try {
      const response = await fetch(`/api/modules/${module.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal menghapus modul.");
      setMods((current) => current.filter((item) => item.id !== module.id));
      if (editingId === module.id) reset();
      setNotice("Modul dihapus.");
    } catch (error) { setError(error instanceof Error ? error.message : "Gagal menghapus modul."); }
    finally { setLoading(false); }
  }

  return <div className="space-y-4">
    {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {!open ? <PrimaryButton icon={Plus} onClick={() => { setOpen(true); setNotice(""); }}>Buat modul baru</PrimaryButton> : <DoubleBezel>
      <form ref={editor} onSubmit={save}>
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{editingId ? "Edit modul" : "Modul baru"}</h2><button type="button" onClick={reset} disabled={loading} aria-label="Tutup editor modul" className="p-2"><X size={20} /></button></div>
        <p className="mt-1 text-sm text-slate-500">Materi dan e-book yang disimpan dapat dibaca tanpa login.</p>
        <fieldset disabled={loading} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Judul modul<input required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Teknik dasar bola voli" className={INPUT} /></label>
          <label className="text-sm font-semibold">Kategori<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={INPUT}>{[...new Set([...CATEGORIES, form.category])].map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="text-sm font-semibold sm:col-span-2">Isi materi<textarea required rows={8} maxLength={100000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Tuliskan materi. Gunakan baris kosong untuk memisahkan paragraf." className={INPUT} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Tautan video <span className="font-normal text-slate-500">(opsional)</span><input type="url" maxLength={2048} value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." className={INPUT} /><span className="mt-1 block text-xs font-normal text-slate-500">YouTube atau Vimeo dapat ditonton langsung di halaman modul.</span></label>
          <div className="sm:col-span-2 rounded-lg border border-slate-200 p-4"><label className="block text-sm font-semibold">Unggah e-book PDF<input ref={fileInput} type="file" accept="application/pdf,.pdf" onChange={(event) => selectFile(event.target.files?.[0])} className={`${INPUT} file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-blue-700`} /></label><p className="mt-2 text-xs text-slate-500">Maksimal 20 MB. PDF akan diunggah saat modul disimpan.</p>{file && <p className="mt-2 text-sm text-blue-700">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
            {form.pdfUrl && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm"><span className="inline-flex items-center gap-2"><FileText size={16} /> E-book {form.pdfUrl.startsWith("storage://") ? "terunggah" : "tertaut"}</span><div className="flex gap-4">{editingId && <a href={`/modul/${editingId}/ebook`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Buka</a>}<button type="button" className="text-rose-600" onClick={() => { setForm({ ...form, pdfUrl: "" }); setFile(null); if (fileInput.current) fileInput.current.value = ""; }}>Lepaskan e-book</button></div></div>}
            {!form.pdfUrl.startsWith("storage://") && <label className="mt-4 block text-xs font-semibold">Atau gunakan tautan PDF<input type="url" value={form.pdfUrl} disabled={!!file || loading} onChange={(event) => setForm({ ...form, pdfUrl: event.target.value })} placeholder="https://.../materi.pdf" className={INPUT} /></label>}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap gap-3"><button type="submit" disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} />{loading ? progress || "Menyimpan…" : "Simpan modul"}</button><button type="button" disabled={loading} onClick={reset} className="px-4 py-2 text-sm text-slate-600">Batal</button></div><p className="sr-only" role="status">{progress}</p>
      </form>
    </DoubleBezel>}
    <div className="space-y-3">{mods.map((module) => <div key={module.id} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge tone="slate">{module.category}</Badge><Badge tone="slate">{module.quizCount} kuis</Badge>{module.pdfUrl && <Badge tone="blue">E-book PDF</Badge>}</div><h3 className="mt-3 text-base font-bold">{module.title}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-500">{module.description}</p><Link href={`/modul/${module.id}`} target="_blank" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">Lihat halaman publik <ExternalLink size={13} /></Link></div><div className="flex shrink-0 gap-1"><button type="button" disabled={loading} onClick={() => { setEditingId(module.id); setForm({ title: module.title, category: module.category, description: module.description, videoUrl: module.videoUrl, pdfUrl: module.pdfUrl }); setFile(null); if (fileInput.current) fileInput.current.value = ""; setError(null); setNotice(""); setOpen(true); requestAnimationFrame(() => editor.current?.scrollIntoView({ block: "start" })); }} aria-label={`Edit ${module.title}`} className="rounded-lg p-3 text-slate-600 hover:bg-blue-50"><Pencil size={16} /></button><button type="button" disabled={loading} onClick={() => void remove(module)} aria-label={`Hapus ${module.title}`} className="rounded-lg p-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></div></div></div>)}{mods.length === 0 && <p className="py-5 text-sm text-slate-500">Belum ada modul. Buat modul pertama untuk mulai berbagi materi.</p>}</div>
  </div>;
}
