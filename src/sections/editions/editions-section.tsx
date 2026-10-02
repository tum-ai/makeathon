import { Container, Section } from "@tum.ai/ui-kit";

import { editions } from "@/config/makeathon";
import { editionsCopy } from "@/content/copy";
import { formatDateRange } from "@/lib/time";

import { type EditionRow, EditionsLedger } from "./editions-ledger";

export function EditionsSection() {
  const rows: EditionRow[] = [...editions].reverse().map((edition) => ({
    key: edition.key,
    year: edition.start.slice(0, 4),
    name: edition.name,
    when: `${formatDateRange(edition.start, edition.end)}, ${edition.city}`,
    note: edition.note,
    link: edition.link,
    poster: edition.poster,
  }));

  return (
    <Section
      id="editions"
      tone="paper"
      spacing="lg"
      aria-labelledby="editions-title"
      className="scroll-mt-header"
    >
      <Container>
        <div className="mb-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end lg:gap-20">
          <h2 id="editions-title" className="text-display-lg">
            {editionsCopy.title}
          </h2>
          <p className="text-lead text-fg-muted">{editionsCopy.lead}</p>
        </div>
        <EditionsLedger rows={rows} label={editionsCopy.listLabel} />
      </Container>
    </Section>
  );
}
