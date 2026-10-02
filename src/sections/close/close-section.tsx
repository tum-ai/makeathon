"use client";

import { Actions, Container } from "@tum.ai/ui-kit";
import { useEffect, useRef, useState } from "react";

import { Sun } from "@/components/sun";
import { HalftoneField } from "@/halftone/halftone-field";
import type { Action } from "@/lib/phase";

import { ActionLink } from "../hero/hero-status";

/**
 * The close answers the hero: the sun rises again, this time over a horizon,
 * when the band comes into view, and the dots bloom out from it once more.
 */
export function CloseSection({
  title,
  lead,
  actions,
}: {
  title: string;
  lead: string;
  actions: [Action, Action];
}) {
  const horizonRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = horizonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="close-title"
      data-tone="ink"
      className="relative isolate overflow-hidden bg-canvas text-fg"
    >
      <HalftoneField
        cell={16}
        fps={30}
        speed={0.6}
        riseDuration={2.8}
        sunRef={sunRef}
        initial={{ alpha: 0.6, fadeTop: [0, 0.34], fadeBottom: [0.74, 1] }}
        className="-z-10"
      />
      <Container className="py-[clamp(6rem,14vw,11rem)] text-center">
        <div ref={horizonRef} className="close-horizon" data-visible={visible ? "" : undefined}>
          <span className="close-glow" aria-hidden="true" />
          <div className="close-disc">
            <Sun ref={sunRef} glow={false} />
          </div>
        </div>
        <h2 id="close-title" className="mx-auto mt-12 max-w-[16ch] text-display-xl">
          {title}
        </h2>
        <p className="mt-6 text-lead text-fg-muted">{lead}</p>
        <Actions align="center" className="mt-10">
          <ActionLink action={actions[0]} variant="primary" />
          <ActionLink action={actions[1]} variant="secondary" />
        </Actions>
      </Container>
    </section>
  );
}
