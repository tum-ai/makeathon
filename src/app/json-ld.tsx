import { editions, nextEdition, site } from "@/config/makeathon";
import { heroCopy } from "@/content/copy";

/** Structured data: the Makeathon as a yearly event series organised by TUM.ai. */
export function JsonLd() {
  const organizer = { "@type": "Organization", name: "TUM.ai", url: site.tumai.url };
  const data = {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: site.name,
    url: site.url,
    description: heroCopy.lead,
    organizer,
    location: { "@type": "Place", name: "Munich", address: "Munich, Germany" },
    subEvent: [
      ...editions.map((edition) => ({
        "@type": "Event",
        name: edition.name,
        startDate: edition.start,
        endDate: edition.end,
        eventAttendanceMode:
          edition.city === "Online"
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
        location:
          edition.city === "Online"
            ? { "@type": "VirtualLocation", url: site.url }
            : {
                "@type": "Place",
                name: edition.city,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: edition.city,
                  addressCountry: "DE",
                },
              },
        eventStatus: "https://schema.org/EventScheduled",
        organizer,
      })),
      ...(nextEdition.weekend
        ? [
            {
              "@type": "Event",
              name: `Makeathon ${nextEdition.year}`,
              startDate: nextEdition.weekend.kickoff,
              endDate: nextEdition.weekend.end,
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              location: {
                "@type": "Place",
                name: nextEdition.venue ?? "Munich",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Munich",
                  addressCountry: "DE",
                },
              },
              eventStatus: "https://schema.org/EventScheduled",
              organizer,
              isAccessibleForFree: true,
            },
          ]
        : []),
    ],
  };
  return (
    <script
      type="application/ld+json"
      // Static data from config; `<` is escaped so no string can close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
