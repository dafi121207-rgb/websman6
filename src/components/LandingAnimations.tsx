"use client";

import { useEffect } from "react";
import gsap from "gsap";

export default function LandingAnimations() {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero headline & buttons entrance animation
      gsap.from(".hero-anim-title", {
        opacity: 0,
        y: 35,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
      });

      gsap.from(".hero-anim-cta", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
        stagger: 0.1,
      });

      // Visi card entrance
      gsap.from(".visi-card-anim", {
        opacity: 0,
        y: 30,
        scale: 0.98,
        duration: 0.9,
        delay: 0.45,
        ease: "power3.out",
      });

      // Stagger items on scroll/view
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              gsap.fromTo(
                el,
                { opacity: 0, y: 25 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
              );
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.15 }
      );

      document.querySelectorAll(".gsap-reveal").forEach((item) => {
        observer.observe(item);
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
