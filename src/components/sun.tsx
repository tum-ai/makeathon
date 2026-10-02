import type { CSSProperties, Ref } from "react";

import { cn } from "@/lib/cn";

export type SunProps = {
  ref?: Ref<HTMLSpanElement>;
  /** Draw the soft glow behind the disc. Off where a clipping box would cut it. */
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * The Makeathon sun, after the posters: a disc in the sun ramp that fades
 * toward the horizon, with a soft glow behind it. Size and position come
 * from the caller (see sun.css and the section stylesheets). Decorative.
 */
export function Sun({ ref, glow = true, className, style }: SunProps) {
  return (
    <span ref={ref} aria-hidden="true" className={cn("sun", className)} style={style}>
      {glow ? <span className="sun-glow" /> : null}
      <span className="sun-disc" />
    </span>
  );
}
