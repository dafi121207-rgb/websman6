import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const HEADERS = ["NO", "NO. INDUK", "NAMA", "L/P", "KELAS", "EMAIL", "ROLE", "PASSWORD"] as const;

const EXAMPLES: (string | number)[][] = [
  [1, "0031234567", "Alya Nurul Fauziah", "P", "XII-3", "alya@student.sman6garut.sch.id", "SISWA", ""],
  [2, "0031234568", "Dimas Pratama", "L", "XII-3", "", "SISWA", ""],
  [3, "19870101", "Budi Santoso, S.Pd", "L", "", "budi@sman6garut.sch.id", "GURU", ""],
];

/**
 * GET /api/users/import/template
 * Mengunduh .xlsx berisi header + contoh agar format tidak salah ketik.
 */
export async function GET() {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Akses hanya untuk Admin" }, { status: 403 });
  }

  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Siswa");

  sheet.addRow([...HEADERS]);
  for (const row of EXAMPLES) sheet.addRow(row);

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
  header.alignment = { vertical: "middle", horizontal: "center" };
  header.height = 22;

  sheet.columns = [
    { width: 6 },
    { width: 16 },
    { width: 32 },
    { width: 6 },
    { width: 10 },
    { width: 36 },
    { width: 10 },
    { width: 14 },
  ];

  // Kolom NO. INDUK dan PASSWORD sengaja disimpan sebagai teks supaya
  // NISN panjang tidak berubah jadi notasi ilmiah.
  for (let r = 2; r <= 1 + EXAMPLES.length; r++) {
    sheet.getCell(r, 2).numFmt = "@";
    sheet.getCell(r, 8).numFmt = "@";
  }

  sheet.addRow([]);
  const note = sheet.addRow([
    "NO. INDUK & NAMA wajib diisi. KELAS wajib untuk role SISWA. ROLE: SISWA / GURU / ADMIN (default SISWA). PASSWORD boleh kosong — jika kosong sistem membuatkan acak dan menampilkan daftar lengkapnya setelah simpan.",
  ]);
  note.getCell(1).font = { italic: true, size: 10, color: { argb: "FF64748B" } };
  sheet.mergeCells(note.number, 1, note.number, 8);
  note.getCell(1).alignment = { wrapText: true, vertical: "top" };
  note.height = 32;

  const buffer = await wb.xlsx.writeBuffer();
  const bytes = new Uint8Array(buffer as ArrayBuffer);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-import-siswa.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
