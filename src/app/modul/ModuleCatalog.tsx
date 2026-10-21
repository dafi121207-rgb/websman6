"use client";

import { useMemo, useState } from "react";
import ModuleRows, { type PublicModule } from "@/components/ModuleRows";

export default function ModuleCatalog({ modules }: { modules: PublicModule[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = useMemo(() => [...new Set(modules.map((mod) => mod.category))], [modules]);
  const filtered = modules.filter((mod) => (!category || mod.category === category) && `${mod.title} ${mod.description} ${mod.category}`.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")));
  return <><div className="filter-bar"><label htmlFor="module-search">Cari materi<input id="module-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Judul atau topik materi" /></label><label htmlFor="module-category">Kategori<select id="module-category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Semua kategori</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div><p className="text-sm text-slate-500 mb-5" role="status">{filtered.length} modul tersedia</p>{filtered.length ? <ModuleRows modules={filtered} /> : <div className="empty-state"><p>{modules.length ? "Modul tidak ditemukan. Coba kata kunci lain." : "Materi pembelajaran akan ditampilkan di sini."}</p>{modules.length > 0 && <button type="button" className="text-link mt-3" onClick={() => { setQuery(""); setCategory(""); }}>Reset pencarian</button>}</div>}</>;
}
