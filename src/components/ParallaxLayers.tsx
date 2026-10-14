"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface ParallaxContextType {
  registerLayer: (id: string, depth: number, el: HTMLDivElement) => void;
  unregisterLayer: (id: string) => void;
}

const ParallaxContext = createContext<ParallaxContextType | null>(null);

export interface ParallaxLayerProps {
  depth: number; // 0 to 1
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
  vertical?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
}

export function ParallaxLayer({
  depth,
  children,
  className = "",
  "aria-hidden": ariaHidden,
}: ParallaxLayerProps) {
  const context = useContext(ParallaxContext);
  const layerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    if (context && layerRef.current) {
      context.registerLayer(idRef.current, depth, layerRef.current);
    }
    return () => {
      if (context) {
        context.unregisterLayer(idRef.current);
      }
    };
  }, [context, depth]);

  return (
    <div
      ref={layerRef}
      className={`parallax-layer ${className}`}
      aria-hidden={ariaHidden}
      style={{
        transform: "translate3d(0px, 0px, 0px)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

export interface ParallaxLayersProps {
  children?: React.ReactNode;
  className?: string;
  container?: React.RefObject<HTMLElement | null>;
  direction?: "vertical" | "horizontal" | "both";
  pointer?: boolean;
  scrollStrength?: number;
  pointerStrength?: number;
}

export function ParallaxLayers({
  children,
  className = "",
  container,
  direction = "vertical",
  pointer = true,
  scrollStrength = 120,
  pointerStrength = 30,
}: ParallaxLayersProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layersMap = useRef<Map<string, { depth: number; el: HTMLDivElement }>>(new Map());

  // Springs & animation state
  const stateRef = useRef({
    currentPointerX: 0,
    currentPointerY: 0,
    targetPointerX: 0,
    targetPointerY: 0,
    scrollProgress: 0,
    rafId: 0,
    reducedMotion: false,
  });

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reducedMotion = mediaQuery.matches;

    const handleMediaChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
      if (e.matches) {
        // Reset all layer transforms immediately
        layersMap.current.forEach(({ el }) => {
          el.style.transform = "translate3d(0px, 0px, 0px)";
        });
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    // Check pointer capability
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const handlePointerMove = (e: MouseEvent) => {
      if (!pointer || !canHover || stateRef.current.reducedMotion) return;

      const targetEl = container?.current || rootRef.current || document.documentElement;
      const rect = targetEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized pointer coordinates from -1 to 1
      stateRef.current.targetPointerX = (e.clientX - centerX) / (rect.width / 2);
      stateRef.current.targetPointerY = (e.clientY - centerY) / (rect.height / 2);
    };

    const handlePointerLeave = () => {
      stateRef.current.targetPointerX = 0;
      stateRef.current.targetPointerY = 0;
    };

    const targetContainer = container?.current || window;
    targetContainer.addEventListener("mousemove", handlePointerMove as EventListener, { passive: true });
    targetContainer.addEventListener("mouseleave", handlePointerLeave as EventListener, { passive: true });

    // Animation Loop (Compositor-friendly RAF)
    const tick = () => {
      if (!stateRef.current.reducedMotion) {
        // Calculate scroll offset relative to viewport
        if (rootRef.current) {
          const rect = rootRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight || 800;
          // Progress from -1 (entering viewport) to 1 (leaving viewport)
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = windowHeight / 2;
          stateRef.current.scrollProgress = (viewportCenter - elementCenter) / (windowHeight / 2);
        }

        // Spring pointer interpolation (lerp)
        const lerpFactor = 0.08;
        stateRef.current.currentPointerX +=
          (stateRef.current.targetPointerX - stateRef.current.currentPointerX) * lerpFactor;
        stateRef.current.currentPointerY +=
          (stateRef.current.targetPointerY - stateRef.current.currentPointerY) * lerpFactor;

        // Apply transforms to each layer according to its depth
        layersMap.current.forEach(({ depth, el }) => {
          if (depth === 0) {
            el.style.transform = "translate3d(0px, 0px, 0px)";
            return;
          }

          let scrollX = 0;
          let scrollY = 0;

          if (direction === "vertical" || direction === "both") {
            scrollY = stateRef.current.scrollProgress * depth * scrollStrength;
          }
          if (direction === "horizontal" || direction === "both") {
            scrollX = stateRef.current.scrollProgress * depth * scrollStrength;
          }

          const pointerX = stateRef.current.currentPointerX * depth * pointerStrength;
          const pointerY = stateRef.current.currentPointerY * depth * pointerStrength;

          const totalX = Math.round((scrollX + pointerX) * 10) / 10;
          const totalY = Math.round((scrollY + pointerY) * 10) / 10;

          el.style.transform = `translate3d(${totalX}px, ${totalY}px, 0px)`;
        });
      }

      stateRef.current.rafId = requestAnimationFrame(tick);
    };

    stateRef.current.rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.rafId);
      targetContainer.removeEventListener("mousemove", handlePointerMove as EventListener);
      targetContainer.removeEventListener("mouseleave", handlePointerLeave as EventListener);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [container, direction, pointer, pointerStrength, scrollStrength]);

  const registerLayer = (id: string, depth: number, el: HTMLDivElement) => {
    layersMap.current.set(id, { depth, el });
  };

  const unregisterLayer = (id: string) => {
    layersMap.current.delete(id);
  };

  return (
    <ParallaxContext.Provider value={{ registerLayer, unregisterLayer }}>
      <div ref={rootRef} className={`parallax-layers-container relative ${className}`}>
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

export default ParallaxLayers;
