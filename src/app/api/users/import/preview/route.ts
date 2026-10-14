import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { requireRole } from "@/lib/auth";
import {
  MAX_FILE_BYTES,
  MAX_ROWS,
  markStatuses,
  parseSheet,
} from "@/lib/import-users";

export const runtime = "nodejs";

/**
 * POST /api/users/import/preview
 * multipart/form-data: file=<.xlsx>, kelas=<opsional>
 *
 * Parse + validasi saja. TIDAK menulis ke database.
 */
export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Permintaan harus berupa multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File Excel belum dipilih" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `Ukuran file maksimal ${MAX_FILE_BYTES / 1024 / 1024} MB` },
      { status: 413 }
    );
  }

  const ext = file.name.toLowerCase().split(".").pop();
  if (ext !== "xlsx" && ext !== "xlsm") {
    return NextResponse.json(
      { error: "Format file harus .xlsx (bukan .xls). Simpan ulang dari Excel sebagai Excel Workbook." },
      { status: 415 }
    );
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "File tidak bisa dibaca. Pastikan file .xlsx tidak rusak." }, { status: 400 });
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return NextResponse.json({ error: "Workbook tidak memiliki sheet" }, { status: 400 });
  }

  const fallbackKelas = String(form.get("kelas") ?? "").trim() || null;

  let parsed;
  try {
    parsed = parseSheet(sheet, fallbackKelas);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal memproses file" },
      { status: 400 }
    );
  }

  if (parsed.rows.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada baris data siswa yang ditemukan. Periksa isi file Anda." },
      { status: 400 }
    );
  }

  if (parsed.rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Jumlah baris melebihi batas ${MAX_ROWS}` },
      { status: 400 }
    );
  }

  const rows = await markStatuses(parsed.rows);

  return NextResponse.json({
    sheetName: sheet.name,
    headerLine: parsed.headerLine,
    guessedKelas: parsed.kelas,
    rows,
    summary: {
      total: rows.length,
      new: rows.filter((r) => r.status === "NEW").length,
      update: rows.filter((r) => r.status === "UPDATE").length,
      invalid: rows.filter((r) => r.status === "INVALID").length,
    },
  });
}
