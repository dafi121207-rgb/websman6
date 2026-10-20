"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { CREATOR_PLACEHOLDER, type Creator } from "@/data/creators";
import type { ReflectiveRenderer } from "./renderer";
import styles from "./ReflectiveCreatorCard.module.css";

export default function ReflectiveCreatorCard({ creator }: { creator: Creator }) {
  const rootRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleId = useId();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const photo = creator.photo && failedPhoto !== creator.photo ? creator.photo : CREATOR_PLACEHOLDER;
  const isPlaceholder = photo === CREATOR_PLACEHOLDER;

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    const canvas = canvasRef.current;
    if (!root || !body || !canvas) return;
    if (typeof IntersectionObserver === "undefined" || typeof ResizeObserver === "undefined") return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let renderer: ReflectiveRenderer | null = null;
    let visible = false;
    let disposed = false;
    let loading = false;
    let failed = false;
    let lost = false;
    let raf = 0;
    let lastFrame = 0;
    const current = { x: 0, y: 0, glare: 0 };
    const target = { x: 0, y: 0, glare: 0 };
    const pointer = { x: 0, y: 0 };
    const size = { width: body.offsetWidth, height: body.offsetHeight };
    const enabled = () => !motion.matches && finePointer.matches;
    const canDraw = () => !disposed && !lost && enabled() && visible && !document.hidden;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const flatten = () => {
      stop();
      current.x = current.y = current.glare = 0;
      target.x = target.y = target.glare = 0;
      root.style.removeProperty("--rc-rotate-x");
      root.style.removeProperty("--rc-rotate-y");
    };

    const frame = (now: number) => {
      raf = 0;
      if (!canDraw() || !renderer) return;
      const dt = Math.min((now - lastFrame) / 1000 || 1 / 60, 0.05);
      lastFrame = now;
      const ease = 1 - Math.exp(-dt * 12);
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      current.glare += (target.glare - current.glare) * ease;
      const moving = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) +
        Math.abs(target.glare - current.glare) > 0.001;
      if (!moving) Object.assign(current, target);
      const rotateX = -current.y * 6;
      const rotateY = current.x * 6;
      root.style.setProperty("--rc-rotate-x", `${rotateX.toFixed(3)}deg`);
      root.style.setProperty("--rc-rotate-y", `${rotateY.toFixed(3)}deg`);
      renderer.draw({
        ...size,
        rotateX: rotateX * Math.PI / 180,
        rotateY: rotateY * Math.PI / 180,
        pointerX: pointer.x,
        pointerY: pointer.y,
        glare: current.glare,
      });
      if (moving) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!canDraw() || failed || raf) return;
      if (!renderer) {
        if (loading) return;
        loading = true;
        // Load the shader only when a desktop card enters the viewport.
        void import("./renderer").then(({ createReflectiveRenderer }) => {
          loading = false;
          if (!canDraw()) return;
          renderer = createReflectiveRenderer(canvas);
          if (!renderer) {
            failed = true;
            return;
          }
          root.dataset.effect = "webgl";
          wake();
        }).catch(() => {
          loading = false;
          failed = true;
        });
        return;
      }
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !enabled()) return;
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      target.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      target.glare = 1;
      pointer.x = target.x * size.width * 0.5;
      pointer.y = target.y * size.height * 0.5;
      wake();
    };

    const release = () => {
      target.x = target.y = target.glare = 0;
      wake();
    };

    const preferenceChanged = () => {
      flatten();
      if (!enabled()) {
        renderer?.dispose();
        renderer = null;
        delete root.dataset.effect;
      } else wake();
    };

    const visibilityChanged = () => {
      if (document.hidden) flatten();
      else wake();
    };

    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      flatten();
      renderer = null;
      delete root.dataset.effect;
    };

    const contextRestored = () => {
      lost = false;
      failed = false;
      wake();
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else flatten();
    }, { threshold: 0.05 });
    intersection.observe(root);
    const resize = new ResizeObserver(() => {
      size.width = body.offsetWidth;
      size.height = body.offsetHeight;
      wake();
    });
    resize.observe(body);
    root.addEventListener("pointerenter", move);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", release);
    root.addEventListener("pointercancel", release);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", contextRestored);
    document.addEventListener("visibilitychange", visibilityChanged);
    motion.addEventListener("change", preferenceChanged);
    finePointer.addEventListener("change", preferenceChanged);

    return () => {
      disposed = true;
      flatten();
      intersection.disconnect();
      resize.disconnect();
      root.removeEventListener("pointerenter", move);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", release);
      root.removeEventListener("pointercancel", release);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      document.removeEventListener("visibilitychange", visibilityChanged);
      motion.removeEventListener("change", preferenceChanged);
      finePointer.removeEventListener("change", preferenceChanged);
      renderer?.dispose();
      delete root.dataset.effect;
    };
  }, []);

  const cardStyle = { "--rc-accent": creator.accent } as CSSProperties;

  return (
    <article ref={rootRef} className={styles.card} style={cardStyle} aria-labelledby={titleId}>
      <div ref={bodyRef} className={styles.body}>
        <div className={styles.backdrop} aria-hidden="true">
          {/* A plain local image also works when JavaScript or WebGL is unavailable. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            width={600}
            height={900}
            loading="lazy"
            decoding="async"
            className={styles.photo}
            style={{ objectPosition: creator.photoPosition ?? "center 30%" }}
            onError={(event) => {
              if (photo !== CREATOR_PLACEHOLDER) setFailedPhoto(creator.photo);
              else event.currentTarget.hidden = true;
            }}
          />
          {isPlaceholder && <span className={styles.initials}>{creator.initials}</span>}
        </div>
        <canvas ref={canvasRef} className={styles.reflection} aria-hidden="true" />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.content}>
          {isPlaceholder && <span className={styles.placeholderLabel}>Foto segera hadir</span>}
          <div className={styles.identity}>
            <span className={styles.prodi}>{creator.prodi}</span>
            <h3 id={titleId} className={styles.name}>{creator.name}</h3>
            <p className={styles.campus}>{creator.campus}</p>
            <div className={styles.footer}>
              <span className={styles.nimLabel}>NIM</span>
              <span className={styles.nim}>{creator.nim}</span>
            </div>
          </div>
        </div>
        <span className={styles.rim} aria-hidden="true" />
      </div>
    </article>
  );
}
