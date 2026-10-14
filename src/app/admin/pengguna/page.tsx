import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui";
import PenggunaClient from "./PenggunaClient";

export const dynamic = "force-dynamic";

export default async function AdminPengguna() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, identifier: true, name: true, role: true, kelas: true, createdAt: true },
  });

  return (
    <div className="space-y-4">
      <div>
        <Badge tone="slate">User Management</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2">Manajemen Akun Pengguna</h1>
        <p className="text-slate-500 text-sm mt-1">
          Daftarkan siswa (NISN), guru (NIP), dan admin. Semua password disimpan sebagai hash bcrypt.
        </p>
      </div>
      <PenggunaClient
        initial={users.map((u) => ({
          id: u.id,
          identifier: u.identifier,
          name: u.name,
          role: u.role,
          kelas: u.kelas,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
