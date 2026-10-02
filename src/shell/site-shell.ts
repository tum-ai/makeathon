import type { FooterColumn, ShellLogo } from "@tum.ai/ui-kit/shell";

import { league, site } from "@/config/makeathon";
import { navigation } from "@/content/copy";

/** The white TUM.ai logo from the ui-kit's assets (both bands are dark). */
export const logo: ShellLogo = {
  src: "/brand/tum-ai-logo-white.svg",
  width: 1640,
  height: 406,
  alt: "TUM.ai",
};

export const footerColumns: FooterColumn[] = [
  {
    id: "makeathon",
    title: "Makeathon",
    links: navigation.map((link) => ({ ...link })),
  },
  {
    id: "tum-ai",
    title: "TUM.ai",
    links: [
      { href: site.tumai.url, label: "TUM.ai website" },
      { href: league.url, label: league.name },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    links: [
      { href: `mailto:${site.partnerEmail}`, label: "Partnerships" },
      { href: `mailto:${site.questionsEmail}`, label: "Questions" },
      { href: site.social.instagram, label: "Instagram" },
      { href: site.social.linkedin, label: "LinkedIn" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    links: [
      { href: site.tumai.imprint, label: "Imprint" },
      { href: site.tumai.privacy, label: "Privacy" },
    ],
  },
];
