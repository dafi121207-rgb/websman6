import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import PublicFooter from "@/components/PublicFooter";
import SchoolVideoHero from "@/components/SchoolVideoHero";
import SchoolGallery from "@/components/SchoolGallery";
import ModuleRows from "@/components/ModuleRows";
import NewsRows from "@/components/NewsRows";
import ReflectiveCreatorCard from "@/components/reflective-card/ReflectiveCreatorCard";
import { CREATORS } from "@/data/creators";
import { ACHIEVEMENTS, SCHOOL_PHOTOS } from "@/data/school-gallery";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [profile, modules, news] = await Promise.all([
    prisma.schoolProfile.findUnique({ where: { id: "sman6garut" } }),
    prisma.module.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }], take: 3 }),
    prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  return <PublicShell>
    <main id="main-content" className="public-main">
      <SchoolVideoHero tagline={profile?.tagline ?? "Mandiri, kompetitif, dan berwawasan lingkungan"} />

      <section id="tujuan" className="site-section purpose-section"><div className="site-container purpose-layout">
        <div><p className="eyebrow">Tujuan web pembelajaran</p><h2 className="section-title">Belajar di kelas.<br />Bergerak di lapangan.</h2><p className="section-intro">Materi PJOK, video, dan e-book untuk mendukung pembelajaran di SMAN 6 Garut.</p></div>
        <ol className="purpose-list">{[
          ["Pelajari materi", "Baca materi dan e-book kapan saja."],
          ["Pahami gerakan", "Gunakan video sebagai panduan praktik."],
          ["Ikuti pembelajaran", "Akses kuis, tugas, dan absensi melalui akun siswa."],
        ].map(([title, text], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
      </div></section>

      <section id="materi" className="site-section section-tint"><div className="site-container">
        <div className="section-heading"><div><p className="eyebrow">Ruang belajar</p><h2 className="section-title">Modul PJOK</h2><p className="section-intro">Terbuka untuk dibaca, tanpa perlu masuk.</p></div><Link href="/modul" className="text-link">Semua modul <ArrowRight size={18} /></Link></div>
        <ModuleRows modules={modules} />
      </div></section>

      <section id="sekolah" className="site-section"><div className="site-container">
        <div className="section-heading"><div><p className="eyebrow">Sekolah kami</p><h2 className="section-title">Ruang untuk tumbuh.</h2></div><Link href="/profil-sekolah" className="text-link">Profil sekolah <ArrowRight size={18} /></Link></div>
        <SchoolGallery photos={SCHOOL_PHOTOS} />
        <div id="visi" className="vision-line"><span>Visi sekolah</span><p>{profile?.vision ?? "Mandiri, kompetitif, dan berwawasan lingkungan"}</p><Link href="/profil-sekolah#visi-misi" aria-label="Baca visi dan misi sekolah"><ArrowUpRight size={24} /></Link></div>
      </div></section>

      <section id="prestasi" className="site-section section-tint"><div className="site-container"><div className="section-heading"><div><p className="eyebrow">Prestasi siswa</p><h2 className="section-title">Dari sekolah, untuk prestasi.</h2></div></div><SchoolGallery photos={ACHIEVEMENTS} posters /></div></section>

      <section id="berita" className="site-section"><div className="site-container news-layout"><div><p className="eyebrow">Kabar sekolah</p><h2 className="section-title">Berita & agenda</h2><Link href="/berita" className="text-link mt-6">Semua berita <ArrowRight size={18} /></Link></div><NewsRows news={news} /></div></section>

      <section id="tim-pembuat" className="site-section section-tint"><div className="site-container"><div className="section-heading"><div><p className="eyebrow">Profil pembuat</p><h2 className="section-title">Di balik website ini.</h2><p className="section-intro">Sistem Informasi · Institut Pendidikan Indonesia</p></div></div><div className="creator-grid">{CREATORS.map((creator) => <ReflectiveCreatorCard key={creator.name} creator={creator} />)}</div></div></section>

      <section id="kontak" className="site-section"><div className="site-container contact-layout"><div><p className="eyebrow">Kontak & lokasi</p><h2 className="section-title">SMAN 6 Garut</h2><address className="school-contact"><p><MapPin size={19} /><span><strong>Alamat sekolah</strong>Jl. Guntur Melati No. 12, Tarogong Kidul, Garut, Jawa Barat</span></p>{profile?.email && <a href={`mailto:${profile.email}`}><Mail size={19} />{profile.email}</a>}{profile?.phone && <a href={`tel:${profile.phone}`}><Phone size={19} />{profile.phone}</a>}</address><a href="https://maps.google.com/?q=SMA+Negeri+6+Garut" target="_blank" rel="noopener noreferrer" className="text-link">Petunjuk arah <ArrowUpRight size={18} /></a></div><iframe title="Lokasi SMAN 6 Garut di Google Maps" src="https://maps.google.com/maps?q=SMA+Negeri+6+Garut,+Tarogong+Kidul,+Garut&t=&z=16&ie=UTF8&iwloc=&output=embed" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="school-map" /></div></section>
    </main>
    <PublicFooter />
  </PublicShell>;
}
