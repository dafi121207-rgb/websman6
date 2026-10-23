"use client";

import {
  CheckCircle2,
  ShieldAlert,
  HeartHandshake,
  BookMarked,
  Scale,
  ChevronDown,
} from "lucide-react";

const TABS = [
  {
    id: "kewajiban",
    label: "Kewajiban Siswa",
    icon: CheckCircle2,
    description: "Pedoman kedisiplinan dan tanggung jawab setiap peserta didik SMAN 6 Garut.",
    points: [
      "Hadir di sekolah selambat-lambatnya pukul 06.45 WIB sebelum bel masuk berbunyi dan kegiatan belajar dimulai pukul 07.00 WIB.",
      "Mengenakan seragam resmi sekolah sesuai ketentuan hari (Senin-Selasa: Putih Abu lengkap atribut; Rabu: Pramuka; Kamis: Batik/Khas; Jumat: Busana Muslim/Olahraga) dalam kondisi rapi dan bersih.",
      "Mengikuti upacara bendera hari Senin serta peringatan hari besar nasional dengan tertib, khidmat, dan berseragam lengkap.",
      "Mengikuti seluruh kegiatan pembelajaran intrakurikuler dan kokurikuler, termasuk praktikum olahraga dan penilaian berkala.",
      "Menjaga kebersihan, keindahan, ketertiban, dan kelestarian lingkungan sekolah sesuai budaya sekolah berwawasan lingkungan.",
      "Menjunjung tinggi nama baik dan kehormatan almamater SMAN 6 Garut, baik di dalam maupun di luar lingkungan sekolah.",
    ],
  },
  {
    id: "hak",
    label: "Hak Peserta Didik",
    icon: BookMarked,
    description: "Jaminan hak belajar, pengembangan diri, dan perlindungan bagi seluruh siswa.",
    points: [
      "Mendapatkan perlakuan yang adil, setara, dan humanis tanpa diskriminasi latar belakang suku, agama, ras, maupun status sosial.",
      "Mengikuti seluruh proses pembelajaran dan memperoleh bimbingan akademik maupun non-akademik dari dewan guru.",
      "Memanfaatkan sarana prasarana sekolah, laboratorium komputer, perpustakaan, serta fasilitas lapangan olahraga berstandar.",
      "Memilih dan aktif dalam kegiatan ekstrakurikuler serta pembinaan prestasi atlet pelajar sesuai minat dan bakat.",
      "Memperoleh layanan Bimbingan dan Konseling (BK) untuk pengembangan kepribadian, karier, dan pemecahan kendala belajar.",
      "Mendapatkan perlindungan dari tindakan kekerasan fisik, intimidasi, pelecehan, maupun perundungan (bullying).",
    ],
  },
  {
    id: "sopan-santun",
    label: "Norma & Sopan Santun",
    icon: HeartHandshake,
    description: "Budaya positif dan etika pergaulan warga sekolah yang beradab.",
    points: [
      "Membiasakan budaya 5S (Senyum, Salam, Sapa, Sopan, dan Santun) kepada kepala sekolah, bapak/ibu guru, staf tata usaha, sesama siswa, dan tamu sekolah.",
      "Menghargai perbedaan pendapat, menjunjung tinggi toleransi, dan tidak memaksakan kehendak kepada orang lain.",
      "Menggunakan bahasa Indonesia yang baik, santun, dan tidak mengeluarkan kata-kata kasar, kotor, bernada mengejek, atau bernuansa SARA.",
      "Membiasakan diri mengucapkan kata 'Tolong' saat meminta bantuan, 'Maaf' saat berbuat salah, dan 'Terima Kasih' atas kebaikan orang lain.",
      "Menghormati hak privasi dan hak milik sesama warga sekolah tanpa mengambil atau merusak barang milik orang lain.",
    ],
  },
  {
    id: "larangan",
    label: "Larangan Keras",
    icon: ShieldAlert,
    description: "Tindakan indisipliner yang dilarang keras demi keamanan dan ketertiban bersama.",
    points: [
      "Dilarang membawa, mengonsumsi, mengedarkan rokok konvensional maupun rokok elektronik (vape) di lingkungan dan radius sekitar sekolah.",
      "Dilarang membawa, mengedarkan, atau mengonsumsi minuman keras, narkotika, psikotropika, dan zat adiktif berbahaya lainnya.",
      "Dilarang membawa senjata tajam, senjata api, atau benda tajam lainnya yang dapat membahayakan keselamatan diri dan orang lain.",
      "Dilarang melakukan perundungan (bullying) fisik, verbal, relasional, maupun cyber-bullying di media sosial.",
      "Dilarang terlibat perkelahian, tawuran antarpelajar, atau bergabung dengan geng/kelompok bermotor yang meresahkan.",
      "Dilarang melakukan vandalisme, mencoret-coret meja, kursi, dinding, dan merusak fasilitas sarana olahraga sekolah.",
      "Dilarang membawa, menyimpan, atau menyebarkan media yang mengandung unsur pornografi dan konten asusila.",
    ],
  },
  {
    id: "sanksi",
    label: "Sanksi Berjenjang",
    icon: Scale,
    description: "Mekanisme penegakan tata tertib yang bersifat edukatif dan proporsional.",
    points: [
      "Tingkat I (Pelanggaran Ringan): Teguran lisan, pencatatan di buku pembinaan, dan nasihat langsung oleh guru atau wali kelas.",
      "Tingkat II (Pelanggaran Sedang): Peringatan tertulis, penugasan edukatif yang bernilai pembiasaan karakter positif, serta pembinaan oleh guru BK.",
      "Tingkat III (Pelanggaran Berulang): Pemanggilan resmi orang tua/wali siswa ke sekolah untuk penandatanganan surat perjanjian pembinaan.",
      "Tingkat IV (Pelanggaran Berat): Skorsing sementara dari kegiatan belajar tatap muka selama kurun waktu tertentu disertai tugas mandiri.",
      "Tingkat V (Pelanggaran Sangat Berat): Rapat dewan guru dan pengembalian pembinaan peserta didik kepada orang tua/wali murid secara resmi.",
    ],
  },
];

export default function TataTertibTabs() {
  return (
    <div className="rules-list overflow-hidden rounded-xl border border-slate-200 bg-white">
      {TABS.map((tab, index) => {
        const Icon = tab.icon;
        return <details key={tab.id} name="school-rules" open={index === 0} className="group border-b border-slate-200 last:border-0">
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-4 outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-blue-600 sm:px-6">
            <Icon size={20} className="shrink-0 text-blue-700" aria-hidden="true" />
            <h3 className="min-w-0 flex-1 text-sm font-bold text-slate-900 sm:text-base">{tab.label}</h3>
            <span className="shrink-0 text-xs text-slate-500">{tab.points.length} poin</span>
            <ChevronDown size={18} className="rules-chevron shrink-0 text-slate-500 transition-transform" aria-hidden="true" />
          </summary>
          <div className="px-4 pb-3 sm:px-6">
            <ol className="divide-y divide-slate-100 border-t border-slate-200">
              {tab.points.map((point, i) => <li key={point} className="flex gap-4 py-4">
                <span aria-hidden="true" className="w-5 shrink-0 pt-0.5 text-xs font-bold tabular-nums text-blue-700">{String(i + 1).padStart(2, "0")}</span>
                <p className="max-w-3xl text-sm leading-7 text-slate-700">{point}</p>
              </li>)}
            </ol>
          </div>
        </details>;
      })}
    </div>
  );
}
