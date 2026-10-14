"use client";

import { useState } from "react";
import { Plus, Save, Trash2, XCircle, Pencil } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton } from "@/components/ui";

type Mod = {
  id: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string;
  order: number;
  quizCount: number;
};

const CATEGORIES = ["Bola Besar", "Bola Kecil", "Atletik", "Senam", "Renang", "Kebugaran", "Kesehatan Reproduksi"];

const EMPTY = { title: "", category: CATEGORIES[0], description: "", videoUrl: "" };

export default function ModulManager({ initial }: { initial: Mod[] }) {
  const [mods, setMods] = useState<Mod[]>(initial);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function save() {
    setError(null);
    setLoading(true);
    try {
      const url = editingId ? `/api/modules/${editingId}` : "/api/modules";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      if (editingId) {
        setMods((ms) => ms.map((m) => (m.id === editingId ? { ...m, ...form } : m)));
      } else {
        setMods((ms) => [...ms, { ...data.module, videoUrl: data.module.videoUrl ?? "", quizCount: 0 }]);
      }
      setForm(EMPTY);
      setEditingId(null);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus modul ini? Kuis terkait juga ikut terhapus.")) return;
    await fetch(`/api/modules/${id}`, { method: "DELETE" });
    setMods((ms) => ms.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <PrimaryButton icon={Plus} onClick={() => setOpen(true)}>
          Buat Modul Baru
        </PrimaryButton>
      ) : (
        <DoubleBezel>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">{editingId ? "Edit Modul" : "Modul Baru"}</h3>
            <button onClick={() => { setOpen(false); setEditingId(null); setForm(EMPTY); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <XCircle size={18} />
            </button>
          </div>
          {error && <p className="text-[13px] text-rose-600 font-medium mt-2">{error}</p>}
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="mis. Bab 3: Servis Bola Voli" className="px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi bab materi..."
              rows={4}
              className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="URL embed video (https://www.youtube.com/embed/...)" className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 font-mono text-xs" />
          </div>
          <div className="mt-4">
            <PrimaryButton icon={Save} onClick={save} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Modul"}
            </PrimaryButton>
          </div>
        </DoubleBezel>
      )}

      <div className="space-y-2.5">
        {mods.map((m) => (
          <div key={m.id} className="glass-shell ring-1 ring-black/5">
            <div className="bezel-core p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 text-[12px] font-extrabold flex items-center justify-center">{m.order}</span>
                  <Badge tone="slate">{m.category}</Badge>
                  <Badge tone={m.quizCount > 0 ? "emerald" : "slate"}>{m.quizCount} kuis</Badge>
                </div>
                <h3 className="mt-2 font-bold text-slate-900 text-sm">{m.title}</h3>
                <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-2">{m.description}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => { setEditingId(m.id); setForm({ title: m.title, category: m.category, description: m.description, videoUrl: m.videoUrl }); setOpen(true); }}
                  className="p-2 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(m.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Hapus">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
