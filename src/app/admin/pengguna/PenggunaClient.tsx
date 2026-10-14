"use client";

import { useState } from "react";
import { Plus, Save, Trash2, XCircle } from "lucide-react";
import { Badge, DoubleBezel, PrimaryButton } from "@/components/ui";
import ImportSiswa from "./ImportSiswa";

type U = { id: string; identifier: string; name: string; role: string; kelas: string | null; createdAt: string };

const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", GURU: "Guru PJOK", SISWA: "Siswa" };

export default function PenggunaClient({ initial }: { initial: U[] }) {
  const [users, setUsers] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ identifier: "", name: "", role: "SISWA", kelas: "X-1", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat akun");
      setUsers((us) => [
        ...us,
        {
          id: data.user.id,
          identifier: data.user.identifier,
          name: data.user.name,
          role: data.user.role,
          kelas: data.user.kelas,
          createdAt: new Date().toISOString(),
        },
      ]);
      setForm({ identifier: "", name: "", role: "SISWA", kelas: "X-1", password: "" });
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus akun ini? Data presensi/nilai terkait ikut terhapus.")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Gagal menghapus");
      return;
    }
    setUsers((us) => us.filter((u) => u.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <PrimaryButton icon={Plus} onClick={() => setOpen(true)}>
          Tambah Akun
        </PrimaryButton>
        <ImportSiswa />
      </div>
      {open && (
        <DoubleBezel>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Akun Baru</h3>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <XCircle size={18} />
            </button>
          </div>
          {error && <p className="text-[13px] text-rose-600 font-medium mt-2">{error}</p>}
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <label className="text-[12px] font-semibold text-slate-500 sm:col-span-2">
              NISN / NIP / Username
              <input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="text-[12px] font-semibold text-slate-500 sm:col-span-2">
              Nama Lengkap
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="text-[12px] font-semibold text-slate-500">
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500">
                <option value="SISWA">Siswa</option>
                <option value="GURU">Guru PJOK</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            {form.role === "SISWA" && (
              <label className="text-[12px] font-semibold text-slate-500">
                Kelas
                <input value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} placeholder="mis. X-1" className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
              </label>
            )}
            <label className="text-[12px] font-semibold text-slate-500">
              Password Awal
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500" />
            </label>
          </div>
          <div className="mt-4">
            <PrimaryButton icon={Save} onClick={create} disabled={saving || !form.identifier || !form.name || !form.password}>
              {saving ? "Menyimpan..." : "Simpan Akun"}
            </PrimaryButton>
          </div>
        </DoubleBezel>
      )}

      <div className="glass-shell ring-1 ring-black/5">
        <div className="bezel-core p-0! overflow-x-auto rounded-[1.5rem]">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Nama</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Identitas</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Role</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-14"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {u.name}
                    {u.kelas && <span className="text-slate-400 font-normal"> · {u.kelas}</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-500">{u.identifier}</td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role === "ADMIN" ? "rose" : u.role === "GURU" ? "blue" : "emerald"}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove(u.id)}
                      aria-label={`Hapus akun ${u.name}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-rose-700 hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
