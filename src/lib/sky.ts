/**
 * The sky over the weekend replay, as a function of the sun's elevation.
 * Four stacked layers (night, twilight, day, horizon glow) crossfade by
 * opacity only, so the browser never repaints a gradient while scrolling.
 * Shared by the server (static fallback) and the client (scroll driver).
 */

export function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export type SkyWeights = { night: number; twilight: number; day: number; glow: number };

/** Layer opacities for a solar elevation in degrees. */
export function skyWeights(elevation: number): SkyWeights {
  const day = smoothstep(-3, 14, elevation);
  const night = 1 - smoothstep(-14, -3, elevation);
  // Twilight peaks around sunrise and sunset, between night and day.
  const twilight = smoothstep(-16, -4, elevation) * (1 - smoothstep(1, 16, elevation));
  // Warm light on the horizon while the sun is low.
  const glow = Math.exp(-(((elevation + 1.5) / 7) ** 2));
  return { night, twilight, day, glow };
}

type Rgb = [number, number, number];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// Halftone dot colours (0 to 1): cool violet at night, the sun's amber by day.
const NIGHT_DOT: Rgb = [0x9a / 255, 0x64 / 255, 0xd9 / 255]; // violet-500
const DAY_DOT: Rgb = [0xfe / 255, 0xbc / 255, 0x5c / 255]; // sun-400
const DUSK_DOT: Rgb = [0xd9 / 255, 0x90 / 255, 0x5b / 255]; // sun-600

/** The halftone dot colour under a sky at this elevation. */
export function dotColor(elevation: number): Rgb {
  const { day, glow } = skyWeights(elevation);
  return mix(mix(NIGHT_DOT, DUSK_DOT, clamp01(glow * 1.2)), DAY_DOT, day);
}

/** Relative luminance of an sRGB hex colour (WCAG 2). */
export function luminance(hex: string): number {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const channel = (shift: number) => {
    const c = ((value >> shift) & 0xff) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** The colour stops of the sky layers (see weekend.css), for the contrast test. */
export const SKY_STOPS = {
  night: ["#0d0214", "#1b0049"],
  twilight: ["#2f1757", "#523573"],
  day: ["#2f1757", "#523573", "#6a43a3"],
} as const;
