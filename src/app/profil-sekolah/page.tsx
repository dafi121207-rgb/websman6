import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import PublicFooter from "@/components/PublicFooter";
import SchoolGallery from "@/components/SchoolGallery";
import { SCHOOL_PHOTOS } from "@/data/school-gallery";
import prisma from "@/lib/prisma";
import TataTertibTabs from "./TataTertibTabs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil sekolah", description: "Identitas, sejarah, visi, misi, tata tertib, dan lingkungan SMA Negeri 6 Garut." };
const IDENTITY = [
  ["Nama sekolah", "SMA Negeri 6 Garut"], ["NPSN", "20227475"],
  ["Tahun berdiri", "1984"], ["Status", "Negeri"], ["Jenjang", "Sekolah Menengah Atas (SMA)"],
  ["Akreditasi", "A"], ["Kurikulum", "Kurikulum Merdeka"],
  ["Naungan", "Dinas Pendidikan Provinsi Jawa Barat (KCD Wilayah XI)"], ["Alamat sekolah", "Jl. Guntur Melati No. 12, Haurpanggung, Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151"],
];


const HISTORY = [
  { year: "1984", title: "Pendirian sekolah", detail: "Kemendikdasmen mencatat SK pendirian dan SK operasional bernomor 0558/0/1984, bertanggal 20 November 1984. Menurut catatan profil tahun 2010, nama awalnya SMA Negeri 2 Garut." },
  { year: "1986–1988", title: "Gedung di Jalan Guntur Melati", detail: "Catatan profil tahun 2010 menyebut gedung di Jalan Guntur Melati mulai digunakan pada 1986. Kegiatan belajar masih berlangsung di dua lokasi, termasuk gedung lama di Jalan Nusa Indah, hingga 1988." },
  { year: "1998–2007", title: "Perubahan nama sekolah", detail: "Menurut catatan profil yang sama, sekolah berganti nama menjadi SMA Negeri 2 Tarogong pada 1998, SMUN 2 Tarogong pada 2001, lalu SMA Negeri 2 Tarogong Kidul pada 2004. Nama SMA Negeri 6 Garut mulai digunakan pada 2007." },
  { year: "2017", title: "Alih kelola ke Pemerintah Provinsi", detail: "Pengelolaan SMA dan SMK negeri di Jawa Barat beralih dari kabupaten/kota ke pemerintah provinsi sebagai pelaksanaan UU Nomor 23 Tahun 2014. Kabupaten Garut masuk wilayah kerja Cabang Dinas Pendidikan Wilayah XI." },
  { year: "2021–2022", title: "Akreditasi dan Kurikulum Merdeka", detail: "Riwayat akreditasi mencatat peringkat A pada 2016 dan 2021. Pada 2022, SMAN 6 Garut tercantum dalam daftar satuan pendidikan pelaksana Implementasi Kurikulum Merdeka tahap II." },
] as const;

const HISTORY_SOURCES = [
  ["Data Kemendikdasmen", "https://referensi.data.kemendikdasmen.go.id/tabs.php?npsn=20227475"],
  ["Selayang Pandang (2010)", "https://sman6garut.blogspot.com/2010/10/selayang-pandang_20.html"],
  ["Alih kelola SMA/SMK", "https://bappeda.jabarprov.go.id/pertama-kali-dalam-sejarah-gubernur-kukuhkan-kepala-sekolah-smasmk-negeri/"],
  ["Wilayah KCD", "https://jdih.jabarprov.go.id/page/eksekusi_download/32/2021pg00320045.pdf"],
  ["Riwayat akreditasi", "https://ban-pdm.id/satuanpendidikan/20227475"],
  ["SK Kurikulum Merdeka", "https://smpn1punggur.sch.id/wp-content/uploads/2022/06/027_H_KR_2022-SK-Kabadan-tentang-Satuan-Pendidikan-Pelaksana-Implementasi-Tahap-II.pdf"],
] as const;

export default async function ProfilSekolahPage() {
  const profile = await prisma.schoolProfile.findUnique({ where: { id: "sman6garut" } });
  let missions: string[] = [];
  try { const value: unknown = JSON.parse(profile?.mission ?? "[]"); if (Array.isArray(value)) missions = value.filter((item): item is string => typeof item === "string"); } catch { /* Keep the rest of the profile readable if mission data is invalid. */ }
  return <PublicShell><main id="main-content" className="public-main">
    <header className="page-heading"><div className="site-container"><Link href="/" className="breadcrumb"><ArrowLeft size={14} /> Beranda</Link><p className="eyebrow">Profil sekolah</p><h1>SMA Negeri 6 Garut</h1><p className="section-intro">Tarogong Kidul, Kabupaten Garut, Jawa Barat.</p></div></header>
    <section className="site-section"><div className="site-container">
      <figure className="school-principal" aria-labelledby="principal-name">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/school/kepala-sekolah-suharto.webp" alt="M. E. Suharto, S.Sos., M.Pd., Kepala SMA Negeri 6 Garut" width={640} height={1001} loading="lazy" decoding="async" />
        <figcaption>
          <p className="eyebrow">Kepala sekolah</p>
          <h2 id="principal-name">M. E. Suharto, S.Sos., M.Pd.</h2>
          <p className="principal-school">SMA Negeri 6 Garut</p>
        </figcaption>
      </figure>
      <dl className="identity-grid mt-8">{IDENTITY.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></section>
    <section id="sejarah" className="site-section border-t border-slate-200" aria-labelledby="sejarah-title">
      <div className="site-container">
        <h2 id="sejarah-title" className="section-title">Sejarah SMAN 6 Garut</h2>
        <ol className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {HISTORY.map(({ year, title, detail }) => (
            <li key={year} className="grid gap-1.5 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5 sm:py-6">
              <p className="font-bold tabular-nums text-[#2356a4]">{year}</p>
              <div>
                <h3 className="text-base font-bold text-[#17324d] sm:text-lg">{title}</h3>
                <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-slate-600 sm:text-base">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <details className="mt-4 text-sm text-slate-600">
          <summary className="w-fit cursor-pointer py-2 font-semibold text-[#17324d]">Sumber sejarah</summary>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-3 pb-2">
            {HISTORY_SOURCES.map(([label, url]) => <li key={url}><a className="text-[#2356a4] underline underline-offset-4" href={url}>{label}</a></li>)}
          </ul>
        </details>
      </div>
    </section>
    <section id="visi-misi" className="site-section section-tint"><div className="site-container purpose-layout"><div><p className="eyebrow">Visi sekolah</p><h2 className="section-title">{profile?.vision ?? "Mandiri, kompetitif, dan berwawasan lingkungan"}</h2></div><div><p className="eyebrow">Misi sekolah</p><ol className="mission-list">{missions.map((mission,i) => <li key={i}>{mission}</li>)}</ol></div></div></section>
    <section id="tata-tertib" className="site-section"><div className="site-container"><div className="section-heading"><div><p className="eyebrow">Kehidupan sekolah</p><h2 className="section-title">Tata tertib siswa</h2></div></div><TataTertibTabs /></div></section>
    <section className="site-section section-tint"><div className="site-container section-heading"><div><p className="eyebrow">Pembelajaran PJOK</p><h2 className="section-title">Siap untuk belajar?</h2></div><Link href="/modul" className="site-button">Buka modul <ArrowRight size={18} /></Link></div></section>
    <section className="site-section" aria-label="Foto lingkungan sekolah"><div className="site-container"><SchoolGallery photos={SCHOOL_PHOTOS} /></div></section>
  </main><PublicFooter /></PublicShell>;
}
