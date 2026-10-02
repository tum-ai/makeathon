"use client";

import { Actions, ButtonLink } from "@tum.ai/ui-kit";
import { useSyncExternalStore } from "react";

import type { NextEdition } from "@/config/makeathon";
import { cn } from "@/lib/cn";
import { type Action, type HeroView, heroView } from "@/lib/phase";

const MINUTE = 60_000;

function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / MINUTE);
// No clock on the server: the first client render matches the server HTML.
const serverMinute = () => null;

function countdownParts(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / MINUTE));
  return [
    { value: Math.floor(minutes / 1440), unit: "days" },
    { value: Math.floor((minutes % 1440) / 60), unit: "hours" },
    { value: minutes % 60, unit: "min" },
  ];
}

export function ActionLink({
  action,
  variant,
}: {
  action: Action;
  variant: "primary" | "secondary";
}) {
  const internal = action.href.startsWith("#");
  return (
    <ButtonLink
      href={action.href}
      variant={variant}
      size="lg"
      external={action.external}
      arrow={action.external ? "external" : internal ? "down" : true}
    >
      {action.label}
    </ButtonLink>
  );
}

/**
 * The hero's live line: where the next edition stands, a countdown when
 * there is something to count to, and the two actions. Rendered by the
 * server for its clock, then corrected on the client by the same pure
 * `heroView`, so a cached page never shows a stale phase for long.
 */
export function HeroStatus({
  edition,
  initial,
  className,
}: {
  edition: NextEdition;
  initial: HeroView;
  className?: string;
}) {
  const minute = useSyncExternalStore(subscribeMinute, currentMinute, serverMinute);
  const now = minute === null ? null : minute * MINUTE;
  const view = now === null ? initial : heroView(edition, now);

  return (
    <div className={cn("max-w-md", className)}>
      <p className="flex items-center gap-3 text-label font-semibold text-fg">
        <span className="status-sun" aria-hidden="true" />
        {view.status}
      </p>
      <p className="mt-2 text-small text-fg-muted">{view.detail}</p>
      {view.countdown && now !== null ? (
        <p className="mt-5 flex items-baseline gap-5" aria-live="off">
          <span className="text-small text-fg-muted">{view.countdown.label}</span>
          {countdownParts(view.countdown.to - now).map((part) => (
            <span key={part.unit} className="tabular">
              <span className="text-stat-sm text-fg">{String(part.value).padStart(2, "0")}</span>{" "}
              <span className="text-meta text-fg-subtle">{part.unit}</span>
            </span>
          ))}
        </p>
      ) : null}
      <Actions className="mt-7">
        <ActionLink action={view.primary} variant="primary" />
        <ActionLink action={view.secondary} variant="secondary" />
      </Actions>
    </div>
  );
}
