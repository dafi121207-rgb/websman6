import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MISSION = [
  "Mewujudkan warga sekolah yang beriman, dinamis terhadap perubahan dan ringkas.",
  "Meningkatkan koneksi aktivitas pembelajaran akademik dan non-akademik terhadap nilai-nilai religius.",
  "Mendorong kreativitas dan inovasi warga sekolah dalam mewujudkan budaya positif.",
  "Meningkatkan profesionalisme warga sekolah dalam pengelolaan sekolah yang transparan, akuntabel, efektif, dan partisipatif.",
  "Meningkatkan prestasi akademik dan non-akademik peserta didik melalui pembelajaran Merdeka Belajar untuk meningkatkan daya serap lulusan ke perguruan tinggi.",
  "Mendorong tumbuhnya kesadaran kolektif warga sekolah terhadap lingkungan sekolah yang sehat, harmonis, dan humanis.",
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed demo tidak boleh dijalankan di production.");
  }

  console.log("🌱 Seeding database SMAN 6 Garut...");

  await prisma.schoolProfile.upsert({
    where: { id: "sman6garut" },
    update: {},
    create: {
      id: "sman6garut",
      title: "SMAN 6 GARUT",
      email: "sman_6garut@yahoo.co.id",
      phone: "231509",
      tagline: "MANDIRI, KOMPETITIF, DAN BERWAWASAN LINGKUNGAN",
      welcomeText:
        "Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di portal resmi SMAN 6 Garut. Semoga informasi yang tersaji dapat memberikan gambaran nyata tentang berbagai aktivitas pembelajaran, khususnya mata pelajaran PJOK yang menjadikan peserta didik kita sehat, bugar, dan berprestasi.",
      vision: "\"MANDIRI\", KOMPETITIF, DAN BERWAWASAN LINGKUNGAN",
      mission: JSON.stringify(MISSION),
    },
  });

  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const admin = await prisma.user.upsert({
    where: { identifier: "admin" },
    update: {},
    create: {
      identifier: "admin",
      name: "Administrator Sekolah",
      password: hash("admin123"),
      role: "ADMIN",
    },
  });

  const guru = await prisma.user.upsert({
    where: { identifier: "19870101" },
    update: {},
    create: {
      identifier: "19870101",
      name: "Pak Budi, S.Pd — Guru PJOK",
      password: hash("guru123"),
      role: "GURU",
    },
  });

  // Akun siswa TIDAK dibuat di seed. Daftar siswa XII-3 yang asli diimpor
  // lewat `npm run import:siswa -- "ABSENSI XII-3.xlsx" --replace`.
  await prisma.news.upsert({
    where: { slug: "lomba-lari-17-agustus" },
    update: {},
    create: {
      title: "Seleksi Atlet Lomba Lari Menuju Kejurda Garut",
      slug: "lomba-lari-17-agustus",
      content:
        "SMAN 6 Garut membuka seleksi peserta lomba lari 100m, 200m, dan 400m untuk representasi sekolah pada Kejuaraan Daerah (Kejurda) Garut. Seleksi akan dilaksanakan di Lapangan Utama sekolah. Seluruh peserta wajib membawa surat keterangan sehat dan bergabung pada grup pembinaan atletik PJOK.",
      published: true,
    },
  });

  await prisma.news.upsert({
    where: { slug: "pengumuman-absensi-lapangan" },
    update: {},
    create: {
      title: "Pengumuman: Absensi Lapangan Digital PJOK",
      slug: "pengumuman-absensi-lapangan",
      content:
        "Mulai semester ini, absensi PJOK saat pembelajaran di lapangan menggunakan sistem digital dengan verifikasi lokasi (geolocation) dan foto bukti. Siswa diminta mempersiapkan perangkat dengan baterai cukup dan izin kamera saat sesi absensi dibuka oleh guru.",
      published: true,
    },
  });

  const modSepakBola = await prisma.module.upsert({
    where: { id: "mod-sepak-bola-variasi" },
    update: {},
    create: {
      id: "mod-sepak-bola-variasi",
      title: "Bab 1: Variasi Gerak Spesifik Permainan Sepak Bola",
      category: "Bola Besar",
      description:
        "Materi PJOK bab 1 membahas variasi gerak spesifik permainan sepak bola: passing, dribbling, shooting, dan heading. Siswa diharapkan mampu mempraktikkan teknik dasar dengan koordinasi yang baik, kemudian merekam peragaan gerakan sebagai bukti tugas praktik.",
      videoUrl: "https://www.youtube.com/embed/-3onQVt6wSc",
      order: 1,
    },
  });

  await prisma.module.upsert({
    where: { id: "mod-kebugaran-jasmani" },
    update: {},
    create: {
      id: "mod-kebugaran-jasmani",
      title: "Bab 2: Kebugaran Jasmani & Pola Hidup Sehat",
      category: "Kebugaran",
      description:
        "Materi kebugaran jasmani: komponen kebugaran (kekuatan, daya tahan, kelenturan, kecepatan), cara mengukur denyut nadi, serta menyusun program latihan pribadi yang seimbang dengan pola nutrisi yang baik.",
      order: 2,
    },
  });

  await prisma.attendanceSession.upsert({
    where: { id: "sesi-lapangan-x1" },
    update: {},
    create: {
      id: "sesi-lapangan-xii3",
      title: "Absensi PJOK Kelas XII-3 — Lapangan Utama",
      kelas: "XII-3",
      isOpen: true,
      targetLat: -7.2278,
      targetLng: 107.9087,
      maxRadiusMeters: 100,
    },
  });

  const quiz1 = await prisma.quiz.upsert({
    where: { id: "quiz-sepak-bola-bab1" },
    update: {},
    create: {
      id: "quiz-sepak-bola-bab1",
      moduleId: modSepakBola.id,
      teacherId: guru.id,
      title: "Kuis Bab 1 — Sepak Bola",
      durationMin: 15,
      passScore: 75,
    },
  });

  const questions = [
    {
      questionText: "Teknik memindahkan bola kepada rekan setim dengan kaki disebut...",
      options: JSON.stringify(["Dribbling", "Passing", "Shooting", "Heading"]),
      correctAnswer: 1,
      explanation: "Passing adalah teknik mengoper bola kepada rekan setim menggunakan kaki (kaki bagian dalam/luar).",
    },
    {
      questionText: "Jumlah pemain sepak bola dalam satu tim yang berada di lapangan adalah...",
      options: JSON.stringify(["7 pemain", "9 pemain", "11 pemain", "12 pemain"]),
      correctAnswer: 2,
      explanation: "Setiap tim sepak bola terdiri atas 11 pemain, termasuk satu penjaga gawang.",
    },
    {
      questionText: "Menendang bola dengan punggung kaki bagian dalam (kura-kura) digunakan untuk...",
      options: JSON.stringify([
        "Operan jarak dekat",
        "Tendangan bola lambung dengan akurasi",
        "Menahan bola",
        "Lemparan ke dalam",
      ]),
      correctAnswer: 1,
      explanation: "Punggung kaki bagian dalam menghasilkan tendangan bola tinggi dengan akurasi, biasa dipakai untuk umpan panjang.",
    },
    {
      questionText: "Gerakan menggiring bola dengan kaki bagian luar disebut...",
      options: JSON.stringify(["Driving luar", "Dribbling", "Corner kick", "Cleese"]),
      correctAnswer: 1,
      explanation: "Dribbling (menggiring) dapat dilakukan dengan kaki bagian dalam maupun luar sesuai arah pergerakan.",
    },
    {
      questionText: "Pemain yang berhak menyentuh bola dengan tangan di dalam area penalti adalah...",
      options: JSON.stringify(["Striker", "Bek tengah", "Kiper (penjaga gawang)", "Kapten tim"]),
      correctAnswer: 2,
      explanation: "Hanya kiper yang berhak menggunakan tangan, dan hanya di dalam area penalti.",
    },
  ];

  const qCount = await prisma.question.count({ where: { quizId: quiz1.id } });
  if (qCount === 0) {
    await prisma.question.createMany({
      data: questions.map((q) => ({ ...q, quizId: quiz1.id })),
    });
  }

  const assignment = await prisma.assignment.upsert({
    where: { id: "tugas-roll-depan" },
    update: {},
    create: {
      id: "tugas-roll-depan",
      moduleId: modSepakBola.id,
      title: "Tugas Praktik: Video Peragaan Roll Depan (15 detik)",
      instruction:
        "Rekam video peragaan kalian melakukan gerakan roll depan dengan durasi sekitar 15 detik. Pastikan pencahayaan cukup dan gerakan terlihat utuh. Unggah video maksimal 50MB, atau foto dokumentasi kegiatan.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log({ admin, guru, quiz1, assignment });
  console.log("✅ Seed selesai! (akun siswa diimpor terpisah lewat npm run import:siswa)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
