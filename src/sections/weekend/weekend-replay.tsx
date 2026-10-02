"use client";

import { Container } from "@tum.ai/ui-kit";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { Sun } from "@/components/sun";
import { weekendCopy } from "@/content/copy";
import { HalftoneField } from "@/halftone/halftone-field";
import type { HalftoneHandle } from "@/halftone/renderer";
import { clamp01, dotColor, skyWeights, smoothstep } from "@/lib/sky";
import { formatElapsed, formatWeekdayClock } from "@/lib/time";
import { sampleSun, type WeekendView } from "@/lib/weekend-view";

/**
 * Scroll held on the first minute after the stage pins, and spent after the
 * last minute while the sky settles into the ink of the results band. The
 * sky fades up out of the night while the stage scrolls into place, before
 * it pins, so the replay enters and leaves without a seam or a dark pause.
 */
const INTRO = 0.03;
const OUTRO = 0.12;
const KEY_STEPS: Record<string, number> = {
  ArrowRight: 30,
  ArrowUp: 30,
  ArrowLeft: -30,
  ArrowDown: -30,
  PageUp: 360,
  PageDown: -360,
};

/** Horizontal position in the sky (0 to 100) for a solar azimuth: east left, west right. */
export function sunX(azimuth: number) {
  return 3 + clamp01((azimuth - 60) / 240) * 94;
}

/** Vertical position in the sky (0 to 100, the horizon at 100) for a solar elevation. */
export function sunY(elevation: number) {
  return 100 - (elevation / 56) * 84;
}

/** Index of the latest moment at or before a minute. */
function activeMoment(view: WeekendView, minute: number) {
  let index = 0;
  view.moments.forEach((moment, i) => {
    if (moment.at <= minute + 0.5) index = i;
  });
  return index;
}

function visualState(view: WeekendView, minute: number) {
  const sun = sampleSun(view, minute);
  const weights = skyWeights(sun.elevation);
  return {
    sun,
    weights,
    p: minute / view.minutes,
    x: sunX(sun.azimuth),
    y: sunY(sun.elevation),
    glow: sun.elevation > -10 ? weights.glow : 0,
  };
}

function valueText(view: WeekendView, minute: number, elevation: number) {
  const moment = view.moments[activeMoment(view, minute)];
  return `${formatWeekdayClock(view.start + minute * 60_000)}, ${formatElapsed(minute)} hours in. ${weekendCopy.elevation(elevation)}.${moment ? ` ${moment.title}.` : ""}`;
}

/**
 * The signature of the page: the 2026 weekend, scrubbed by scrolling. The
 * stage pins while the reader scrolls through 48 hours; the sun follows its
 * real path over the campus, the sky and the dots follow the sun, and the
 * weekend's moments light up on the ruler. Scrolling writes only custom
 * properties, opacities and text, never React state.
 *
 * Without JavaScript or with reduced motion the stage sits in the flow; the
 * ruler (an ARIA slider) still moves the sun with keys and pointer.
 */
export function WeekendReplay({ view }: { view: WeekendView }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const twilightRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const veilInRef = useRef<HTMLDivElement>(null);
  const veilOutRef = useRef<HTMLDivElement>(null);
  const groundInkRef = useRef<HTMLDivElement>(null);
  const groundGlowRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLParagraphElement>(null);
  const elapsedRef = useRef<HTMLSpanElement>(null);
  const elevationRef = useRef<HTMLSpanElement>(null);
  const momentsRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HalftoneHandle | null>(null);
  const geometry = useRef({ top: 0, span: 1, pinned: false });
  const last = useRef({ minute: -1, moment: -1 });

  // Server and first client render: Saturday morning, just after sunrise.
  const sunrise = view.moments.find((moment) => moment.key === "sunrise-saturday");
  const initialMinute = Math.min(view.minutes, (sunrise?.at ?? view.minutes / 2) + 90);
  const initial = visualState(view, initialMinute);
  const initialMoment = activeMoment(view, initialMinute);

  const apply = useCallback(
    (minute: number) => {
      const m = Math.min(view.minutes, Math.max(0, minute));
      const state = visualState(view, m);
      stageRef.current?.style.setProperty("--p", state.p.toFixed(5));
      const sun = sunRef.current;
      if (sun) {
        sun.style.setProperty("--sun-x", state.x.toFixed(3));
        sun.style.setProperty("--sun-y", state.y.toFixed(3));
      }
      if (nightRef.current) nightRef.current.style.opacity = state.weights.night.toFixed(3);
      if (twilightRef.current)
        twilightRef.current.style.opacity = state.weights.twilight.toFixed(3);
      if (dayRef.current) dayRef.current.style.opacity = state.weights.day.toFixed(3);
      if (glowRef.current) {
        glowRef.current.style.opacity = state.glow.toFixed(3);
        glowRef.current.style.setProperty("--glow-x", state.x.toFixed(3));
      }
      if (groundGlowRef.current)
        groundGlowRef.current.style.opacity = Math.max(
          state.weights.day * 0.9,
          state.glow * 0.7,
        ).toFixed(3);
      fieldRef.current?.set({
        dot: dotColor(state.sun.elevation),
        warm: 0.35 + 0.65 * clamp01((state.sun.elevation + 6) / 20),
        density: 0.5 + 0.22 * state.weights.day,
      });

      const whole = Math.round(m);
      if (whole !== last.current.minute) {
        last.current.minute = whole;
        const at = view.start + whole * 60_000;
        if (clockRef.current) clockRef.current.textContent = formatWeekdayClock(at);
        if (elapsedRef.current) elapsedRef.current.textContent = `T+${formatElapsed(whole)}`;
        if (elevationRef.current)
          elevationRef.current.textContent = weekendCopy.elevation(state.sun.elevation);
        rulerRef.current?.setAttribute("aria-valuenow", String(whole));
        rulerRef.current?.setAttribute(
          "aria-valuetext",
          valueText(view, whole, state.sun.elevation),
        );
      }
      const moment = activeMoment(view, m);
      if (moment !== last.current.moment) {
        last.current.moment = moment;
        momentsRef.current?.querySelectorAll<HTMLElement>("[data-moment]").forEach((el, i) => {
          if (i === moment) el.setAttribute("data-active", "");
          else el.removeAttribute("data-active");
        });
      }
    },
    [view],
  );

  const minuteFromProgress = useCallback(
    (p: number) => clamp01((p - INTRO) / (1 - INTRO - OUTRO)) * view.minutes,
    [view.minutes],
  );

  /**
   * The entrance and exit veils: `approach` runs from 0 (the stage's top at
   * the bottom of the viewport) to 1 (pinned), `p` is the pinned progress.
   * Both are null when the stage is not pinned (reduced motion).
   */
  const setVeils = useCallback((approach: number | null, p: number | null) => {
    const veilIn = approach === null ? 0 : 1 - smoothstep(0.15, 0.95, approach);
    const veilOut = p === null ? 0 : smoothstep(1 - OUTRO * 0.85, 1, p);
    if (veilInRef.current) veilInRef.current.style.opacity = veilIn.toFixed(3);
    if (veilOutRef.current) veilOutRef.current.style.opacity = veilOut.toFixed(3);
    if (groundInkRef.current) groundInkRef.current.style.opacity = veilOut.toFixed(3);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let raf = 0;

    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      geometry.current = {
        top: rect.top + window.scrollY,
        span: Math.max(1, wrapper.offsetHeight - stage.offsetHeight),
        pinned: motion.matches,
      };
    };
    const update = () => {
      raf = 0;
      if (!geometry.current.pinned) return setVeils(null, null);
      const { top, span } = geometry.current;
      const viewport = window.innerHeight;
      const p = clamp01((window.scrollY - top) / span);
      setVeils((window.scrollY - (top - viewport)) / viewport, p);
      apply(minuteFromProgress(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    if (geometry.current.pinned) update();
    else apply(initialMinute);
    window.addEventListener("scroll", onScroll, { passive: true });
    const resize = new ResizeObserver(onResize);
    resize.observe(wrapper);
    resize.observe(document.documentElement);
    motion.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      resize.disconnect();
      motion.removeEventListener("change", onResize);
    };
  }, [apply, minuteFromProgress, setVeils, initialMinute]);

  /** Move to a minute: by scrolling while pinned, so scroll stays the one source of truth. */
  const seek = useCallback(
    (minute: number) => {
      const m = Math.min(view.minutes, Math.max(0, minute));
      const { pinned, top, span } = geometry.current;
      if (pinned) {
        const p = INTRO + (m / view.minutes) * (1 - INTRO - OUTRO);
        window.scrollTo({ top: top + p * span, behavior: "instant" });
      } else apply(m);
    },
    [apply, view.minutes],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = Math.max(0, last.current.minute);
    let target: number | null = null;
    if (event.key in KEY_STEPS) target = current + (KEY_STEPS[event.key] ?? 0);
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = view.minutes;
    if (target === null) return;
    event.preventDefault();
    seek(target);
  };

  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    seek(clamp01((event.clientX - box.left) / box.width) * view.minutes);
  };

  const stageStyle = { "--p": initial.p.toFixed(5) } as CSSProperties;
  const sunStyle = {
    "--sun-x": initial.x.toFixed(3),
    "--sun-y": initial.y.toFixed(3),
  } as CSSProperties;
  const ratio = (minutes: number) => (minutes / view.minutes).toFixed(5);

  return (
    <div ref={wrapperRef} className="replay" data-scroll-skip="">
      <div ref={stageRef} className="replay-stage" style={stageStyle}>
        <div className="replay-sky" aria-hidden="true">
          <div className="replay-atmosphere">
            <div
              ref={nightRef}
              className="sky-layer sky-night"
              style={{ opacity: initial.weights.night }}
            />
            <div
              ref={twilightRef}
              className="sky-layer sky-twilight"
              style={{ opacity: initial.weights.twilight }}
            />
            <div
              ref={dayRef}
              className="sky-layer sky-day"
              style={{ opacity: initial.weights.day }}
            />
            <div
              ref={glowRef}
              className="sky-glow"
              style={{ opacity: initial.glow, "--glow-x": initial.x.toFixed(3) } as CSSProperties}
            />
          </div>
          <HalftoneField
            cell={13}
            fps={40}
            speed={0.7}
            rise={false}
            sunRef={sunRef}
            initial={{
              edge: 0.15,
              alpha: 0.6,
              density: 0.5,
              fadeTop: [0.02, 0.46],
              dot: dotColor(initial.sun.elevation),
              warm: 0.35 + 0.65 * clamp01((initial.sun.elevation + 6) / 20),
            }}
            onReady={(handle) => {
              fieldRef.current = handle;
            }}
          />
          <Sun ref={sunRef} className="replay-sun" style={sunStyle} />
          <div className="replay-horizon" />
          <div ref={veilOutRef} className="replay-veil replay-veil-out" />
          <div ref={veilInRef} className="replay-veil replay-veil-in" />
        </div>

        <div className="replay-ground" data-tone="night">
          <div ref={groundGlowRef} className="ground-glow" aria-hidden="true" />
          <div ref={groundInkRef} className="ground-ink" aria-hidden="true" />
          <Container className="py-5 md:py-7">
            <div className="replay-compass text-meta text-fg-subtle" aria-hidden="true">
              <span>{weekendCopy.east}</span>
              <span>{view.place}</span>
              <span>{weekendCopy.west}</span>
            </div>
            <div className="mt-5 grid gap-5 md:mt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-end md:gap-10">
              <div aria-hidden="true">
                <p ref={clockRef} className="readout-clock text-display-lg tabular">
                  {formatWeekdayClock(view.start + Math.round(initialMinute) * 60_000)}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-small text-fg-muted tabular">
                  <span ref={elapsedRef}>T+{formatElapsed(Math.round(initialMinute))}</span>
                  <span ref={elevationRef}>{weekendCopy.elevation(initial.sun.elevation)}</span>
                </p>
              </div>
              <div ref={momentsRef} className="replay-moments" aria-hidden="true">
                {view.moments.map((moment, i) => (
                  <div
                    key={moment.key}
                    data-moment=""
                    data-active={i === initialMoment ? "" : undefined}
                    className="replay-moment"
                  >
                    <p className="text-small font-semibold text-highlight">{moment.when}</p>
                    <p className="mt-1 text-heading-lg text-fg">{moment.title}</p>
                    <p className="mt-1 text-body text-fg-muted">{moment.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={rulerRef}
              role="slider"
              tabIndex={0}
              aria-label={weekendCopy.sliderLabel}
              aria-valuemin={0}
              aria-valuemax={view.minutes}
              aria-valuenow={Math.round(initialMinute)}
              aria-valuetext={valueText(view, Math.round(initialMinute), initial.sun.elevation)}
              className="ruler mt-6 md:mt-8"
              onKeyDown={onKeyDown}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                scrub(event);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) scrub(event);
              }}
            >
              {view.days.map((day) => (
                <span
                  key={day.at}
                  data-start={day.at === 0 ? "" : undefined}
                  className="ruler-day text-meta text-fg-muted"
                  style={{ "--x": ratio(day.at) } as CSSProperties}
                >
                  {day.label}
                </span>
              ))}
              <span className="ruler-track" />
              {view.nights.map((night) => (
                <span
                  key={night.from}
                  className="ruler-night"
                  style={{ "--from": ratio(night.from), "--to": ratio(night.to) } as CSSProperties}
                />
              ))}
              {view.ticks.map((tick) => (
                <span
                  key={tick.at}
                  data-minor={tick.label === "06:00" || tick.label === "18:00" ? "" : undefined}
                  className="ruler-tick text-meta text-fg-subtle tabular"
                  style={{ "--x": ratio(tick.at) } as CSSProperties}
                >
                  {tick.label}
                </span>
              ))}
              {view.moments.map((moment) => (
                <span
                  key={moment.key}
                  data-approx={moment.confirmed ? undefined : ""}
                  className="ruler-mark"
                  style={{ "--x": ratio(moment.at) } as CSSProperties}
                />
              ))}
              <span className="ruler-playhead" />
            </div>
            {weekendCopy.startNote ? (
              <p className="mt-1 text-meta text-fg-subtle">{weekendCopy.startNote}</p>
            ) : null}
          </Container>
        </div>
      </div>

      <ol className="sr-only" aria-label={weekendCopy.momentsTitle}>
        {view.moments.map((moment) => (
          <li key={moment.key}>
            <time dateTime={new Date(view.start + moment.at * 60_000).toISOString()}>
              {moment.when}
            </time>
            : {moment.title}. {moment.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
