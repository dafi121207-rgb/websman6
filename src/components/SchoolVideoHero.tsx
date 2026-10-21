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
    <section aria-labelledby="hero-title" className="school-hero">
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
      <div aria-hidden="true" className="hero-overlay" />
      <div className="site-container hero-content">
        <p className="hero-kicker">Pendidikan Jasmani, Olahraga & Kesehatan</p>
        <h1 id="hero-title">
          SMAN 6 GARUT
        </h1>
        <p className="hero-tagline">{tagline}</p>
        <div className="hero-links">
          <Link href="/modul" className="site-button">
            Mulai belajar <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/profil-sekolah" className="site-button hero-secondary">
            Kenali sekolah
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
