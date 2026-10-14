"use client";

import { useState } from "react";
import { Plus, Save, Trash2, XCircle, Eye, EyeOff } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton, statusBadgeTone } from "@/components/ui";

type News = { id: string; title: string; content: string; published: boolean; createdAt: string };

const EMPTY = { title: "", content: "", published: true };

export default function BeritaClient({ initial }: { initial: News[] }) {
  const [news, setNews] = useState(initial);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat berita");
      setNews((ns) => [
        { id: data.news.id, title: data.news.title, content: data.news.content, published: data.news.published, createdAt: data.news.createdAt },
        ...ns,
      ]);
      setForm(EMPTY);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(n: News) {
    const res = await fetch(`/api/news/${n.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: n.title, content: n.content, published: !n.published }),
    });
    if (res.ok) setNews((ns) => ns.map((x) => (x.id === n.id ? { ...x, published: !n.published } : x)));
  }

  async function remove(id: string) {
    if (!confirm("Hapus berita ini?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    setNews((ns) => ns.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <PrimaryButton icon={Plus} onClick={() => setOpen(true)}>
          Tulis Berita Baru
        </PrimaryButton>
      ) : (
        <DoubleBezel>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Berita Baru</h3>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <XCircle size={18} />
            </button>
          </div>
          {error && <p className="text-[13px] text-rose-600 font-medium mt-2">{error}</p>}
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Judul berita/pengumuman..."
            className="mt-3 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
            placeholder="Isi berita..."
            className="mt-2 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
          />
          <label className="mt-2 flex items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded"
            />
            Publikasikan langsung
          </label>
          <div className="mt-4">
            <PrimaryButton icon={Save} onClick={create} disabled={saving || !form.title || !form.content}>
              {saving ? "Memproses..." : "Publikasi"}
            </PrimaryButton>
          </div>
        </DoubleBezel>
      )}

      <div className="space-y-2.5">
        {news.map((n) => (
          <div key={n.id} className="glass-shell ring-1 ring-black/5">
            <div className="bezel-core p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone={statusBadgeTone(n.published ? "GRADED" : "PENDING")}>
                    {n.published ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <h3 className="mt-2 font-bold text-slate-900 text-sm">{n.title}</h3>
                <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-2">{n.content}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => togglePublish(n)}
                  className="p-2 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                  title={n.published ? "Jadikan draft" : "Publikasikan"}
                >
                  {n.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => remove(n.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600">
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
