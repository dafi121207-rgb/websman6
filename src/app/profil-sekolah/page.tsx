import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Mail,
  MapPin,
  Medal,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import PublicShell from "@/components/PublicShell";
import { Badge, PrimaryButton, SecondaryButton } from "@/components/ui";
import prisma from "@/lib/prisma";
import TataTertibTabs from "./TataTertibTabs";

export const metadata: Metadata = {
  title: "Profil Sekolah Lengkap · SMAN 6 Garut",
  description:
    "Profil resmi, identitas satuan pendidikan, visi & misi, tata tertib siswa, dan fasilitas unggulan SMA Negeri 6 Garut.",
};

export const dynamic = "force-dynamic";

async function getSchoolData() {
  const profile = await prisma.schoolProfile.findUnique({
    where: { id: "sman6garut" },
  });
  return { profile };
}

const SCHOOL_IDENTITY = [
  { label: "Nama Resmi", value: "SMA Negeri 6 Garut", icon: Building2 },
  { label: "NPSN", value: "20209214", icon: ShieldCheck },
  { label: "Status Sekolah", value: "Negeri", icon: Award },
  { label: "Bentuk Pendidikan", value: "Sekolah Menengah Atas (SMA)", icon: GraduationCap },
  { label: "Status Akreditasi", value: "Akreditasi A (Amat Baik)", icon: Medal },
  { label: "Kurikulum Operasional", value: "Kurikulum Merdeka", icon: BookOpen },
  { label: "Naungan Lembaga", value: "Dinas Pendidikan Prov. Jawa Barat (KCD Wilayah XI)", icon: Users },
  { label: "SK Pendirian", value: "Pemerintah Provinsi Jawa Barat", icon: Calendar },
];

const FACILITIES_LIST = [
  {
    title: "Lapangan Futsal & Basket Interlock",
    desc: "Lantai interlock regulasi berstandar turnamen pelajar dengan pencahayaan LED malam.",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Lapangan Voli & Bulutangkis Outdoor",
    desc: "Area multi-lapangan beralas cor halus dengan net regulasi dan garis batas standar PBVSI & PBSI.",
    icon: Medal,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Lintasan Lari & Area Atletik",
    desc: "Lintasan lari 400 meter penunjang tes kebugaran jasmani, lari sprint, estafet, dan daya tahan.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Aula Indoor & Senam Ritmik",
    desc: "Hall indoor berlantai kayu fleksibel, cermin gerak, dan matras keselamatan untuk senam lantai.",
    icon: HeartPulse,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  },
];

export default async function ProfilSekolahPage() {
  const { profile } = await getSchoolData();
  const missions: string[] = profile ? JSON.parse(profile.mission) : [];

  return (
    <PublicShell>
      <main className="pt-28 pb-20">
        {/* ============ BREADCRUMB & HERO BANNER ============ */}
        <section className="px-4 pb-10">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
              <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                <ArrowLeft size={14} /> Beranda
              </Link>
              <span>/</span>
              <span className="text-slate-800">Profil Sekolah Lengkap</span>
            </div>

            {/* Hero Header Card */}
            <div className="glass-shell ring-1 ring-black/5 bg-white/80 shadow-xl overflow-hidden relative">
              <div className="bezel-core p-8 sm:p-12 bg-white/95 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-100/60 blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="Logo SMAN 6 Garut"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-2 ring-blue-600/20 shadow-md shrink-0"
                  />
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <Badge tone="blue">Profil Resmi Satuan Pendidikan</Badge>
                      <Badge tone="emerald">Akreditasi A Unggul</Badge>
                      <span className="text-xs font-bold text-slate-500">NPSN: 20209214</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      SMA Negeri 6 <span className="text-blue-600">Garut</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-medium leading-relaxed">
                      Lembaga pendidikan menengah atas unggulan di Kabupaten Garut yang berkomitmen mencetak generasi
                      berkarakter, unggul dalam kebugaran jasmani, kompetitif dalam prestasi, dan berwawasan lingkungan.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-rose-500" /> Tarogong Kidul, Garut
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen size={14} className="text-blue-600" /> Kurikulum Merdeka
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" /> Sekolah Adiwiyata
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ IDENTITAS SATUAN PENDIDIKAN ============ */}
        <section className="px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Data Pokok Pendidikan</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Identitas Resmi Sekolah
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {SCHOOL_IDENTITY.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="glass-shell ring-1 ring-black/5 bg-white/70 hover:shadow-md transition-shadow"
                  >
                    <div className="bezel-core p-4 sm:p-5 h-full bg-white/95 flex flex-col justify-between">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-bold text-slate-800 mt-1 leading-snug">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ VISI & MISI SEKOLAH ============ */}
        <section className="px-4 py-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Arah &amp; Cita-Cita Sekolah</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Visi &amp; Misi Pendidikan
              </h2>
            </div>

            {/* Visi Highlight */}
            <div className="glass-shell ring-1 ring-black/5 bg-gradient-to-r from-blue-500/10 via-white/80 to-amber-500/10 shadow-lg">
              <div className="bezel-core p-8 sm:p-10 text-center bg-white/95 relative overflow-hidden">
                <span className="inline-block px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                  Visi Sekolah
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 max-w-3xl mx-auto leading-snug">
                  &ldquo;MANDIRI, KOMPETITIF, DAN BERWAWASAN LINGKUNGAN&rdquo;
                </h3>
                <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                  Menghasilkan insan terpelajar yang religius, tangguh dalam keilmuan, sportif dalam keolahragaan,
                  serta memiliki kepedulian tinggi terhadap kelestarian alam dan sesama.
                </p>
              </div>
            </div>

            {/* 6 Pilar Misi */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">6 Pilar Misi SMAN 6 Garut:</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {missions.map((misi, idx) => (
                  <div key={idx} className="glass-shell ring-1 ring-black/5 bg-white/70">
                    <div className="bezel-core p-5 h-full bg-white/95 flex items-start gap-3.5">
                      <span className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{misi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ TATA TERTIB & BUDAYA POSITIF PESERTA DIDIK ============ */}
        <section className="px-4 py-10" id="tata-tertib">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Regulasi &amp; Kode Etik</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Tata Tertib &amp; Budaya Positif Siswa
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Pedoman resmi hak, kewajiban, tata susila, dan kedisiplinan bagi seluruh peserta didik SMA Negeri 6 Garut.
              </p>
            </div>

            <TataTertibTabs />
          </div>
        </section>

        {/* ============ SARANA & FASILITAS OLAHRAGA LENGKAP ============ */}
        <section className="px-4 py-10">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Sarana Prasarana</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Fasilitas Penunjang Pembelajaran PJOK
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Dukungan sarana olahraga berstandar turnamen untuk mengoptimalkan kebugaran fisik dan prestasi atletik.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FACILITIES_LIST.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="glass-shell ring-1 ring-black/5 group overflow-hidden">
                    <div className="bezel-core p-0! overflow-hidden rounded-[1.5rem] h-64 relative bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.image}
                        alt={f.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                      <div className="absolute top-4 left-4 p-2 rounded-xl bg-white/20 backdrop-blur-md ring-1 ring-white/30 text-white">
                        <Icon size={18} />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-5">
                        <p className="text-white text-sm font-bold leading-tight">{f.title}</p>
                        <p className="text-white/80 text-[11px] mt-1 line-clamp-2 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ KONTAK & PETA LOKASI SEKOLAH ============ */}
        <section className="px-4 py-10" id="lokasi">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Aksesibilitas</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Lokasi &amp; Kontak Resmi SMAN 6 Garut
              </h2>
            </div>

            <div className="glass-shell ring-1 ring-black/5 bg-white/70">
              <div className="bezel-core p-6 sm:p-8 grid lg:grid-cols-2 gap-8 bg-white/95">
                {/* Contact Card */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-900">Sekretariat &amp; Administrasi Sekolah</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Untuk keperluan konsultasi akademik, kemitraan, maupun administrasi kepesertadidikan, silakan
                      hubungi kami melalui saluran resmi berikut.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <a
                      href="mailto:sman_6garut@yahoo.co.id"
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 ring-1 ring-slate-200 transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Mail size={16} />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Resmi</p>
                        <p className="text-sm font-semibold text-slate-800">sman_6garut@yahoo.co.id</p>
                      </div>
                    </a>

                    <a
                      href="tel:0262231509"
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 ring-1 ring-slate-200 transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Phone size={16} />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Telepon Kantor</p>
                        <p className="text-sm font-semibold text-slate-800">(0262) 231509</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                      <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <MapPin size={16} />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Alamat Kampus</p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                          Jl. Guntur Melati No. 12, Kel. Haurpanggung, Kec. Tarogong Kidul, Garut, Jawa Barat 44151
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-3">
                    <PrimaryButton href="/login">Masuk Portal Belajar</PrimaryButton>
                    <SecondaryButton href="/">Kembali ke Beranda</SecondaryButton>
                  </div>
                </div>

                {/* Google Maps Embed */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">Peta Satelit &amp; Rute</p>
                    <a
                      href="https://maps.google.com/?q=SMA+Negeri+6+Garut"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Buka Google Maps ↗
                    </a>
                  </div>
                  <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner bg-slate-100">
                    <iframe
                      title="Lokasi SMAN 6 Garut"
                      src="https://maps.google.com/maps?q=SMA+Negeri+6+Garut,+Tarogong+Kidul,+Garut&t=&z=16&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full grayscale-[0.2] contrast-[1.05]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
