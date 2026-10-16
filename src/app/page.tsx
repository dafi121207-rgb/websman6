import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Dumbbell,
  HeartPulse,
  Mail,
  MapPin,
  Medal,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PublicShell from "@/components/PublicShell";
import { Badge, PrimaryButton, SecondaryButton } from "@/components/ui";
import LandingAnimations from "@/components/LandingAnimations";
import { ParallaxLayers, ParallaxLayer } from "@/components/ParallaxLayers";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getLandingData() {
  const [profile, news, modules] = await Promise.all([
    prisma.schoolProfile.findUnique({ where: { id: "sman6garut" } }),
    prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.module.findMany({ orderBy: { order: "asc" }, take: 6 }),
  ]);
  if (!profile) throw new Error("Profil sekolah belum di-seed");
  return { profile, news, modules };
}

const FACILITIES = [
  {
    label: "Lapangan Futsal & Basket",
    desc: "Lantai interlock regulasi dengan pencahayaan LED",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Lapangan Voli & Bulutangkis",
    desc: "Area multi-lapangan outdoor dengan jaring standar turnamen",
    icon: Medal,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Area Lari & Atletik",
    desc: "Lintasan lari 400m untuk sprint, estafet, dan daya tahan",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Aula & Senam Ritmik",
    desc: "Hall indoor berlantai kayu fleksibel dan matras keselamatan",
    icon: HeartPulse,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  },
];

const ATHLETE_PROGRAMS = [
  {
    label: "Atletik & Kebugaran",
    desc: "Contoh konten latihan teknik dasar, kecepatan, dan daya tahan.",
    image: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Permainan Bola",
    desc: "Contoh konten latihan koordinasi dan kerja sama tim.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Latihan Kebugaran",
    desc: "Contoh konten latihan kekuatan dan kelenturan tubuh.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  },
];

export default async function LandingPage() {
  const { profile, news, modules } = await getLandingData();
  const missions: string[] = JSON.parse(profile.mission);

  return (
    <PublicShell>
      <LandingAnimations />
      <main className="pt-28 pb-16">
        {/* ============ HERO DENGAN PARALLAX LAYERS ============ */}
        <section className="px-4 pb-16 relative">
          <ParallaxLayers pointer={true} direction="vertical" className="max-w-5xl mx-auto">
            {/* Background Layer: Ambient Orbs & Subtle Depth Rings (depth 0.8) */}
            <ParallaxLayer depth={0.8} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20">
              <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-blue-300/25 blur-3xl" />
              <div className="absolute top-12 right-1/4 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl" />
              <div className="absolute -top-6 right-8 w-36 h-36 rounded-2xl border border-blue-400/20 rotate-12 hidden md:block" />
            </ParallaxLayer>

            {/* Midground Layer: Decorative Sports Feature Badges (depth 0.4) */}
            <ParallaxLayer depth={0.4} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="hidden lg:flex items-center gap-2 absolute top-10 -left-6 px-3.5 py-2 rounded-xl bg-white/75 border border-stone-200/80 shadow-xs text-xs font-bold text-slate-700 backdrop-blur-md -rotate-6">
                <Dumbbell size={15} className="text-blue-600" />
                <span>Kebugaran Jasmani</span>
              </div>
              <div className="hidden lg:block absolute top-24 -right-6 w-48 h-32 overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-white/80 rotate-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=640&q=80"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-white">
                  <Medal size={15} className="shrink-0 text-amber-300" />
                  <span className="text-xs font-bold leading-tight">Pembinaan Atlet Pelajar</span>
                </div>
              </div>
            </ParallaxLayer>

            {/* Content Layer: Main Title, Description & Action Buttons (depth 0) */}
            <ParallaxLayer depth={0} className="relative z-10">
              <div className="text-center mb-12">
                <h1 className="hero-anim-title text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
                  SMAN 6 <span className="text-blue-600">GARUT</span>
                </h1>
                <p className="hero-anim-title mt-4 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                  {profile.tagline}
                </p>
                <div className="hero-anim-cta mt-8 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3.5">
                  <PrimaryButton icon={ArrowRight} href="/login" className="w-full sm:w-auto min-h-11">
                    Masuk sebagai Siswa / Guru
                  </PrimaryButton>
                  <SecondaryButton href="#materi" className="w-full sm:w-auto min-h-11">
                    Jelajahi Modul Pembelajaran
                  </SecondaryButton>
                </div>
              </div>

              {/* Visi card */}
              <div className="max-w-3xl mx-auto visi-card-anim" id="visi">
                <div className="glass-shell ring-1 ring-black/5 shadow-2xl bg-white/80 backdrop-blur-xl">
                  <div className="bezel-core p-8 sm:p-10 text-center relative overflow-hidden bg-white/95">
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
                    <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">
                      Visi Sekolah
                    </p>
                    <h2 className="mt-3 text-xl sm:text-3xl font-extrabold leading-snug text-slate-900">
                      {profile.vision}
                    </h2>
                    <div className="mt-6 flex flex-wrap justify-center gap-2.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                        <ShieldCheck size={14} className="text-emerald-600" /> Terakreditasi &amp; Berstandar
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                        <Award size={14} className="text-amber-600" /> Sekolah Pembina Atlet Unggul
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ParallaxLayer>
          </ParallaxLayers>
        </section>

        {/* ============ MISI BENTO ============ */}
        <section className="px-4 py-14">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Misi Sekolah</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-900">
                6 Pilar Pembentukan Karakter &amp; Prestasi
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {missions.map((m, i) => (
                <div
                  key={i}
                  className="gsap-reveal misi-card glass-shell ring-1 ring-black/5 bg-white/70"
                >
                  <div className="bezel-core p-4 sm:p-6 h-full bg-white/95 flex items-start gap-3 sm:gap-4">
                    <span className="shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-600/25">
                      {i + 1}
                    </span>
                    <p className="min-w-0 break-words text-[13px] sm:text-sm leading-relaxed text-slate-600 font-normal">{m}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ MODUL PJOK ============ */}
        <section className="px-4 py-14" id="materi">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Kurikulum &amp; Materi</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-900">Modul PJOK Interaktif</h2>
              <p className="mt-2 text-slate-500 text-sm max-w-md mx-auto">
                Silabus per cabang olahraga, kuis pemahaman materi, presensi lapangan, dan tugas praktik berbasis video.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {modules.map((mod) => (
                <div key={mod.id} className="gsap-reveal misi-card glass-shell ring-1 ring-black/5 bg-white/70">
                  <div className="bezel-core p-6 h-full flex flex-col bg-white/95">
                    <div className="flex items-center justify-between mb-3">
                      <Badge tone="slate">{mod.category}</Badge>
                      <BookOpen size={16} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{mod.title}</h3>
                    <p className="mt-2 text-[13px] text-slate-500 line-clamp-2 flex-1">{mod.description}</p>
                    <Link
                      href="/login"
                      className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:gap-2.5 transition-all w-fit"
                    >
                      Akses Materi Pembelajaran <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ BERITA ============ */}
        <section className="px-4 py-14" id="berita">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Informasi Terkini</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-900">Berita &amp; Agenda PJOK</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {news.map((n) => (
                <div key={n.id} className="gsap-reveal misi-card glass-shell ring-1 ring-black/5 h-full bg-white/70">
                  <div className="bezel-core p-6 h-full flex flex-col bg-white/95">
                    <p className="text-[11px] font-medium text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h3 className="mt-2 font-bold text-slate-900 leading-snug text-base">{n.title}</h3>
                    <p className="mt-2 text-[13px] text-slate-500 line-clamp-3 flex-1">{n.content}</p>
                  </div>
                </div>
              ))}
              {news.length === 0 && (
                <p className="text-slate-400 text-sm text-center col-span-3">Belum ada berita yang dipublikasikan.</p>
              )}
            </div>
          </div>
        </section>

        {/* ============ GALERI FASILITAS (PHOTO BACKGROUNDS) ============ */}
        <section className="px-4 py-14">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Sarana Prasarana</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-900">Fasilitas Olahraga Lengkap</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                Didukung sarana berstandar untuk menunjang kebugaran jasmani dan pembinaan atlet pelajar berprestasi.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FACILITIES.map((f) => (
                <div key={f.label} className="gsap-reveal glass-shell ring-1 ring-black/5 group overflow-hidden">
                  <div className="bezel-core! p-0 overflow-hidden rounded-[1.5rem] h-64 relative">
                    {/* Background Photo */}
                    <img
                      src={f.image}
                      alt={f.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Scrim overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                    {/* Top Icon Badge */}
                    <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-white/20 backdrop-blur-md ring-1 ring-white/30 text-white">
                      <f.icon size={20} />
                    </div>
                    {/* Bottom Content */}
                    <div className="absolute bottom-0 inset-x-0 p-5">
                      <p className="text-white text-base font-bold leading-tight drop-shadow-sm">{f.label}</p>
                      <p className="text-white/80 text-[12px] mt-1 line-clamp-2 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PEMBINAAN ATLET PELAJAR ============ */}
        <section className="px-4 py-14">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Pembinaan Atlet Pelajar
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                Gambaran awal kegiatan olahraga. Foto dan deskripsi berikut masih berupa konten ilustrasi.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ATHLETE_PROGRAMS.map((program) => (
                <article key={program.label} className="glass-shell ring-1 ring-black/5 group overflow-hidden">
                  <div className="bezel-core p-0! overflow-hidden rounded-[1.5rem] relative h-64">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={program.image}
                      alt={`Foto ilustrasi ${program.label}`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700">
                      Foto ilustrasi
                    </span>
                    <div className="absolute bottom-0 inset-x-0 p-5">
                      <h3 className="text-white text-lg font-bold leading-tight">{program.label}</h3>
                      <p className="text-white/85 text-sm mt-1 leading-relaxed">{program.desc}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ KONTAK + GOOGLE MAPS / FOOTER ============ */}
        <footer className="px-4 pt-10 pb-16" id="kontak">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Contact Details & Map Card */}
            <div className="gsap-reveal glass-shell ring-1 ring-black/5 bg-white/70">
              <div className="bezel-core p-6 sm:p-8 grid lg:grid-cols-2 gap-8 bg-white/95">
                {/* Left: Contact Info */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase">Kontak Resmi</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-slate-900">Hubungi SMAN 6 Garut</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                      Layanan administrasi dan informasi pembelajaran PJOK SMA Negeri 6 Garut. Silakan hubungi kami melalui saluran berikut.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 ring-1 ring-slate-200 transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                        <Mail size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Resmi</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{profile.email}</p>
                      </div>
                    </a>

                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 ring-1 ring-slate-200 transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                        <Phone size={16} />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Telepon Kantor</p>
                        <p className="text-sm font-semibold text-slate-800">{profile.phone}</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                      <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <MapPin size={16} />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Alamat Kampus</p>
                        <p className="text-sm font-semibold text-slate-800">
                          Jl. Guntur Melati No. 12, Tarogong Kidul, Garut, Jawa Barat
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Embedded Google Maps */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">Lokasi Sekolah</p>
                    <a
                      href="https://maps.google.com/?q=SMA+Negeri+6+Garut"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Buka di Google Maps ↗
                    </a>
                  </div>
                  <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner bg-slate-100 relative">
                    <iframe
                      title="Lokasi SMAN 6 Garut di Google Maps"
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

            {/* Bottom Credits */}
            <p className="text-center text-xs text-slate-400 pt-4">
              © {new Date().getFullYear()} SMAN 6 Garut · Portal Pembelajaran Digital PJOK · MANDIRI, KOMPETITIF, DAN BERWAWASAN LINGKUNGAN
            </p>
          </div>
        </footer>
      </main>
    </PublicShell>
  );
}
