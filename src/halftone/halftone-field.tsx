"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import type { HalftoneHandle, HalftoneOptions, HalftoneState } from "./renderer";

export type HalftoneFieldProps = {
  /** Grid cell in CSS px. */
  cell?: number;
  fps?: number;
  speed?: number;
  /** Follow fine pointers with a lens. */
  pointer?: boolean;
  /** Bloom outward from the sun when the field first draws. */
  rise?: boolean;
  riseDuration?: number;
  /** The element whose centre the dots warm toward. */
  sunRef?: RefObject<HTMLElement | null>;
  /** An element whose box stays mostly clear of dots (the headline). */
  clearRef?: RefObject<HTMLElement | null>;
  initial?: Partial<HalftoneState>;
  /** Receives the renderer once it runs, to drive it (the weekend replay). */
  onReady?: (handle: HalftoneHandle) => void;
  className?: string;
};

/**
 * `pending` until the renderer has tried (the CSS dots stay hidden, so they
 * never flash before the live field), then `webgl`, or `css` when WebGL is
 * unavailable and `lost` after a lost context (both show the CSS dots).
 */
type Mode = "pending" | "css" | "webgl" | "lost";

/**
 * The Makeathon's halftone dot field. Once the page is idle the WebGL
 * renderer loads, draws its first frame and the canvas fades in. A CSS dot
 * pattern rendered by the server stands in only where the live field cannot:
 * without JavaScript, without WebGL, or after a lost context.
 * Decorative: hidden from assistive technology.
 */
export function HalftoneField({
  cell = 14,
  fps,
  speed,
  pointer = false,
  rise = true,
  riseDuration,
  sunRef,
  clearRef,
  initial,
  onReady,
  className,
}: HalftoneFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  // The renderer reads the latest props once, when it starts.
  const options = useRef<(HalftoneOptions & { onReady?: typeof onReady }) | null>(null);
  useEffect(() => {
    options.current = { cell, fps, speed, pointer, rise, riseDuration, initial, onReady };
  });

  useEffect(() => {
    let handle: HalftoneHandle | null = null;
    let cancelled = false;
    const load = () => {
      void import("./renderer").then(({ createHalftone }) => {
        const canvas = canvasRef.current;
        const current = options.current;
        if (cancelled || !canvas || !current) return;
        handle = createHalftone(canvas, {
          ...current,
          sunElement: sunRef?.current ?? null,
          clearElement: clearRef?.current ?? null,
        });
        if (!handle) return setMode("css");
        handle.onFirstFrame(() => !cancelled && setMode("webgl"));
        handle.onLost(() => !cancelled && setMode("lost"));
        current.onReady?.(handle);
      });
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(load, { timeout: 900 })
      : window.setTimeout(load, 120);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      handle?.destroy();
    };
  }, [sunRef, clearRef]);

  return (
    <div aria-hidden="true" data-halftone={mode} className={cn("halftone", className)}>
      <div className="halftone-fallback" />
      <canvas ref={canvasRef} className="halftone-canvas" />
    </div>
  );
}
