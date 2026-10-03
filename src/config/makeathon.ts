/**
 * Every fact on the site lives here: dates, figures, names, links. Copy in
 * `src/content` is written as functions of these values, so changing a date
 * or a number is one edit, and `makeathon.test.ts` guards the invariants.
 *
 * Unknown facts stay `null` (or carry `confirmed: false`) with a
 * `TODO(content)` note; never fill them with a plausible guess.
 *
 * Instants carry Munich's explicit UTC offset ("+02:00" in summer, "+01:00"
 * in winter); a test checks every offset against the real DST rule.
 */

/** A moment in Munich: ISO 8601 with Europe/Berlin's offset, e.g. "2026-04-17T18:00:00+02:00". */
export type Instant = string;
/** A Munich calendar date: "YYYY-MM-DD". */
export type CalendarDate = string;

/* ------------------------------------------------------------------------ */
/* Organisation and contact                                                 */
/* ------------------------------------------------------------------------ */

export const site = {
  name: "TUM.ai Makeathon",
  url: "https://makeathon.tum-ai.com",
  /** TUM.ai's own pages the site links to. */
  tumai: {
    url: "https://www.tum-ai.com",
    imprint: "https://www.tum-ai.com/imprint",
    privacy: "https://www.tum-ai.com/data-privacy",
  },
  /** Partnerships: the address the old site's sponsor button used. */
  partnerEmail: "makeathon@tum-ai.com",
  /** Participant questions: the address in the old site's FAQ. */
  questionsEmail: "makeathon-communication@tum-ai.com",
  social: {
    instagram: "https://www.instagram.com/tum.ai_official/",
    linkedin: "https://www.linkedin.com/school/tum-ai/",
  },
  /** The first Makeathon (April 2021). */
  since: 2021,
} as const;

/** The European Hackathon League, which TUM.ai founded in 2026. */
export const league = {
  name: "European Hackathon League",
  url: "https://ehl.tum-ai.com",
  foundedYear: 2026,
  /** The Makeathon 2026 was the league's first match ("Match 1", Munich). */
  makeathonMatch: "Match 1",
  matchUrl: "https://ehl.tum-ai.com/matches/munich-1",
  /** League points for places one to five in each challenge. */
  points: [8, 7, 6, 4, 4],
} as const;

/* ------------------------------------------------------------------------ */
/* The next edition                                                         */
/* ------------------------------------------------------------------------ */

export type NextEdition = {
  year: number;
  /** The 48 hours: kick-off and the end of the awards. Null until fixed. */
  weekend: { kickoff: Instant; end: Instant } | null;
  /** Where it takes place, e.g. "TUM Main Campus, Munich". */
  venue: string | null;
  applications: {
    opens: Instant | null;
    closes: Instant | null;
    /** The application form. */
    url: string | null;
  };
  /** A form that tells people when applications open. */
  notifyUrl: string | null;
};

export const nextEdition: NextEdition = {
  year: 2027,
  // TODO(content): the 2027 weekend, venue and application window are not fixed yet.
  weekend: null,
  venue: null,
  applications: { opens: null, closes: null, url: null },
  // TODO(content): a sign-up form or mailing list for "tell me when applications open".
  notifyUrl: null,
};

/* ------------------------------------------------------------------------ */
/* Organisations and logos                                                  */
/* ------------------------------------------------------------------------ */

export type Logo = { src: string; width: number; height: number };
export type Organization = {
  name: string;
  /** Artwork for light backgrounds, in brand colour. */
  logo?: Logo;
  /** White artwork for dark bands. */
  logoOnDark?: Logo;
};

const l = (src: string, width: number, height: number): Logo => ({ src, width, height });

export const organizations = {
  // 2026 challenge and tech partners: white artwork from the league's site.
  happyrobot: { name: "HappyRobot", logoOnDark: l("/logos/2026/happyrobot.svg", 401, 61) },
  spherecast: { name: "Spherecast", logoOnDark: l("/logos/2026/spherecast.svg", 1588, 262) },
  osapiens: {
    name: "osapiens",
    logo: l("/logos/partners/osapiens.svg", 143, 60),
    logoOnDark: l("/logos/2026/osapiens.webp", 800, 223),
  },
  reply: {
    name: "Reply",
    logo: l("/logos/partners/reply.webp", 500, 133),
    logoOnDark: l("/logos/2026/reply.webp", 614, 164),
  },
  google: { name: "Google", logoOnDark: l("/logos/2026/google.webp", 800, 262) },
  amd: { name: "AMD", logoOnDark: l("/logos/2026/amd.svg", 277, 66) },
  elevenlabs: { name: "ElevenLabs", logoOnDark: l("/logos/2026/elevenlabs.svg", 694, 90) },
  cognee: { name: "Cognee", logoOnDark: l("/logos/2026/cognee.webp", 800, 202) },
  dify: { name: "Dify", logoOnDark: l("/logos/2026/dify.svg", 200, 89) },
  // Partners of earlier editions: the old site's "Previous Sponsors" plus the
  // partners named in each edition's record.
  openai: { name: "OpenAI", logo: l("/logos/partners/openai-wordmark.webp", 440, 121) },
  appliedai: { name: "appliedAI", logo: l("/logos/partners/applied-ai.webp", 347, 64) },
  tumVentureLabs: {
    name: "TUM Venture Labs",
    logo: l("/logos/partners/tum-venture-labs.webp", 464, 80),
  },
  microsoft: { name: "Microsoft", logo: l("/logos/partners/microsoft.webp", 500, 106) },
  ibm: { name: "IBM", logo: l("/logos/partners/ibm.png", 500, 200) },
  infineon: { name: "Infineon", logo: l("/logos/partners/infineon.webp", 343, 150) },
  deloitte: { name: "Deloitte", logo: l("/logos/partners/deloitte.webp", 442, 84) },
  netapp: { name: "NetApp", logo: l("/logos/partners/netapp.webp", 800, 141) },
  mi4people: { name: "MI4People", logo: l("/logos/partners/mi4people.webp", 150, 150) },
  roche: { name: "Roche", logo: l("/logos/partners/roche.svg", 1000, 551) },
  tng: { name: "TNG Technology Consulting", logo: l("/logos/partners/tng.webp", 619, 92) },
  esa: { name: "ESA", logo: l("/logos/partners/esa.svg", 1000, 375) },
  bmw: { name: "BMW Group", logo: l("/logos/partners/bmw.svg", 1014, 1014) },
  gresearch: { name: "G-Research", logo: l("/logos/partners/g-research.webp", 800, 129) },
  cohere: { name: "Cohere", logo: l("/logos/partners/cohere.svg", 118, 20) },
  daiki: { name: "Daiki", logo: l("/logos/partners/daiki.webp", 800, 252) },
  mercedes: { name: "Mercedes-Benz", logo: l("/logos/partners/mercedes-benz.webp", 753, 753) },
  salesforce: { name: "Salesforce", logo: l("/logos/partners/salesforce.webp", 800, 560) },
  hauner: {
    name: "Dr. von Hauner Children's Hospital",
    logo: l("/logos/partners/hauner.webp", 800, 560),
  },
  check24: { name: "CHECK24", logo: l("/logos/partners/check24.webp", 500, 123) },
  quantco: { name: "QuantCo", logo: l("/logos/partners/quantco.webp", 800, 217) },
  janeStreet: { name: "Jane Street", logo: l("/logos/partners/jane-street.svg", 181, 49) },
  alephAlpha: { name: "Aleph Alpha", logo: l("/logos/partners/aleph-alpha.webp", 303, 150) },
  allianz: { name: "Allianz", logo: l("/logos/partners/allianz.webp", 800, 207) },
  jetbrains: { name: "JetBrains", logo: l("/logos/partners/jetbrains.svg", 298, 64) },
  careForRare: {
    name: "Care-for-Rare Foundation",
    logo: l("/logos/partners/care-for-rare.webp", 800, 284),
  },
  lmuKlinikum: { name: "LMU Klinikum", logo: l("/logos/partners/lmu-klinikum.webp", 800, 225) },
  ryver: { name: "Ryver AI", logo: l("/logos/partners/ryver.webp", 800, 260) },
  helmholtz: {
    name: "Helmholtz Munich",
    logo: l("/logos/partners/helmholtz-munich.svg", 1301, 100),
  },
  msg: { name: "msg", logo: l("/logos/partners/msg.webp", 800, 250) },
} as const satisfies Record<string, Organization>;

export type OrgKey = keyof typeof organizations;

/* ------------------------------------------------------------------------ */
/* The 2026 edition: the weekend the site replays                           */
/* ------------------------------------------------------------------------ */

/** When a moment of the weekend happens. */
export type MomentTime =
  /** A clock time. */
  | { at: Instant }
  /** Sunrise or sunset over the venue on that day, computed from the solar model. */
  | { sun: "rise" | "set"; day: CalendarDate }
  /** The midnight that starts that day. */
  | { midnight: CalendarDate };

export type WeekendMoment = {
  key: string;
  title: string;
  text: string;
  time: MomentTime;
  /**
   * False when the clock time is a placeholder (only the order is known).
   * The site then shows `approx` instead of a time.
   */
  confirmed: boolean;
  /** Plain wording for an unconfirmed time, e.g. "Friday evening". */
  approx?: string;
};

export type ReferenceWeekend = {
  /** Which edition the replay shows. */
  edition: string;
  place: { name: string; city: string; latitude: number; longitude: number };
  /** The start of the 48 hours. */
  start: Instant;
  /** False while `start` is a placeholder. */
  startConfirmed: boolean;
  hours: number;
  moments: WeekendMoment[];
};

/**
 * The Makeathon 2026 weekend (17 to 19 April 2026, TUM Main Campus). The old
 * site's 2026 roadmap: "Following the Opening Ceremony, the Makeathon kicks
 * off on-site at the TUM Main Campus. Here, the challenges are presented and
 * the hacking starts." Sunrise, sunset and midnight are astronomy and clock
 * facts; the schedule times are not published.
 */
export const referenceWeekend: ReferenceWeekend = {
  edition: "2026",
  // TUM Main Campus, Arcisstraße 21.
  place: { name: "TUM Main Campus", city: "Munich", latitude: 48.14966, longitude: 11.56786 },
  // TODO(content): the real kick-off time of the Makeathon 2026.
  start: "2026-04-17T18:00:00+02:00",
  startConfirmed: false,
  hours: 48,
  moments: [
    {
      key: "kickoff",
      title: "Kick-off",
      text: "The opening ceremony at TUM. The challenges are presented and the hacking starts.",
      time: { at: "2026-04-17T18:00:00+02:00" },
      confirmed: false,
      approx: "Friday evening",
    },
    {
      key: "sunset-friday",
      title: "Sunset",
      text: "The first evening.",
      time: { sun: "set", day: "2026-04-17" },
      confirmed: true,
    },
    {
      key: "midnight-saturday",
      title: "Midnight",
      text: "The first night.",
      time: { midnight: "2026-04-18" },
      confirmed: true,
    },
    {
      key: "sunrise-saturday",
      title: "Sunrise",
      text: "Day two over Munich.",
      time: { sun: "rise", day: "2026-04-18" },
      confirmed: true,
    },
    {
      key: "workshops",
      title: "Workshops and talks",
      text: "Sessions with speakers and partners run alongside the hacking.",
      // TODO(content): workshop times.
      time: { at: "2026-04-18T11:00:00+02:00" },
      confirmed: false,
      approx: "Saturday",
    },
    {
      key: "sunset-saturday",
      title: "Sunset",
      text: "The second evening.",
      time: { sun: "set", day: "2026-04-18" },
      confirmed: true,
    },
    {
      key: "midnight-sunday",
      title: "Midnight",
      text: "The second night, and the last.",
      time: { midnight: "2026-04-19" },
      confirmed: true,
    },
    {
      key: "sunrise-sunday",
      title: "Sunrise",
      text: "The final day.",
      time: { sun: "rise", day: "2026-04-19" },
      confirmed: true,
    },
    {
      key: "submissions",
      title: "Submissions close",
      text: "Every team hands in its prototype.",
      // TODO(content): the submission deadline.
      time: { at: "2026-04-19T12:00:00+02:00" },
      confirmed: false,
      approx: "Sunday",
    },
    {
      key: "pitches",
      title: "Pitches",
      text: "Teams present to the challenge partners and the jury.",
      // TODO(content): pitch times.
      time: { at: "2026-04-19T14:00:00+02:00" },
      confirmed: false,
      approx: "Sunday afternoon",
    },
    {
      key: "results",
      title: "Results",
      text: "The top five of each challenge take the first points of the league.",
      // TODO(content): the time of the award ceremony.
      time: { at: "2026-04-19T17:30:00+02:00" },
      confirmed: false,
      approx: "Sunday evening",
    },
  ],
};

/** The 2026 results, as the league's match page lists them. */
export const results2026 = {
  edition: "2026",
  /** "500+ Participants" (league match page). */
  builders: 500,
  teams: 101,
  hours: 48,
  challenges: [
    {
      partner: "happyrobot",
      teams: ["Multiply", "Yantra", "AskOnce", "Clerque", "undeterministic tornado"],
    },
    {
      partner: "spherecast",
      teams: ["bussies", "Harissa", "Default Name", "ASM", "Optily"],
    },
    {
      partner: "osapiens",
      teams: ["Non Deterministic", "Aguacates", "OMEGA-EARTH", "error404.ai", "GeoPixels"],
    },
    {
      partner: "reply",
      teams: ["TakeTheMoneyAndRun", "AgenTUM", "y/agent", "StudiClaw", "5 heads"],
    },
  ],
  techPartners: ["google", "amd", "elevenlabs", "cognee", "dify"],
  source: { url: "https://ehl.tum-ai.com/matches/munich-1", retrieved: "2026-10-02" },
} as const satisfies {
  challenges: readonly { partner: OrgKey; teams: readonly string[] }[];
  techPartners: readonly OrgKey[];
  [key: string]: unknown;
};

/* ------------------------------------------------------------------------ */
/* Every edition                                                            */
/* ------------------------------------------------------------------------ */

export type Edition = {
  key: string;
  name: string;
  /** First day, a Munich calendar date. */
  start: CalendarDate;
  /** Last day, a Munich calendar date. */
  end: CalendarDate;
  city: string;
  note: string;
  link?: { label: string; href: string };
  poster: { src: string; alt: string };
};

/**
 * Every Makeathon, oldest first. Sources (2026-10-01, from the TUM.ai
 * website's research): each edition's Devpost page, UnternehmerTUM (2021),
 * Munich Startup (spring 2022), the old site's October 2021 page (Wayback
 * Machine) and the league's site (2026). Posters: TUM.ai's announcement
 * posts on LinkedIn.
 */
export const editions: readonly Edition[] = [
  {
    key: "2021",
    name: "GPT-3 Makeathon",
    start: "2021-04-16",
    end: "2021-04-18",
    city: "Munich",
    note: "The first Makeathon, built on GPT-3 with OpenAI, appliedAI and TUM Venture Labs, and judged by a jury from Cherry Ventures, Microsoft and IBM.",
    poster: {
      src: "/editions/makeathon-2021-gpt-3.webp",
      alt: "Four track cards on black: Legal Tech, Healthcare, Marketing and Knowledge Management",
    },
  },
  {
    key: "2021-autumn",
    name: "Virtual Makeathon",
    start: "2021-10-15",
    end: "2021-10-17",
    city: "Online",
    note: "A virtual 48-hour edition with Microsoft and appliedAI. Team Cabalytics won with CabMate, which predicts where taxis will be needed across the city.",
    poster: {
      src: "/editions/makeathon-2021-autumn.webp",
      alt: "A white card titled Why join?, listing awards, cross-functional teams, networking and expert support",
    },
  },
  {
    key: "2022-spring",
    name: "AI4SocialGood",
    start: "2022-04-22",
    end: "2022-04-24",
    city: "Munich",
    note: "Challenges in education, environment and medtech from Infineon, Deloitte, NetApp and MI4People.",
    poster: {
      src: "/editions/makeathon-2022-spring.webp",
      alt: "Makeathon is back, in violet and white on dark blue, dated April 2022",
    },
  },
  {
    key: "2022-autumn",
    name: "AI for Global Impact",
    start: "2022-09-30",
    end: "2022-10-02",
    city: "Munich",
    note: "A hybrid edition with Microsoft, Roche, IBM and TNG Technology Consulting.",
    poster: {
      src: "/editions/makeathon-2022-autumn.webp",
      alt: "Makeathon is back, a hybrid 48-hour team challenge on the theme AI4GlobalImpact",
    },
  },
  {
    key: "2023",
    name: "AI for everyone",
    start: "2023-04-27",
    end: "2023-04-30",
    city: "Munich",
    note: "On the Garching campus, with ESA, Microsoft, the BMW Group, G-Research, Cohere and Daiki.",
    poster: {
      src: "/editions/makeathon-2023.webp",
      alt: "AI is for everyone. Makeathon is back. Over a violet wave, dated 28 to 30 April",
    },
  },
  {
    key: "2024",
    name: "Makeathon 2024",
    start: "2024-04-26",
    end: "2024-04-28",
    city: "Munich",
    note: "Sixteen partners, from Mercedes-Benz and Salesforce to Dr. von Hauner Children's Hospital, whose challenge became a paper.",
    link: { label: "Read the paper", href: "https://arxiv.org/abs/2510.25277" },
    poster: {
      src: "/editions/makeathon-2024.webp",
      alt: "Makeathon is back, Spring 2024, over a lilac wave",
    },
  },
  {
    key: "2025",
    name: "Makeathon 2025",
    start: "2025-04-25",
    end: "2025-04-27",
    city: "Munich",
    note: "Challenges from CHECK24 and Reply and an open track by OpenAI, with QuantCo, Jane Street and Entrepreneur First.",
    poster: {
      src: "/editions/makeathon-2025.webp",
      alt: "Join the next Makeathon, in gold on navy, with the sun wordmark and the dates 25 to 27 April 2025",
    },
  },
  {
    key: "2026",
    name: "Makeathon 2026",
    start: "2026-04-17",
    end: "2026-04-19",
    city: "Munich",
    note: "101 teams on challenges from HappyRobot, Spherecast, osapiens and Reply. The first match of the European Hackathon League.",
    poster: {
      src: "/editions/makeathon-2026.webp",
      alt: "The Makeathon wordmark with a rising sun over amber halftone waves: 500+ builders, 17 to 19 April",
    },
  },
];

/* ------------------------------------------------------------------------ */
/* Partners                                                                 */
/* ------------------------------------------------------------------------ */

export const partners = {
  /** What a challenge comes with (the TUM.ai website's hackathon offer). */
  offer: [
    { title: "Your own challenge track", text: "Teams build for a problem you set." },
    { title: "Access to talent", text: "The CVs of participants who opt in to share them." },
    { title: "Your brand on site", text: "Your logo at the venue and a booth of your own." },
    { title: "A company pitch", text: "Introduce your company on stage to every participant." },
  ],
  addOns: "Add a workshop slot, or sponsor the catering.",
  /**
   * An outcome from the TUM.ai website's partner cases: the osapiens
   * challenge at the Makeathon 2026.
   */
  outcome: {
    organization: "osapiens",
    text: "One hackathon. 40 competing teams. 20+ applications straight into the hiring pipeline.",
  },
  /** Partners of earlier editions, for the logo wall. */
  past: [
    "openai",
    "microsoft",
    "bmw",
    "mercedes",
    "esa",
    "ibm",
    "salesforce",
    "allianz",
    "roche",
    "infineon",
    "deloitte",
    "check24",
    "janeStreet",
    "quantco",
    "gresearch",
    "cohere",
    "alephAlpha",
    "jetbrains",
    "netapp",
    "tng",
    "msg",
    "appliedai",
    "tumVentureLabs",
    "helmholtz",
    "lmuKlinikum",
    "hauner",
    "careForRare",
    "mi4people",
    "daiki",
    "ryver",
    "reply",
    "osapiens",
  ],
} as const satisfies { past: readonly OrgKey[]; [key: string]: unknown };

/* ------------------------------------------------------------------------ */
/* Photos                                                                   */
/* ------------------------------------------------------------------------ */

export const photos = {
  // Source: the league's Makeathon page (ehl.tum-ai.com/makeathon/audience.jpg).
  // TODO(content): confirm the edition (2026?) for a dated caption.
  audience: {
    src: "/photos/makeathon-audience.webp",
    width: 1920,
    height: 1280,
    alt: "Participants with laptops and yellow lanyards fill the rows of a lecture hall, smiling toward the stage",
    caption: "Participants in a TUM lecture hall at the Makeathon.",
  },
  // Source: the TUM.ai website (homepage). TODO(content): which edition.
  team: {
    src: "/photos/makeathon-team.webp",
    width: 1920,
    height: 1280,
    alt: "The Makeathon team, in Makeathon shirts and lanyards, on stage in front of the event screen",
    caption: "The Makeathon team on stage.",
  },
} as const;
