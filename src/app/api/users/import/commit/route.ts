import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { generatePassword, validateRow } from "@/lib/import-users";

export const runtime = "nodejs";

const MAX_ROWS = 2000;

type IncomingRow = {
  identifier?: string;
  name?: string;
  role?: string;
  kelas?: string | null;
  email?: string | null;
  gender?: string | null;
  password?: string | null;
};

/**
 * POST /api/users/import/commit
 * body: { rows: IncomingRow[] }
 *
 * Validasi ULANG di server — hasil preview dari client tidak dipercaya.
 * Password yang dikosongkan dibuat otomatis dan dikembalikan di
 * `credentials` supaya admin bisa mengunduh daftar untuk dibagikan.
 */
export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });
  }

  let body: { rows?: IncomingRow[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const incoming = Array.isArray(body.rows) ? body.rows : [];
  if (incoming.length === 0) {
    return NextResponse.json({ error: "Tidak ada baris untuk disimpan" }, { status: 400 });
  }
  if (incoming.length > MAX_ROWS) {
    return NextResponse.json({ error: `Jumlah baris melebihi batas ${MAX_ROWS}` }, { status: 400 });
  }

  // 1. Validasi ulang + deteksi duplikat di dalam payload.
  const seen = new Map<string, number>();
  const prepared: { data: ReturnType<typeof validateRow>["row"]; password: string }[] = [];
  const failed: { line: number; errors: string[] }[] = [];

  incoming.forEach((raw, i) => {
    const { row, errors } = validateRow({
      line: i + 1,
      identifier: String(raw.identifier ?? ""),
      name: String(raw.name ?? ""),
      role: String(raw.role ?? "SISWA"),
      kelas: raw.kelas ?? null,
      email: raw.email ?? null,
      gender: raw.gender ?? null,
      password: raw.password ?? null,
    });

    if (!errors.length) {
      const first = seen.get(row.identifier);
      if (first !== undefined) {
        errors.push(`Nomor induk ${row.identifier} muncul dua kali dalam permintaan`);
      } else {
        seen.set(row.identifier, i + 1);
      }
    }

    if (errors.length) {
      failed.push({ line: i + 1, errors });
      return;
    }
    // Password dari file dipakai apa adanya; kosongkan -> acak.
    prepared.push({ data: row, password: row.password || generatePassword() });
  });

  if (!prepared.length) {
    return NextResponse.json(
      { created: 0, updated: 0, failed, credentials: [] },
      { status: 400 }
    );
  }

  // 2. Hash password (async, paralel) — bcrypt sync 37x ≈ 3 detik.
  const hashed = await Promise.all(
    prepared.map(async (p) => ({ ...p, hash: await bcrypt.hash(p.password, 10) }))
  );

  // 3. Simpan dalam satu transaksi supaya tidak ada keadaan setengah jadi.
  let created = 0;
  let updated = 0;
  const credentials: { identifier: string; name: string; kelas: string | null; password: string }[] = [];

  try {
    await prisma.$transaction(
      async (tx) => {
        const existing = await tx.user.findMany({
          where: { identifier: { in: hashed.map((h) => h.data.identifier) } },
          select: { identifier: true },
        });
        const inDb = new Set(existing.map((u) => u.identifier));

        const toCreate: {
          identifier: string;
          name: string;
          password: string;
          role: string;
          kelas: string | null;
          email: string | null;
        }[] = [];

        for (const { data, password, hash } of hashed) {
          const already = inDb.has(data.identifier);
          if (already) {
            await tx.user.update({
              where: { identifier: data.identifier },
              data: {
                name: data.name,
                role: data.role,
                kelas: data.kelas,
                ...(data.email ? { email: data.email } : {}),
              },
            });
            updated += 1;
          } else {
            toCreate.push({
              identifier: data.identifier,
              name: data.name,
              password: hash,
              role: data.role,
              kelas: data.kelas,
              email: data.email,
            });
            credentials.push({
              identifier: data.identifier,
              name: data.name,
              kelas: data.kelas,
              password,
            });
          }
        }

        if (toCreate.length > 0) {
          const res = await tx.user.createMany({ data: toCreate });
          created = res.count;
        }
      },
      { maxWait: 10000, timeout: 60000 }
    );
  } catch (e) {
    console.error("[import/commit] gagal:", e);
    return NextResponse.json(
      { error: "Penyimpanan gagal, tidak ada data yang berubah. Coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json({ created, updated, failed, credentials });
}
