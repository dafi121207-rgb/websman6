# 📘 CETAK BIRU TEKNIS (TECHNICAL BLUEPRINT)
## WEB APP PEMBELAJARAN PJOK & PROFIL SMAN 6 GARUT

---

## 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1.1 Executive Summary & Background
**SMAN 6 Garut** memerlukan platform digital modern terpadu yang memadukan **Profil Resmi Sekolah** dan **Learning Management System (LMS) khusus Mata Pelajaran Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)**.

Mata pelajaran PJOK memiliki karakteristik unik yang membutuhkan fitur khusus dibandingkan mata pelajaran teori biasa, seperti:
- Pengumpulan tugas berbasis bukti praktik (video/foto peragaan gerakan).
- Absensi presensi saat kegiatan di lapangan olahraga (dengan *geo-tagging* / verifikasi foto selfie).
- Modul interaktif per cabang olahraga (Permainan Bola Besar/Kecil, Atletik, Senam, Renang, Kesehatan Reproduksi & Kebugaran Jasmani).

### 1.2 Data Profil Resmi Sekolah
- **Nama Sekolah:** SMAN 6 Garut
- **Email Resmi:** `sman_6garut@yahoo.co.id`
- **Telepon:** `231509`
- **Visi Sekolah:** `"MANDIRI", KOMPETITIF, DAN BERWAWASAN LINGKUNGAN`
- **Misi Sekolah:**
  1. Mewujudkan warga sekolah yang beriman, dinamis terhadap perubahan dan ringkas.
  2. Meningkatkan koneksi aktivitas pembelajaran akademik dan non-akademik terhadap nilai-nilai religius.
  3. Mendorong kreativitas dan inovasi warga sekolah dalam mewujudkan budaya positif.
  4. Meningkatkan profesionalisme warga sekolah dalam pengelolaan sekolah yang transparan, akuntabel, efektif, dan partisipatif.
  5. Meningkatkan prestasi akademik dan non-akademik peserta didik melalui pembelajaran Merdeka Belajar untuk meningkatkan daya serap lulusan ke perguruan tinggi.
  6. Mendorong tumbuhnya kesadaran kolektif warga sekolah terhadap lingkungan sekolah yang sehat, harmonis, dan humanis.

### 1.3 Project Objectives
1. **Digitalisasi Profil SMAN 6 Garut:** Menyajikan visualisasi profil sekolah yang estetik, dinamis, interaktif, dan merefleksikan nilai Visi/Misi keunggulan sekolah.
2. **Efisiensi Pembelajaran PJOK:** Memudahkan Guru PJOK dalam mendistribusikan materi, menyelenggarakan kuis otomatis, merekap absensi lapangan, serta menilai tugas video/praktik.
3. **Pengalaman Pengguna (UX) Kelas Dunia:** Menghadirkan antarmuka berbasis standar industri modern (Apple/Linear-tier micro-interactions) yang responsif untuk perangkat seluler siswa.

### 1.4 User Personas
| Persona | Role | Primary Needs | Key Touchpoints |
| :--- | :--- | :--- | :--- |
| **Siswa** | User Utama | Mengakses materi PJOK, mengisi absensi lapangan, mengerjakan kuis interaktif, upload video tugas olahraga. | Mobile PWA, Dashboard Siswa, Quiz Player, Geo-Absensi. |
| **Guru PJOK** | Content & Assessor | Mengelola modul bab olahraga, membuat kuis, memeriksa video tugas praktik, merekap absensi & nilai. | Desktop/Tablet Dashboard, Grading Console, Attendance Monitor. |
| **Admin Sekolah** | System Manager | Mengelola data profil sekolah (Visi, Misi, Kontak), manajemen akun siswa/guru, publikasi berita/galeri. | Master Admin Console, User Management, CMS Profil. |

### 1.5 Scope of Work

#### In-Scope:
- **Profil Sekolah Dynamic CMS:** Landing page interaktif, Visi & Misi resmi, Sambutan Kepala Sekolah, Kontak (Email & Telp), Galeri Fasilitas Olahraga, Berita & Pengumuman.
- **LMS Khusus PJOK:**
  - Modul Materi Multimedia (Teks, Infografis, Embedded Video Tutorial Gerakan).
  - Sistem Kuis & Ujian Interaktif (Timer, Shuffle Question, Auto-grading, Detailed Explanation).
  - Pengumpulan Tugas Praktik Video/Foto dengan limit kompresi media client-side.
- **Sistem Absensi Digital Lapangan:** Absensi dengan Geo-location validation & Selfie Cam proof.
- **Dashboard Rekapitulasi Nilai & Absensi:** Ekspor otomatis ke Excel/PDF standar Kurikulum Merdeka.
- **Sistem Autentikasi RBAC:** Role-Based Access Control (Admin, Guru, Siswa).

#### Out-of-Scope (Phase 1):
- Pembayaran iuran/SPP sekolah.
- Streaming langsung (Live Streaming Class) internal (menggunakan integrasi YouTube/Google Meet link).

### 1.6 Success Metrics (KPIs)
- **Performance Index:** Lighthouse Score $> 90$ pada Mobile & Desktop.
- **User Engagement:** $> 95\%$ siswa berhasil melakukan absensi & kuis tanpa *system failure*.
- **Task Submission Speed:** Waktu pengunggahan video/foto tugas $< 5$ detik dengan kompresi *client-side*.
- **Uptime:** $99.9\%$ ketersediaan sistem pada server Vercel + Supabase.

### 1.7 Brand & Visual Identity Guidelines (Vanguard Architecture)
- **Design Philosophy:** *Soft Structuralism & Ethereal Glass* – Tampilan bersih, sporty, modern, dengan aksen *Double-Bezel Card Architecture* dan *Fluid Kinetic Physics*.
- **Typography:** Primary Heading: `Plus Jakarta Sans`, Body/Code: `Geist Sans / Geist Mono`.
- **Color Palette:**
  - *Primary Athletic Blue:* `#0F172A` (Slate 900) & `#2563EB` (Royal Blue)
  - *Sport Emerald Accent:* `#059669` (Emerald 600 - untuk indikator hadir/lulus)
  - *Canvas Background:* Light Mode `#F8FAFC` (Slate 50), Dark Mode `#020617` (Slate 950)
  - *Glass Shell:* `rgba(255, 255, 255, 0.75)` dengan `backdrop-blur-xl` dan outer hairline border `ring-1 ring-black/5`.

---

## 2. SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

### 2.1 Functional Requirements

#### FR-100: Auth & User Management
- **FR-101:** Sistem harus mendukung Login menggunakan NISN/NIP dan Password, serta Login SSO via Google Workspace.
- **FR-102:** Sistem harus memverifikasi Role User (Admin, Guru, Siswa) dan membatasi hak akses ke API & Page sesuai role (RBAC).

#### FR-200: Profil Sekolah & Public CMS
- **FR-201:** Publik dapat melihat landing page SMAN 6 Garut yang mencakup Visi, 6 Poin Misi, Email (`sman_6garut@yahoo.co.id`), Telepon (`231509`), dan galeri sarana olahraga.
- **FR-202:** Admin dapat mengelola postingan berita, agenda kegiatan olahraga, serta memperbarui kontak & profil sekolah.

#### FR-300: Modul Pembelajaran PJOK
- **FR-301:** Guru dapat membuat, mengubah, dan menghapus Bab Materi PJOK (contoh: *Bab 1: Variasi Gerak Spesifik Permainan Sepak Bola*).
- **FR-302:** Siswa dapat membaca materi dan menonton video tutorial peragaan teknis olahraga.

#### FR-400: Absensi Lapangan (Geo & Photo Proof)
- **FR-401:** Siswa dapat melakukan *check-in* absensi PJOK hanya jika berada dalam radius tertentu (misal: 100m dari Lapangan SMAN 6 Garut) atau saat sesi absensi dibuka oleh Guru.
- **FR-402:** Sistem harus mengambil koordinat GPS dan foto bukti kehadiran (*selfie*) dari peranti siswa.

#### FR-500: Kuis & Tugas Praktik
- **FR-501:** Guru dapat membuat Kuis Pilihan Ganda dan Isian dengan *countdown timer* dan acak soal.
- **FR-502:** Siswa dapat mengerjakan kuis secara *real-time* dan langsung mendapatkan hasil kalkulasi skor.
- **FR-503:** Siswa dapat mengunggah rekaman peragaan gerakan (misal: *Video Roll Depan 15 detik*) yang otomatis dikompresi sebelum diunggah ke storage Cloud.

---

### 2.2 Non-Functional Requirements
- **NFR-1 (Security):** Semua data password di-hash menggunakan `bcrypt` / `argon2`. Komunikasi menggunakan HTTPS standar TLS 1.3. API dilindungi JWT Token & HTTP-Only Secure Cookies.
- **NFR-2 (Performance):** *First Contentful Paint (FCP)* $< 1.2$ detik. *Time to Interactive (TTI)* $< 2.5$ detik pada jaringan 4G.
- **NFR-3 (Scalability):** Arsitektur Serverless Next.js sanggup menangani hingga 1.000 konkurensi siswa yang mengerjakan kuis secara bersamaan.
- **NFR-4 (PWA & Responsiveness):** Tampilan fully-responsive dari layar mobile $360\text{px}$ hingga desktop $4\text{K}$. Mendukung penginstalan PWA (Manifest & Service Worker).

---

### 2.3 User Stories & Acceptance Criteria

#### User Story 1: Absensi Lapangan Siswa
> **Sebagai** Siswa SMAN 6 Garut,  
> **Saya ingin** melakukan absensi kehadiran kelas PJOK dari smartphone saya di lapangan,  
> **Sehingga** kehadiran saya tercatat secara akurat beserta lokasi dan foto bukti.

**Acceptance Criteria:**
- **Given** Siswa berada di halaman Absensi dan GPS perangkat aktif.
- **When** Siswa menekan tombol "Ambil Foto Presensi", kamera depan aktif dan koordinat lat/long terdeteksi.
- **Then** Jika lokasi berada di area SMAN 6 Garut (radius $\le 100$ meter), presensi berhasil disimpan dan status berubah menjadi "Hadir".
- **And** Jika berada di luar radius, sistem menampilkan pesan peringatan "Lokasi Anda di luar jangkauan lapangan SMAN 6 Garut".

#### User Story 2: Pembuatan Kuis Interaktif oleh Guru
> **Sebagai** Guru PJOK,  
> **Saya ingin** menyusun kuis interaktif bab Kebugaran Jasmani,  
> **Sehingga** nilai siswa dapat terkalkulasi secara otomatis tanpa perlu koreksi manual.

**Acceptance Criteria:**
- **Given** Guru berada di Dashboard Guru -> Modul Kuis.
- **When** Guru memasukkan daftar pertanyaan, opsi jawaban, kunci jawaban, dan durasi pengerjaan.
- **Then** Kuis terpublikasi dan dapat diakses siswa sesuai jadwal yang ditentukan.

---

## 3. SOFTWARE DESIGN DESCRIPTION (SDD)

### 3.1 System Architecture Diagram
Sistem dibangun menggunakan **Jamstack / Modern Serverless Architecture** dengan Next.js 15 App Router:

```
+-------------------------------------------------------------------+
|                        CLIENT / BROWSER                           |
|       (Next.js React Client Components + Tailwind CSS + PWA)       |
+-------------------------------------------------------------------+
                                  |
                                  | HTTPS / REST / Server Actions
                                  v
+-------------------------------------------------------------------+
|                     NEXT.JS BACKEND ENGINE                        |
|   - App Router Server Components (SSR / SSG)                      |
|   - Server Actions & Route Handlers (/api/*)                      |
|   - Middleware (RBAC, JWT & Session Verification)                 |
|   - Zod Payload Validator                                         |
+-------------------------------------------------------------------+
             |                                    |
             | Prisma ORM                         | SDK / REST API
             v                                    v
+--------------------------+          +-----------------------------+
|    SUPABASE / POSTGRES   |          |      SUPABASE STORAGE       |
|  - Managed PostgreSQL    |          |  - Video Tugas Olahraga     |
|  - Row Level Security    |          |  - Foto Presensi & Profil   |
+--------------------------+          +-----------------------------+
```

---

### 3.2 Database Schema (Prisma ORM Specs)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  GURU
  SISWA
}

enum AttendanceStatus {
  HADIR
  IZIN
  SAKIT
  ALPA
}

enum SubmissionStatus {
  PENDING
  GRADED
  REJECTED
}

model User {
  id            String   @id @default(uuid())
  identifier    String   @unique // NISN untuk Siswa, NIP untuk Guru, Username untuk Admin
  name          String
  email         String?  @unique
  password      String
  role          Role     @default(SISWA)
  avatarUrl     String?
  kelas         String?  // Contoh: "X-IPA-1", "XI-IPS-2"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  attendances   Attendance[]
  submissions   Submission[]
  quizAttempts  QuizAttempt[]
  createdQuizzes Quiz[]     @relation("TeacherQuizzes")

  @@map("users")
}

model SchoolProfile {
  id          String   @id @default("sman6garut")
  title       String   @default("SMAN 6 GARUT")
  email       String   @default("sman_6garut@yahoo.co.id")
  phone       String   @default("231509")
  tagline     String   @default("MANDIRI, KOMPETITIF, DAN BERWAWASAN LINGKUNGAN")
  welcomeText String   @db.Text
  vision      String   @db.Text // "\"MANDIRI\", KOMPETITIF, DAN BERWAWASAN LINGKUNGAN"
  mission     String[] // Array 6 poin Misi SMAN 6 Garut
  updatedAt   DateTime @updatedAt

  @@map("school_profiles")
}

model News {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  coverImage  String?
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("news")
}

model Module {
  id          String   @id @default(uuid())
  title       String
  category    String   // e.g., "Bola Besar", "Atletik", "Kebugaran"
  description String   @db.Text
  videoUrl    String?
  pdfUrl      String?
  order       Int      @default(1)
  createdAt   DateTime @default(now())

  assignments Assignment[]
  quizzes     Quiz[]

  @@map("modules")
}

model AttendanceSession {
  id              String   @id @default(uuid())
  title           String   // e.g., "Absensi PJOK Kelas X-1 Lapangan"
  kelas           String
  date            DateTime @default(now())
  isOpen          Boolean  @default(true)
  targetLat       Float?   // Lat Lapangan SMAN 6 Garut
  targetLng       Float?   // Lng Lapangan SMAN 6 Garut
  maxRadiusMeters Float    @default(100.0)

  attendances     Attendance[]

  @@map("attendance_sessions")
}

model Attendance {
  id          String           @id @default(uuid())
  sessionId   String
  userId      String
  status      AttendanceStatus @default(HADIR)
  photoProof  String?          // URL Foto Selfie
  userLat     Float?
  userLng     Float?
  createdAt   DateTime         @default(now())

  session     AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId])
  @@map("attendances")
}

model Quiz {
  id          String   @id @default(uuid())
  moduleId    String
  teacherId   String
  title       String
  durationMin Int      @default(30)
  passScore   Int      @default(75)

  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  teacher     User     @relation("TeacherQuizzes", fields: [teacherId], references: [id])
  questions   Question[]
  attempts    QuizAttempt[]

  @@map("quizzes")
}

model Question {
  id            String   @id @default(uuid())
  quizId        String
  questionText  String   @db.Text
  options       String[] // Array 4/5 pilihan jawaban
  correctAnswer Int      // Index jawaban benar (0-3 / 0-4)
  explanation   String?  @db.Text

  quiz          Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@map("questions")
}

model QuizAttempt {
  id        String   @id @default(uuid())
  quizId    String
  userId    String
  score     Float
  isPassed  Boolean
  createdAt DateTime @default(now())

  quiz      Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("quiz_attempts")
}

model Assignment {
  id          String   @id @default(uuid())
  moduleId    String
  title       String
  instruction String   @db.Text
  dueDate     DateTime

  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  submissions Submission[]

  @@map("assignments")
}

model Submission {
  id           String           @id @default(uuid())
  assignmentId String
  userId       String
  mediaUrl     String           // Video / Foto bukti praktik
  notes        String?          @db.Text
  score        Float?
  status       SubmissionStatus @default(PENDING)
  createdAt    DateTime         @default(now())

  assignment   Assignment       @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("submissions")
}
```

---

### 3.3 API Endpoint Mapping

#### 1. Profil Sekolah (`/api/profile`)
- `GET /api/profile`
  - **Desc:** Mendapatkan data resmi Profil SMAN 6 Garut (Visi, Misi, Email, No. Telp).
  - **Response (200 OK):**
    ```json
    {
      "title": "SMAN 6 GARUT",
      "email": "sman_6garut@yahoo.co.id",
      "phone": "231509",
      "vision": "\"MANDIRI\", KOMPETITIF, DAN BERWAWASAN LINGKUNGAN",
      "mission": [
        "1. MEWUJUDKAN WARGA SEKOLAH YANG BERIMAN, DINAMIS TERHADAP PERUBAHAN DAN RINGKAS",
        "2. MENINGKATKAN KONEKSI AKTIVITAS PEMBELAJARAN AKADEMIK DAN NON AKADEMIK TERHADAP NILAI-NILAI RELIGIUS",
        "3. MENDORONG KREATIVITAS DAN INOVASI WARGA SEKOLAH DALAM MEWUJUDKAN BUDAYA POSITIF",
        "4. MENINGKATKAN PROFESIONALISME WARGA SEKOLAH DALAM PENGELOLAAN SEKOLAH YANG TRANSPARAN, AKUNTABEL, EFEKTIF, DAN PARTISIPATIF",
        "5. MENINGKATKAN PRESTASI AKADEMIK DAN NON AKADEMIK PESERTA DIDIK MELALUI PEMBELAJARAN MERDEKA BELAJAR UNTUK MENINGKATKAN DAYA SERAP LULUSAN KE PERGURUAN TINGGI",
        "6. MENDORONG TUMBUHNYA KESADARAN KOLEKTIF WARGA SEKOLAH TERHADAP LINGKUNGAN SEKOLAH YANG SEHAT, HARMONIS, DAN HUMANIS"
      ]
    }
    ```

#### 2. Autentikasi (`/api/auth`)
- `POST /api/auth/login`
  - **Desc:** Auth Login SISWA/GURU/ADMIN.
  - **Request Body:**
    ```json
    {
      "identifier": "1234567890",
      "password": "Password123!"
    }
    ```

#### 3. Absensi Lapangan (`/api/attendance`)
- `POST /api/attendance/check-in`
  - **Desc:** Melakukan presensi dengan geo-location & foto selfie.
  - **Request Body:**
    ```json
    {
      "sessionId": "session_uuid",
      "userLat": -7.2278,
      "userLng": 107.9087,
      "photoProof": "data:image/jpeg;base64,..."
    }
    ```

---

## 4. UI / UX FLOW & DESIGN SYSTEM

### 4.1 Visual Design Archetype
Mengikuti pedoman **Awwwards-Tier UI Architecture**:
- **Style Archetype:** *Ethereal Glass + Soft Structuralism*.
- **Card Enclosure (Doppelrand / Double-Bezel Architecture):**
  - *Outer Shell:* `bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-[2rem] ring-1 ring-black/5`
  - *Inner Core:* `bg-white dark:bg-slate-950 p-6 rounded-[calc(2rem-0.5rem)] shadow-sm`
- **Interactive Button:** *Button-in-Button Architecture* dengan ikon melayang berpindah sumbu (`group-hover:translate-x-1 group-hover:-translate-y-[1px]`).

---

### 4.2 User Journey Flow

```
[SISWA Buka Web] ---> [Landing Page Profil SMAN 6 Garut]
                             |  (Tampil Visi, Misi, Email, Telp)
                             |
                             +---> [Login NISN]
                                       |
                                       v
                             [Dashboard Siswa PJOK]
                                       |
     +---------------------------------+---------------------------------+
     |                                 |                                 |
     v                                 v                                 v
[Modul Olahraga]              [Absensi Lapangan]                [Kuis Interaktif]
  - Baca Teori                  - Ambil Lokasi (GPS)              - Pengerjaan Timer
  - Tonton Video Gerakan        - Ambil Foto Selfie               - Auto Score Result
  - Upload Video Praktik        - Simpan Presensi                 - Leaderboard Kelas
```

---

### 4.3 Key Page Layout & Component Mapping

#### A. Landing Page Profil SMAN 6 Garut
- **Hero Section:** Judul utama "SMAN 6 GARUT", Tagline, dan Card Visi Sekolah (`"MANDIRI", KOMPETITIF, DAN BERWAWASAN LINGKUNGAN`).
- **Misi Grid (Bento Box):** 6 Kartu Misi Interaktif dengan *hover glow animation*.
- **Footer Contact Info:**
  - Email: `sman_6garut@yahoo.co.id`
  - Telepon: `231509`

---

## 5. TASK BREAKDOWN (AGILE/SCRUM SPRINT PLAN)

```
Sprint 1: Project Setup & System Core Architecture
 ├── Task 1.1: Setup Repository Next.js 15 (App Router, Tailwind CSS v4, TypeScript)
 ├── Task 1.2: Konfigurasi Prisma ORM & Database PostgreSQL Supabase dengan Seed Visi/Misi & Kontak
 └── Task 1.3: Buat Design System & Components (Double-Bezel Cards, Floating Island Nav)

Sprint 2: Authentication & RBAC System
 ├── Task 2.1: Setup Auth Handler & JWT Middleware
 ├── Task 2.2: Implementasi Page Login NISN/NIP & Validation (Zod)
 └── Task 2.3: Implementasi Route Protection berdasarkan User Role

Sprint 3: Public CMS Profil SMAN 6 Garut
 ├── Task 3.1: Development Landing Page Hero Section, Display Visi & 6 Poin Misi
 ├── Task 3.2: Footer Informasi Kontak (Email: sman_6garut@yahoo.co.id, Telp: 231509)
 └── Task 3.3: Galeri Fasilitas Olahraga & Berita Sekolah

Sprint 4: Modul LMS PJOK & Tugas Video
 ├── Task 4.1: UI/UX Halaman Detail Modul (Video Embed + PDF Viewer)
 ├── Task 4.2: Fitur Submit Tugas Video/Foto Praktik Olahraga
 └── Task 4.3: Integrasi Cloud Storage (Supabase Storage) dengan Client Compression

Sprint 5: Absensi Digital Lapangan (Geo-Location) & Kuis Interaktif
 ├── Task 5.1: Implementasi API & UI Absensi (Browser Geolocation API + Camera Capture)
 ├── Task 5.2: Engine Kuis Interaktif (Timer, Shuffle Engine, Auto-grading)
 └── Task 5.3: Halaman Hasil Kuis & Explanations

Sprint 6: Admin/Guru Console & Rekapitulasi Nilai (PDF/Excel)
 ├── Task 6.1: Dashboard Guru untuk Penilaian Tugas & Monitoring Presensi
 ├── Task 6.2: Fitur Export Rekap Nilai & Absensi Format Excel/PDF
 └── Task 6.3: Optimization, PWA Service Worker Configuration, & Deployment ke Vercel
```

---

## 6. KESIMPULAN & LANGKAH SELANJUTNYA

Blueprint teknis `blueprint_pjok_sman6garut.md` kini telah mencakup identitas dan profil resmi SMAN 6 Garut secara utuh dan spesifik. Dokumen ini siap dijadikan acuan utama untuk tahap inisiasi kode (*development phase*).