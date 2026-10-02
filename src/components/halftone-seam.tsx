import type { CSSProperties } from "react";

/**
 * A halftone seam inside a dark band, dissolving into the light band that
 * touches it at `edge`. Its parent must be positioned. Decorative.
 */
export function HalftoneSeam({
  edge,
  color = "var(--tone-paper)",
}: {
  /** The side of the dark band the light band touches. */
  edge: "top" | "bottom";
  /** The light band's canvas colour. */
  color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-edge={edge}
      className="seam"
      style={{ "--seam": color } as CSSProperties}
    />
  );
}
