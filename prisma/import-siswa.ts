/**
 * Import daftar siswa dari file Excel absensi.
 *
 *   npx tsx prisma/import-siswa.ts "ABSENSI XII-3.xlsx" --kelas XII-3 --replace --out data-user-XII-3.csv
 *
 * Flag:
 *   --kelas <kelas>   kelas untuk semua baris (kalau tidak ada di file)
 *   --out <file.csv>  tempat menulis daftar user + password awal
 *   --replace         hapus akun siswa demo yang ada sebelum import
 *   --dry-run         hanya tampilkan hasil baca, tidak menyentuh database
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ExcelJS from "exceljs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generatePassword, parseSheet, validateRow } from "../src/lib/import-users";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const file = process.argv[2]?.startsWith("--") ? undefined : process.argv[2];
  if (!file) {
    console.error("Usage: tsx prisma/import-siswa.ts <file.xlsx> [--kelas X-3] [--out f.csv] [--replace] [--dry-run]");
    process.exit(1);
  }

  const fallbackKelas = arg("kelas") ?? null;
  const outFile = arg("out") ?? null;
  const replace = hasFlag("replace");
  const dryRun = hasFlag("dry-run");

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(resolve(file));
  const sheet = wb.worksheets[0];
  if (!sheet) throw new Error("Workbook tidak memiliki sheet");

  const parsed = parseSheet(sheet, fallbackKelas);
  console.log(`📄 Sheet "${sheet.name}" — header di baris ${parsed.headerLine}`);
  console.log(`🏫 Kelas terdeteksi: ${parsed.kelas ?? "(tidak ada, pakai --kelas)"}`);
  console.log(`👥 Baris terbaca: ${parsed.rows.length}\n`);

  // Validasi + buat password acak untuk setiap siswa.
  const credentials: { identifier: string; name: string; kelas: string | null; password: string }[] = [];
  const invalid: { line: number; errors: string[] }[] = [];
  const seen = new Set<string>();

  for (const row of parsed.rows) {
    const { errors } = validateRow(row);
    if (!errors.length && seen.has(row.identifier)) {
      errors.push(`Nomor induk ${row.identifier} duplikat di file`);
    }
    if (errors.length) {
      invalid.push({ line: row.line, errors });
      continue;
    }
    seen.add(row.identifier);
    credentials.push({ ...row, password: generatePassword() });
  }

  if (invalid.length) {
    console.log(`⚠️  ${invalid.length} baris bermasalah:`);
    for (const i of invalid) console.log(`   baris ${i.line}: ${i.errors.join("; ")}`);
    console.log();
  }

  console.log(`✅ ${credentials.length} siswa siap diimpor`);
  console.log(`   contoh: ${credentials[0]?.name} (${credentials[0]?.identifier}) pw=${credentials[0]?.password}\n`);

  if (dryRun) {
    console.log("🧪 --dry-run: tidak ada perubahan ke database.");
    return;
  }

  if (replace) {
    const demo = await prisma.user.findMany({
      where: { role: "SISWA" },
      select: { identifier: true, name: true },
    });
    if (demo.length) {
      await prisma.user.deleteMany({ where: { role: "SISWA" } });
      console.log(`🗑️  ${demo.length} akun siswa lama dihapus (termasuk data demo).`);
    }
  }

  // Hash paralel — bcryptjs sync 37x ≈ 3 detik.
  const hashes = await Promise.all(
    credentials.map((c) => bcrypt.hash(c.password, 10))
  );

  let created = 0;
  let updated = 0;
  for (let i = 0; i < credentials.length; i++) {
    const c = credentials[i];
    const existing = await prisma.user.findUnique({ where: { identifier: c.identifier } });
    if (existing) {
      await prisma.user.update({
        where: { identifier: c.identifier },
        data: { name: c.name, role: "SISWA", kelas: c.kelas, password: hashes[i] },
      });
      updated++;
    } else {
      await prisma.user.create({
        data: {
          identifier: c.identifier,
          name: c.name,
          role: "SISWA",
          kelas: c.kelas,
          password: hashes[i],
        },
      });
      created++;
    }
  }

  console.log(`\n📥 ${created} akun dibuat, ${updated} diperbarui.`);

  if (outFile) {
    const esc = (s: string) => (/[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    const lines = [
      ["NO", "NO. INDUK", "NAMA", "KELAS", "PASSWORD AWAL"].join(";"),
      ...credentials.map((c, i) =>
        [i + 1, c.identifier, esc(c.name), c.kelas ?? "", c.password].join(";")
      ),
    ];
    const target = resolve(outFile);
    // BOM supaya Excel di Windows tidak mengubah huruf menjadi tanda tanya.
    writeFileSync(target, "\uFEFF" + lines.join("\n"), "utf8");
    console.log(`📄 Daftar user tersimpan: ${target}`);
    console.log("   Hapus file ini setelah password dibagikan ke siswa.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Gagal:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
