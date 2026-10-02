"use client";

import { TextLink } from "@tum.ai/ui-kit";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type EditionRow = {
  key: string;
  year: string;
  name: string;
  /** "17 to 19 April 2026, Munich" */
  when: string;
  note: string;
  link?: { label: string; href: string };
  poster: { src: string; alt: string };
};

/**
 * Every edition as a ledger, newest first, beside a sticky poster that
 * follows the row in the middle of the screen (or the row under the pointer
 * or focus). Phones show each poster inline instead.
 */
export function EditionsLedger({ rows, label }: { rows: EditionRow[]; label: string }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    list.querySelectorAll("[data-index]").forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-20">
      <ol ref={listRef} aria-label={label} className="editions-list border-b border-hairline">
        {rows.map((row, index) => (
          <li
            key={row.key}
            data-index={index}
            data-active={index === active ? "" : undefined}
            onPointerEnter={() => setActive(index)}
            onFocusCapture={() => setActive(index)}
            className="edition-row grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-4 border-t border-hairline py-8 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-8"
          >
            <p
              className="edition-year col-start-1 row-start-1 self-center text-stat-md text-fg sm:self-start"
              aria-hidden="true"
            >
              {row.year}
            </p>
            <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-span-2 sm:row-start-1">
              <h3 className="text-heading-md text-fg">
                <span className="sr-only">{row.year}: </span>
                {row.name}
              </h3>
              <p className="mt-1 text-small text-fg-muted">{row.when}</p>
              <p className="mt-4 max-w-[60ch] text-body text-fg-muted">{row.note}</p>
              {row.link ? (
                <TextLink href={row.link.href} arrow className="mt-4 inline-flex">
                  {row.link.label}
                </TextLink>
              ) : null}
            </div>
            <Image
              src={row.poster.src}
              alt={row.poster.alt}
              width={1080}
              height={1080}
              sizes="5rem"
              className="col-start-2 row-start-1 size-16 justify-self-end rounded-lg object-cover sm:col-start-1 sm:row-start-2 sm:size-20 sm:justify-self-start lg:hidden"
            />
          </li>
        ))}
      </ol>
      <div className="hidden lg:block" aria-hidden="true">
        <div className="sticky top-[calc(var(--header-offset)+1.5rem)]">
          <div className="poster-stack shadow-lift">
            {rows.map((row, index) => (
              <Image
                key={row.key}
                src={row.poster.src}
                alt=""
                fill
                sizes="27rem"
                data-active={index === active ? "" : undefined}
                className="object-cover"
              />
            ))}
          </div>
          <p className="mt-4 text-meta text-fg-subtle">{rows[active]?.name}</p>
        </div>
      </div>
    </div>
  );
}
