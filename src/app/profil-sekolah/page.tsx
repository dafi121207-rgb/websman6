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
export const metadata: Metadata = { title: "Profil sekolah", description: "Identitas, visi, misi, tata tertib, dan lingkungan SMA Negeri 6 Garut." };
const IDENTITY = [
  ["Nama sekolah", "SMA Negeri 6 Garut"], ["NPSN", "20227475"],
  ["Status", "Negeri"], ["Jenjang", "Sekolah Menengah Atas (SMA)"],
  ["Akreditasi", "A"], ["Kurikulum", "Kurikulum Merdeka"],
  ["Naungan", "Dinas Pendidikan Provinsi Jawa Barat"], ["Alamat sekolah", "Jl. Guntur Melati No. 12, Tarogong Kidul, Garut, Jawa Barat"],
];

export default async function ProfilSekolahPage() {
  const profile = await prisma.schoolProfile.findUnique({ where: { id: "sman6garut" } });
  let missions: string[] = [];
  try { const value: unknown = JSON.parse(profile?.mission ?? "[]"); if (Array.isArray(value)) missions = value.filter((item): item is string => typeof item === "string"); } catch { /* Keep the rest of the profile readable if mission data is invalid. */ }
  return <PublicShell><main id="main-content" className="public-main">
    <header className="page-heading"><div className="site-container"><Link href="/" className="breadcrumb"><ArrowLeft size={14} /> Beranda</Link><p className="eyebrow">Profil sekolah</p><h1>SMA Negeri 6 Garut</h1><p className="section-intro">Tarogong Kidul, Kabupaten Garut, Jawa Barat.</p></div></header>
    <section className="site-section"><div className="site-container"><SchoolGallery photos={SCHOOL_PHOTOS} /><dl className="identity-grid mt-8">{IDENTITY.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></section>
    <section id="visi-misi" className="site-section section-tint"><div className="site-container purpose-layout"><div><p className="eyebrow">Visi sekolah</p><h2 className="section-title">{profile?.vision ?? "Mandiri, kompetitif, dan berwawasan lingkungan"}</h2></div><div><p className="eyebrow">Misi sekolah</p><ol className="mission-list">{missions.map((mission,i) => <li key={i}>{mission}</li>)}</ol></div></div></section>
    <section id="tata-tertib" className="site-section"><div className="site-container"><div className="section-heading"><div><p className="eyebrow">Kehidupan sekolah</p><h2 className="section-title">Tata tertib siswa</h2></div></div><TataTertibTabs /></div></section>
    <section className="site-section section-tint"><div className="site-container section-heading"><div><p className="eyebrow">Pembelajaran PJOK</p><h2 className="section-title">Siap untuk belajar?</h2></div><Link href="/modul" className="site-button">Buka modul <ArrowRight size={18} /></Link></div></section>
  </main><PublicFooter /></PublicShell>;
}
