export type Creator = {
  name: string;
  nim: string;
  prodi: string;
  campus: string;
  initials: string;
  accent: string;
  photo: string;
  photoPosition?: string;
};

// Keep the placeholder as a graceful fallback when a portrait cannot load.
export const CREATOR_PLACEHOLDER = "/images/creators/portrait-placeholder.svg";

export const CREATORS: Creator[] = [
  {
    name: "Ahmad Dafi",
    nim: "26572013002",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "AD",
    accent: "#3b82f6",
    photo: "/images/creators/ahmad-dafi.webp",
    photoPosition: "center 55%",
  },
  {
    name: "Misya Nafisya",
    nim: "26572013005",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "MN",
    accent: "#c084fc",
    photo: "/images/creators/misya-nafisya.webp",
    photoPosition: "center 38%",
  },
  {
    name: "Qori Salsabil Mauliddina",
    nim: "26572013003",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "QS",
    accent: "#2dd4bf",
    photo: "/images/creators/qori-salsabil.webp",
    photoPosition: "center 34%",
  },
  {
    name: "Muhammad Rafli",
    nim: "26572013004",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "MR",
    accent: "#fbbf24",
    photo: "/images/creators/muhammad-rafli.webp",
    photoPosition: "center 56%",
  },
  {
    name: "Bayu Raihan",
    nim: "2657201073009",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "BR",
    accent: "#38bdf8",
    photo: "/images/creators/bayu-raihan.webp",
    photoPosition: "center 66%",
  },
];
