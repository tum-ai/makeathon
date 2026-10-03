"use client";

import { Container, SplitWords } from "@tum.ai/ui-kit";
import { HalftoneField, Sun } from "@tum.ai/ui-kit/halftone";
import { useRef } from "react";

import type { NextEdition } from "@/config/makeathon";
import { heroCopy } from "@/content/copy";
import type { HeroView } from "@/lib/phase";

import { HeroStatus } from "./hero-status";

/**
 * The opening: the posters' sun rising behind the headline over a field of
 * amber dots that bloom outward from it and bend under the pointer. The one
 * orchestrated load moment of the page (sun, dots and words); everything is
 * server-rendered, and the sun rises in CSS before any script runs.
 */
export function Hero({ view, edition }: { view: HeroView; edition: NextEdition }) {
  const sunRef = useRef<HTMLSpanElement>(null);
  const clearRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      data-tone="night"
      className="relative isolate flex min-h-svh flex-col overflow-x-clip bg-canvas text-fg"
    >
      <HalftoneField
        cell={15}
        pointer
        riseDuration={2.4}
        sunRef={sunRef}
        clearRef={clearRef}
        initial={{ alpha: 0.95, fadeBottom: [0.62, 0.93] }}
        className="hero-field -z-20"
      />
      <div className="hero-scrim -z-10" aria-hidden="true" />
      <Container className="flex flex-1 flex-col justify-end pt-[calc(var(--header-offset)+4rem)] pb-[clamp(2.5rem,8vh,6rem)]">
        <div ref={clearRef}>
          <h1 id="hero-title" className="hero-title w-fit text-display-hero text-fg">
            <span className="sr-only">TUM.ai </span>
            <SplitWords delay={80}>{heroCopy.title}</SplitWords>
            <Sun ref={sunRef} />
          </h1>
          <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-display-md text-highlight motion-safe:animate-rise-sm motion-safe:[animation-delay:420ms]">
                {heroCopy.tagline}
              </p>
              <p className="mt-5 text-lead text-fg-muted motion-safe:animate-rise-sm motion-safe:[animation-delay:520ms]">
                {heroCopy.lead}
              </p>
            </div>
            <HeroStatus
              edition={edition}
              initial={view}
              className="motion-safe:animate-rise-sm motion-safe:[animation-delay:640ms] lg:justify-self-end"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
