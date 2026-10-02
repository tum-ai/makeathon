// Generates public/seams/halftone-edge.svg: a horizontally tiling strip of
// dots that are solid (merged) along the top edge and shrink to nothing
// toward the bottom, along a wavy line. Used as a CSS mask for the halftone
// seam under the results band (see seams.css). Run: node scripts/make-seam.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const WIDTH = 480; // tile width; every wave below completes whole periods in it
const ROWS = 10;
const ROW = 10.5; // vertical spacing
const COL = 12; // horizontal spacing; odd rows shift by half
const MAX_RADIUS = 8.4; // enough for neighbouring dots to merge

const tau = Math.PI * 2;
const circles = [];
for (let i = 0; i < ROWS; i++) {
  const y = i * ROW + ROW / 2;
  for (let x = (i % 2) * (COL / 2) + COL / 2; x < WIDTH + COL; x += COL) {
    const t =
      i / (ROWS - 1) +
      0.17 * Math.sin((tau * 2 * x) / WIDTH) +
      0.08 * Math.sin((tau * 5 * x) / WIDTH + 1.3);
    const r = MAX_RADIUS * Math.max(0, Math.min(1, 1 - t)) ** 1.25;
    if (r < 0.55) continue;
    // Wrap so the tile repeats seamlessly.
    for (const dx of [0, -WIDTH]) {
      const cx = x + dx;
      if (cx + r < 0 || cx - r > WIDTH) continue;
      circles.push(`<circle cx="${cx.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}"/>`);
    }
  }
}

const height = Math.round(ROWS * ROW);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}"><rect width="${WIDTH}" height="3"/>${circles.join("")}</svg>\n`;
mkdirSync("public/seams", { recursive: true });
writeFileSync("public/seams/halftone-edge.svg", svg);
console.log(`public/seams/halftone-edge.svg: ${circles.length} dots, ${svg.length} bytes`);
