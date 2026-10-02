import { FaqSection } from "@tum.ai/ui-kit";

import { nextEdition, referenceWeekend } from "@/config/makeathon";
import { closeCopy } from "@/content/copy";
import { faqItems } from "@/content/faq";
import { getNow } from "@/lib/now";
import { closeActions, heroView } from "@/lib/phase";
import { buildWeekendView } from "@/lib/weekend";
import { CloseSection } from "@/sections/close/close-section";
import { EditionsSection } from "@/sections/editions/editions-section";
import { Hero } from "@/sections/hero/hero";
import { PartnersSection } from "@/sections/partners/partners-section";
import { ResultsSection } from "@/sections/results/results-section";
import { WeekendSection } from "@/sections/weekend/weekend-section";

import { JsonLd } from "./json-ld";

// The phase (announced, applications open, live...) depends on the clock:
// re-render hourly; the hero corrects itself on the client in between.
export const revalidate = 3600;

export default function Page() {
  const now = getNow();
  const view = heroView(nextEdition, now);
  const close = closeCopy(nextEdition);
  const weekend = buildWeekendView(referenceWeekend);

  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd />
      <Hero view={view} edition={nextEdition} />
      <WeekendSection view={weekend} />
      <ResultsSection />
      <EditionsSection />
      <PartnersSection />
      <FaqSection items={faqItems(nextEdition)} tone="paper" className="scroll-mt-header" />
      <CloseSection
        title={close.title}
        lead={close.lead}
        actions={closeActions(nextEdition, now)}
      />
    </main>
  );
}
