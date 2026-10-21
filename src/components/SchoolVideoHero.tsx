"use client";

import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VIDEO = "/videos/sman6-hero.mp4";
const POSTER = "/images/hero/sman6-poster.webp";

export default function SchoolVideoHero({ tagline }: { tagline: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const applyPreference = () => {
      const autoplay = !motion.matches && !connection?.saveData;
      setEnabled(autoplay);
      setRequested(autoplay);
    };
    applyPreference();
    motion.addEventListener("change", applyPreference);
    return () => motion.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled || failed) return;
    let visible = true;
    let disposed = false;
    const syncPlayback = () => {
      if (requested && visible && !document.hidden) {
        video.muted = true;
        void video.play().catch(() => {
          // Autoplay can be blocked by the browser; keep the poster and play button.
          if (!disposed && visible && !document.hidden) setPlaying(false);
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.1 });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [enabled, requested, failed]);

  function togglePlayback() {
    if (playing) {
      setRequested(false);
      videoRef.current?.pause();
    } else {
      setEnabled(true);
      setRequested(true);
      // Retain the user gesture for browsers that restrict autoplay.
      if (videoRef.current?.getAttribute("src")) {
        void videoRef.current.play().catch(() => setPlaying(false));
      }
    }
  }

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-slate-950 sm:min-h-[620px] lg:min-h-[680px]">
      {/* Always present, including before hydration or if video loading fails. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={POSTER} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 z-0 h-full w-full object-cover" />
      <video
        ref={videoRef}
        src={enabled ? VIDEO : undefined}
        poster={POSTER}
        autoPlay={enabled && requested}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => { setFailed(true); setPlaying(false); }}
        className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover ${failed ? "hidden" : ""}`}
      />
      <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/55 via-slate-950/55 to-slate-950/80" />
      <div className="relative z-20 mx-auto w-full max-w-5xl px-5 py-24 text-center sm:px-8">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-100 sm:text-xs">Portal Pembelajaran PJOK</p>
        <h1 id="hero-title" className="hero-anim-title text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
          SMAN 6 <span className="text-blue-200">GARUT</span>
        </h1>
        <p className="hero-anim-title mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white sm:text-xl">{tagline}</p>
        <div className="hero-anim-cta mx-auto mt-9 flex max-w-xl flex-col items-stretch justify-center gap-3.5 sm:flex-row">
          <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            Masuk sebagai Siswa / Guru <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href="#materi" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/60 bg-slate-950/35 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-slate-950/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            Jelajahi Modul Pembelajaran
          </Link>
        </div>
      </div>
      {!failed && (
        <button type="button" onClick={togglePlayback} aria-label={playing ? "Jeda video latar" : "Putar video latar"} className="absolute bottom-5 right-5 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-slate-950/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-slate-950/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:right-8">
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          {playing ? "Jeda video" : "Putar video"}
        </button>
      )}
    </section>
  );
}
