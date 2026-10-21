"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, Maximize2 } from "lucide-react";

type Photo = { src: string; alt: string; caption: string; detail?: string };

export default function SchoolGallery({ photos, posters = false }: { photos: Photo[]; posters?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Photo | null>(null);
  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);
  function close() { dialog.current?.close(); setSelected(null); }
  function scroll(direction: number) {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  return <div>
    {posters && <div className="gallery-controls"><span>{photos.length} dokumentasi prestasi</span><div className="flex gap-2"><button type="button" className="icon-button" onClick={() => scroll(-1)} aria-label="Prestasi sebelumnya"><ArrowLeft size={18} /></button><button type="button" className="icon-button" onClick={() => scroll(1)} aria-label="Prestasi berikutnya"><ArrowRight size={18} /></button></div></div>}
    <div ref={track} className={posters ? "achievement-track" : "campus-gallery"} aria-label={posters ? "Galeri prestasi" : "Galeri sekolah"}>
      {photos.map((photo) => <figure key={photo.src}>
        <button type="button" className="gallery-photo" onClick={() => setSelected(photo)} aria-label={`Perbesar: ${photo.alt}`}>
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" width={posters ? 800 : 1000} height={posters ? 1000 : 750} />
          <span className="gallery-zoom"><Maximize2 size={16} /></span>
        </button>
        <figcaption><p>{photo.caption}</p>{photo.detail && <span>{photo.detail}</span>}</figcaption>
      </figure>)}
    </div>
    <dialog ref={dialog} className="photo-dialog" aria-label={selected?.caption ?? "Foto sekolah"} onCancel={close} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      {selected && <><button autoFocus type="button" onClick={close} className="photo-close" aria-label="Tutup foto"><X size={22} /></button><img src={selected.src} alt={selected.alt} /><p>{selected.caption}</p></>}
    </dialog>
  </div>;
}
