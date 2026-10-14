import { randomInt } from "node:crypto";
import type { Cell, Row, Worksheet } from "exceljs";
import prisma from "@/lib/prisma";

/**
 * Parser & validator untuk import data siswa dari Excel.
 *
 * File absensi sekolah umumnya BUKAN tabel rapi: ada kop surat, judul,
 * kop sekolah, baris kosong, header di tengah, lalu baris rekap
 * ("Laki-laki 22", "Jumlah 37") di bawah. Jadi parser di sini mencari
 * baris header secara heuristik dan berhenti di baris rekap.
 */

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_ROWS = 2000;

export type ImportStatus = "NEW" | "UPDATE" | "INVALID";

export type ImportRow = {
  line: number;
  identifier: string;
  name: string;
  role: string;
  kelas: string | null;
  email: string | null;
  gender: string | null;
  password: string | null;
  status: ImportStatus;
  errors: string[];
};

export type ParsedSheet = {
  headerLine: number;
  kelas: string | null;
  rows: Omit<ImportRow, "status" | "errors">[];
};

/** Header aliases. Urutan penting: pola paling spesifik dulu. */
const HEADER_PATTERNS: { field: string; patterns: RegExp }[] = [
  { field: "identifier", patterns: /(no\.?\s*induk|n.?\.?\s*induk|nisn|nip|identifier|nomor\s*(induk|peserta|uji)|absen)/i },
  { field: "name", patterns: /^(nama|nama\s*(lengkap|siswa|peserta\s*didik)?)$/i },
  { field: "email", patterns: /e-?mail/i },
  { field: "kelas", patterns: /(kelas|rombel|kelompok|klq)/i },
  { field: "gender", patterns: /(l\s*\/\s*p|jenis\s*kelamin|gender|panggilan)/i },
  { field: "password", patterns: /(password|sandi|pin)/i },
  { field: "role", patterns: /^(role|peran|jabatan)$/i },
];

const STOP_ROW = /^(jumlah|total|subtotal|rekap|daftarkan|grand\s*total)/i;

const ROLES = ["ADMIN", "GURU", "SISWA"];

/** Huruf/karakter yang ambigu dan sering tertukar saat dibaca dari kertas. */
const PASSWORD_LOWER = "abcdefghijkmnopqrstuvwxyz";
const PASSWORD_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PASSWORD_DIGIT = "23456789";

export function generatePassword(length = 8): string {
  const lower = PASSWORD_LOWER;
  const upper = PASSWORD_UPPER;
  const digit = PASSWORD_DIGIT;
  const all = lower + upper + digit;
  // Pastikan minimal satu huruf besar, satu huruf kecil, dan satu angka.
  const chars = [
    lower[randomInt(lower.length)],
    upper[randomInt(upper.length)],
    digit[randomInt(digit.length)],
  ];
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  // Fisher-Yates dengan randomInt (crypto) supaya tidak bias.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/**
 * Ambil teks sel. Untuk sel numerik kita baca `.value` lalu `.text`
 * sebagai fallback, supaya NISN panjang tidak berubah jadi notasi
 ilmiah atau acquirement "0.00" dari format sel bawaan Excel.
 */
function cellToString(cell: Cell | undefined): string {
  if (!cell) return "";
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "number") {
    // 242510076 -> "242510076" (bukan "242510076.00")
    return Number.isInteger(v) ? String(v) : String(v);
  }
  if (typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("text" in v && typeof (v as { text?: unknown }).text === "string") {
      return (v as { text: string }).text;
    }
    if ("result" in v) return String((v as { result: unknown }).result ?? "");
    if ("richText" in v) {
      return ((v as { richText: { text: string }[] }).richText ?? [])
        .map((r) => r.text)
        .join("");
    }
    if ("hyperlink" in v) return String((v as { hyperlink: string }).hyperlink);
    return "";
  }
  return String(v);
}

/** Buang spasi ganda, trim, dan normalisasi spasi di dalam nama. */
function tidy(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Nomor inducted bisa tersimpan sebagai "242510076" atau "242510076.0". */
function tidyIdentifier(s: string): string {
  return s.replace(/\.0+$/, "").replace(/\s+/g, "").trim();
}

function rowValues(row: Row, maxCol: number): string[] {
  const out: string[] = [];
  for (let c = 1; c <= maxCol; c++) {
    out.push(tidy(cellToString(row.getCell(c))));
  }
  return out;
}

function maxColumn(sheet: Worksheet): number {
  let max = 0;
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const n = row.cellCount ?? row.actualCellCount ?? 0;
    if (n > max) max = n;
  });
  return max;
}

/**
 * Cari baris header: baris yang memuat minimal kolom identitas + nama,
 * dalam toleransi 30 baris pertama.
 */
function findHeader(
  sheet: Worksheet,
  maxCol: number
): { line: number; map: Record<string, number> } | null {
  const limit = Math.min(sheet.rowCount, 30);
  for (let r = 1; r <= limit; r++) {
    const values = rowValues(sheet.getRow(r), maxCol);
    const map: Record<string, number> = {};
    values.forEach((v, idx) => {
      if (!v) return;
      for (const { field, patterns } of HEADER_PATTERNS) {
        if (map[field] !== undefined) continue;
        if (patterns.test(v)) map[field] = idx;
      }
    });
    if (map.identifier !== undefined && map.name !== undefined) {
      return { line: r, map };
    }
  }
  return null;
}

/**
 * Tebakan kelas dari teks kop (mis. "KELAS XII - 3") supaya user tidak
 * harus mengisi kelas manual kalau file absensi sudah menyebutkannya.
 */
function guessKelas(sheet: Worksheet, headerLine: number): string | null {
  const limit = Math.min(headerLine - 1, 20);
  for (let r = 1; r <= limit; r++) {
    for (const cell of sheet.getRow(r).values as unknown[]) {
      const text = typeof cell === "string" ? cell : "";
      const m = text.match(/kelas\s+([A-Z]{1,3}\s*[- ]?\s*\d{1,2})/i);
      if (m) {
        return m[1].toUpperCase().replace(/\s+/g, "").replace(/([A-Z]+)(\d)/, "$1-$2");
      }
    }
  }
  return null;
}

function normalizeRole(raw: string): string | null {
  const v = raw.trim().toUpperCase();
  if (!v) return "SISWA";
  if (ROLES.includes(v)) return v;
  if (/ADMIN|ADMINISTRATOR|ADMINISTRASI/.test(v)) return "ADMIN";
  if (/GURU|TEACHER|INSTRUKTUR|URU|HEADERS|PJOK/.test(v)) return "GURU";
  if (/SISWA|STUDENT|PD|MURID/.test(v)) return "SISWA";
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validasi per baris, tanpa menyentuh database. */
export function validateRow(
  input: {
    line: number;
    identifier: string;
    name: string;
    role: string;
    kelas: string | null;
    email: string | null;
    gender: string | null;
    password: string | null;
  }
): { row: Omit<ImportRow, "status" | "errors">; errors: string[] } {
  const errors: string[] = [];
  const identifier = tidyIdentifier(input.identifier);
  const name = tidy(input.name);

  if (!identifier) errors.push("Nomor induk/NISN kosong");
  else if (identifier.length > 32) errors.push("Nomor induk/NISN terlalu panjang (maks 32 karakter)");

  if (!name) errors.push("Nama kosong");
  else if (name.length > 120) errors.push("Nama terlalu panjang (maks 120 karakter)");

  const role = normalizeRole(input.role);
  if (!role) errors.push(`Role "${input.role}" tidak dikenal`);

  const email = input.email?.trim() || null;
  if (email && !EMAIL_RE.test(email)) errors.push(`Format email tidak valid: ${email}`);

  const kelas = input.kelas?.trim() || null;
  if (role === "SISWA" && !kelas) errors.push("Kelas wajib diisi untuk siswa");

  return {
    row: {
      line: input.line,
      identifier,
      name,
      role: role ?? "SISWA",
      kelas,
      email,
      gender: input.gender?.trim() || null,
      password: input.password?.trim() || null,
    },
    errors,
  };
}

/**
 * Baca worksheet menjadi baris mentah. `fallbackKelas` dipakai kalau
 * file tidak punya kolom kelas maupun kelas bisa ditebak dari kop.
 */
export function parseSheet(sheet: Worksheet, fallbackKelas?: string | null): ParsedSheet {
  const maxCol = maxColumn(sheet);
  const header = findHeader(sheet, maxCol);
  if (!header) {
    throw new Error(
      "Baris header tidak ditemukan. Pastikan file memiliki kolom Nomor Induk/NISN dan Nama."
    );
  }

  const sheetKelas = guessKelas(sheet, header.line);
  const defaultKelas = sheetKelas ?? fallbackKelas ?? null;

  const rows: Omit<ImportRow, "status" | "errors">[] = [];
  const { line: headerLine, map } = header;

  // Teks header asli, untuk menyingkirkan baris lanjutan merged cell.
  // Header yang di-merge vertikal (mis. "NO. INDUK" di baris 12–13) akan
  // terbaca lagi di baris 13 dan salah dianggap sebagai data.
  const headerRowValues = rowValues(sheet.getRow(headerLine), maxCol);
  const headerTexts = new Set(
    Object.values(map)
      .map((idx) => headerRowValues[idx])
      .filter((v): v is string => Boolean(v))
  );

  for (let r = headerLine + 1; r <= sheet.rowCount; r++) {
    const values = rowValues(sheet.getRow(r), maxCol);
    if (values.every((v) => v === "")) continue;

    // Baris rekap/total sering tidak ada di kolom pertama, melainkan di
    // kolom label ("Jumlah", "Laki-laki", "Total"), jadi periksa 3 kolom awal.
    if (STOP_ROW.test(values.slice(0, 3).filter(Boolean).join(" "))) break;

    const identifier = map.identifier !== undefined ? values[map.identifier] : "";
    const name = map.name !== undefined ? values[map.name] : "";

    // Baris tanpa identitas dan tanpa nama = noise (mis. "Bulan: ...").
    if (!identifier && !name) continue;

    // Baris yang mengulang teks header = lanjutan merged cell, bukan data.
    if (identifier && headerTexts.has(identifier)) continue;
    if (name && headerTexts.has(name)) continue;

    // Di daftar roster setiap siswa selalu punya nomor induk. Jadi begitu
    // ketemu baris tanpa nomor induk SETELAH data mulai, itu sudah footer
    // ("Laki-laki 22", "Perempuan 15", "Jumlah 37") — berhenti, jangan
    // dilaporkan sebagai baris bermasalah.
    if (!identifier && rows.length > 0) break;

    const rawKelas = map.kelas !== undefined ? values[map.kelas] : "";
    const { row } = validateRow({
      line: r,
      identifier,
      name,
      role: map.role !== undefined ? values[map.role] : "SISWA",
      kelas: rawKelas || defaultKelas,
      email: map.email !== undefined ? values[map.email] : "",
      gender: map.gender !== undefined ? values[map.gender] : "",
      password: map.password !== undefined ? values[map.password] : "",
    });

    rows.push(row);
    if (rows.length > MAX_ROWS) {
      throw new Error(`File melebihi batas ${MAX_ROWS} baris data.`);
    }
  }

  return { headerLine, kelas: defaultKelas, rows };
}

/**
 * Tandai tiap baris sebagai NEW, UPDATE, atau INVALID.
 * "Sudah terdaftar" adalah penanda UPDATE, bukan error.
 */
export async function markStatuses(
  rows: Omit<ImportRow, "status" | "errors">[]
): Promise<ImportRow[]> {
  const seen = new Map<string, number[]>();
  for (const r of rows) {
    if (!r.identifier) continue;
    const list = seen.get(r.identifier) ?? [];
    list.push(r.line);
    seen.set(r.identifier, list);
  }

  const validated = rows.map((r) => {
    const { errors } = validateRow(r);
    const dupLines = seen.get(r.identifier);
    if (dupLines && dupLines.length > 1) {
      errors.push(`Nomor induk ${r.identifier} duplikat di baris ${dupLines.join(", ")}`);
    }
    return { ...r, errors };
  });

  const identifiers = [...new Set(validated.map((r) => r.identifier).filter(Boolean))];
  const found = identifiers.length
    ? await prisma.user.findMany({
        where: { identifier: { in: identifiers } },
        select: { identifier: true },
      })
    : [];
  const inDb = new Set(found.map((u) => u.identifier));

  return validated.map((r) => ({
    ...r,
    status: r.errors.length ? "INVALID" : inDb.has(r.identifier) ? "UPDATE" : "NEW",
    errors: r.errors,
  }));
}
