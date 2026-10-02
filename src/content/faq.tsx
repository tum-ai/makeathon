import { Anchor, type FaqItem } from "@tum.ai/ui-kit";

import {
  editions,
  league,
  type NextEdition,
  referenceWeekend,
  results2026,
  site,
} from "@/config/makeathon";

import { inWords, nextEditionSentence } from "./copy";

/**
 * Questions and answers, refreshed from the old site's FAQ and built from
 * config so dates and counts never go stale.
 */
export function faqItems(edition: NextEdition): FaqItem[] {
  return [
    {
      id: "what",
      question: "What is the Makeathon?",
      answer: `A ${referenceWeekend.hours}-hour hackathon in Munich. Teams of students and young professionals build AI prototypes for challenges that companies, hospitals and research labs bring. TUM.ai has run it since ${site.since}, ${inWords(editions.length)} editions so far.`,
    },
    {
      id: "who",
      question: "Who can take part?",
      answer:
        "Students, recent graduates and young professionals from any field. You don't need to be a tech person: what counts is your motivation to build something with AI.",
    },
    {
      id: "cost",
      question: "What does it cost?",
      answer: "Nothing. Taking part in the Makeathon is free.",
    },
    {
      id: "team",
      question: "Do I need a team or an idea?",
      answer:
        "No. We help you find a team before the event, and the challenges give you the problem to work on.",
    },
    {
      id: "skills",
      question: "What skills do I need?",
      answer:
        "None in particular. Workshops during the Makeathon cover many areas, so bring the motivation to learn and build.",
    },
    {
      id: "build",
      question: "What can I build?",
      answer:
        "Anything with AI at its core that answers your challenge. We don't hand out hardware, so plan a digital product you can demo to the jury.",
    },
    {
      id: "prizes",
      question: "What can I win?",
      answer: "Past editions awarded prizes such as money and a fast track into TUM.ai membership.",
    },
    {
      id: "next",
      question: "When is the next Makeathon?",
      answer: nextEditionSentence(edition),
    },
    {
      id: "league",
      question: `How does it relate to the ${league.name}?`,
      answer: `TUM.ai founded the league in ${league.foundedYear}, and the Makeathon ${results2026.edition} was its first match. Every team from that weekend joined the league's first season.`,
    },
    {
      id: "contact",
      question: "Who do I ask about anything else?",
      answer: (
        <>
          Email{" "}
          <Anchor href={`mailto:${site.questionsEmail}`} className="underline underline-offset-4">
            {site.questionsEmail}
          </Anchor>{" "}
          and the Makeathon team gets back to you.
        </>
      ),
    },
  ];
}
