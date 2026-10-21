import Link from "next/link";

export default function PublicFooter() {
  return <footer className="site-footer"><div className="site-container footer-inner"><div><Link href="/" className="font-bold">SMAN 6 Garut</Link><p>Media pembelajaran PJOK</p></div><nav aria-label="Tautan footer"><Link href="/#tujuan">Tujuan web</Link><Link href="/#tim-pembuat">Profil pembuat</Link><Link href="/#kontak">Kontak</Link></nav><p>© {new Date().getFullYear()} SMAN 6 Garut</p></div></footer>;
}
