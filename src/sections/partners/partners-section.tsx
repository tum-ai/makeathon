import { Actions, ButtonLink, Container, LogoWall, Photo, Section } from "@tum.ai/ui-kit";

import { organizations, partners, photos } from "@/config/makeathon";
import { partnersCopy } from "@/content/copy";

/** For companies: what a challenge brings, one outcome, and who came before. */
export function PartnersSection() {
  const outcomeOrg = organizations[partners.outcome.organization];
  const logos = partners.past.map((key) => {
    const org = organizations[key];
    const logo = "logo" in org ? org.logo : undefined;
    return {
      name: org.name,
      src: logo?.src,
      aspectRatio: logo ? logo.width / logo.height : undefined,
    };
  });

  return (
    <Section
      id="partners"
      tone="mist"
      spacing="lg"
      aria-labelledby="partners-title"
      className="scroll-mt-header"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <h2 id="partners-title" className="text-display-lg">
              {partnersCopy.title}
            </h2>
            <p className="mt-6 max-w-xl text-lead text-fg-muted">{partnersCopy.lead}</p>
            <ul className="mt-10 border-b border-hairline">
              {partners.offer.map((item) => (
                <li
                  key={item.title}
                  className="grid gap-1 border-t border-hairline py-5 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="text-heading-sm text-fg">{item.title}</span>
                  <span className="text-body text-fg-muted">{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-small text-fg-muted">{partners.addOns}</p>
            <Actions className="mt-10">
              <ButtonLink href={partnersCopy.actionHref} size="lg" arrow>
                {partnersCopy.action}
              </ButtonLink>
            </Actions>
          </div>

          <div className="flex flex-col gap-12">
            <Photo
              src={photos.audience.src}
              alt={photos.audience.alt}
              caption={photos.audience.caption}
              aspect="4/5"
              position="55% 50%"
              sizes="(min-width: 64rem) 34rem, 100vw"
            />
            <figure className="border-t border-hairline-strong pt-6">
              <blockquote className="text-heading-lg text-fg">{partners.outcome.text}</blockquote>
              <figcaption className="mt-3 text-small text-fg-muted">
                {outcomeOrg.name}, challenge partner
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="mt-24">
          <h3 className="text-heading-md text-fg">{partnersCopy.pastTitle}</h3>
          <LogoWall
            className="mt-8"
            logos={logos}
            columns={6}
            size="sm"
            label={partnersCopy.pastTitle}
          />
        </div>
      </Container>
    </Section>
  );
}
