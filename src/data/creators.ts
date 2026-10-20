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

// Replace a member's photo with a local path when their portrait is available.
export const CREATOR_PLACEHOLDER = "/images/creators/portrait-placeholder.svg";

export const CREATORS: Creator[] = [
  {
    name: "Ahmad Dafi",
    nim: "26572013002",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "AD",
    accent: "#3b82f6",
    photo: CREATOR_PLACEHOLDER,
  },
  {
    name: "Misya Nafisya",
    nim: "26572013005",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "MN",
    accent: "#c084fc",
    photo: CREATOR_PLACEHOLDER,
  },
  {
    name: "Qori Salsabil Mauliddina",
    nim: "26572013003",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "QS",
    accent: "#2dd4bf",
    photo: CREATOR_PLACEHOLDER,
  },
  {
    name: "Muhammad Rafli",
    nim: "26572013004",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "MR",
    accent: "#fbbf24",
    photo: CREATOR_PLACEHOLDER,
  },
  {
    name: "Bayu Raihan",
    nim: "2657201073009",
    prodi: "Sistem Informasi",
    campus: "Institut Pendidikan Indonesia",
    initials: "BR",
    accent: "#38bdf8",
    photo: CREATOR_PLACEHOLDER,
  },
];
