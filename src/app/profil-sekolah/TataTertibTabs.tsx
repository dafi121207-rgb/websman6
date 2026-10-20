"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ShieldAlert,
  HeartHandshake,
  BookMarked,
  Scale,
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
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Buttons */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-200/60 border border-slate-300/60">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Icon size={16} className={isActive ? "text-blue-600" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Box */}
      <div className="glass-shell ring-1 ring-black/5 bg-white/80 shadow-md">
        <div className="bezel-core p-6 sm:p-8 bg-white/95 space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
            <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ring-1 ring-blue-100">
              <CurrentIcon size={24} />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{current.label}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{current.description}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {current.points.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/40 hover:border-blue-200 transition-colors"
              >
                <span className="shrink-0 w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 font-bold text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
            <span>Standar Operasional Prosedur (SOP) Tata Tertib Siswa SMAN 6 Garut</span>
            <span className="font-semibold text-slate-500">MANDIRI & BERKARAKTER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
