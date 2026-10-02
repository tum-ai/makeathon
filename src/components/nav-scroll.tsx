"use client";

import { useEffect } from "react";

/**
 * In-page links glide to their section without fast-forwarding through a
 * pinned scroll scene (marked `data-scroll-skip`, like the 48-hour replay).
 * When the path crosses one, the page first jumps, instantly, to just short
 * of the target on the far side of the scene; the browser's own smooth
 * scroll then covers the last stretch. Links keep their native behaviour
 * otherwise (the kit's header leaves fragment links native).
 */
export function NavScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname)
        return;
      if (!url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      const from = window.scrollY;
      const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const to = target.getBoundingClientRect().top + from - margin;
      const viewport = window.innerHeight;
      const lead = viewport * 0.5;
      let jump: number | null = null;

      for (const zone of document.querySelectorAll<HTMLElement>("[data-scroll-skip]")) {
        if (zone.contains(target)) continue;
        const top = zone.getBoundingClientRect().top + from;
        const bottom = top + zone.offsetHeight;
        if (to > from && top < to && bottom > from) {
          // Downward across the scene: land past its end, a little short of the target.
          jump = Math.max(jump ?? from, Math.min(to, Math.max(bottom - viewport, to - lead)));
        } else if (to < from && bottom > to && top < from + viewport) {
          // Upward across the scene: land above its start, a little below the target.
          jump = Math.min(jump ?? from, Math.max(to, Math.min(top - viewport * 0.1, to + lead)));
        }
      }
      if (jump !== null && Math.abs(jump - from) > 1)
        window.scrollTo({ top: jump, behavior: "instant" });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
