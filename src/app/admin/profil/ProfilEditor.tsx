"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { DoubleBezel, PrimaryButton } from "@/components/ui";

export default function ProfilEditor({
  initial,
}: {
  initial: {
    title: string;
    tagline: string;
    email: string;
    phone: string;
    welcomeText: string;
    vision: string;
    mission: string[];
  };
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menyimpan profil");
      }
      setMsg("✅ Profil sekolah berhasil diperbarui!");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DoubleBezel>
      {msg && <p className="text-[13px] font-semibold text-slate-700 mb-3">{msg}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-[12px] font-semibold text-slate-500">
          Nama Sekolah
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="text-[12px] font-semibold text-slate-500">
          Tagline
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="text-[12px] font-semibold text-slate-500">
          Email Resmi
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="text-[12px] font-semibold text-slate-500">
          Telepon
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="text-[12px] font-semibold text-slate-500 sm:col-span-2">
          Visi Sekolah
          <input value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="text-[12px] font-semibold text-slate-500 sm:col-span-2">
          Sambutan Kepala Sekolah
          <textarea
            value={form.welcomeText}
            onChange={(e) => setForm({ ...form, welcomeText: e.target.value })}
            rows={4}
            className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-[12px] font-semibold text-slate-500">6 Poin Misi</p>
        <div className="mt-2 space-y-2">
          {form.mission.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-8 h-8 shrink-0 rounded-xl bg-blue-100 text-blue-700 text-[12px] font-extrabold flex items-center justify-center">{i + 1}</span>
              <textarea
                value={m}
                onChange={(e) => {
                  const mission = [...form.mission];
                  mission[i] = e.target.value;
                  setForm({ ...form, mission });
                }}
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-[13px] focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setForm({ ...form, mission: form.mission.filter((_, x) => x !== i) })}
                className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                title="Hapus poin"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button
            onClick={() => setForm({ ...form, mission: [...form.mission, ""] })}
            className="pjok-btn bg-slate-100"
          >
            <span className="pjok-btn-inner bg-slate-100! text-slate-700 ring-1 ring-black/5">
              <Plus size={14} className="fly-icon" /> Tambah Poin Misi
            </span>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <PrimaryButton icon={Save} onClick={save} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Profil"}
        </PrimaryButton>
      </div>
    </DoubleBezel>
  );
}
