"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content stays visible without JS or motion support. */
export default function LandingAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/profil-sekolah") return;
    const main = document.getElementById("main-content");
    if (!main || !("IntersectionObserver" in window) || !Element.prototype.animate) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    const play = (element: Element, delay = 0, distance = 12) => {
      if (preference.matches || element.contains(document.activeElement)) return;
      const animation = element.animate(
        [{ opacity: 0, transform: `translateY(${distance}px)` }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 480, delay, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" },
      );
      animations.add(animation);
      animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
    };
    const stop = () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    if (!preference.matches) {
      main.querySelectorAll(".hero-kicker, .hero-content h1, .hero-tagline, .hero-links").forEach((element, index) => {
        if (element.getBoundingClientRect().bottom > 0) play(element, index * 65, 10);
      });
      const delays = new Map<Element, number>();
      main.querySelectorAll(".purpose-list, .mission-list").forEach((list) => {
        Array.from(list.children).forEach((item, index) => delays.set(item, Math.min(index, 3) * 55));
      });
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          play(entry.target, delays.get(entry.target) ?? 0, entry.target.matches(".school-principal") ? 0 : 12);
        });
      }, { threshold: 0.08 });
      main.querySelectorAll(".section-heading, .page-heading .site-container, .purpose-layout > div > .section-title, .purpose-list > li, .mission-list > li, .school-principal, .campus-gallery > figure, .achievement-track > figure").forEach((element) => {
        if (element.getBoundingClientRect().bottom > 0) observer?.observe(element);
      });
    }
    const onPreferenceChange = () => { if (preference.matches) stop(); };
    preference.addEventListener("change", onPreferenceChange);
    return () => { stop(); preference.removeEventListener("change", onPreferenceChange); };
  }, [pathname]);

  return null;
}
