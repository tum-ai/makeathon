import "./globals.css";

import { MotionProvider } from "@tum.ai/ui-kit";
import { Footer, Header, SkipLink } from "@tum.ai/ui-kit/shell";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { NavScroll } from "@/components/nav-scroll";
import { nextEdition, site } from "@/config/makeathon";
import { footerCopy, heroCopy, navigation } from "@/content/copy";
import { getNow } from "@/lib/now";
import { headerAction } from "@/lib/phase";
import { footerColumns, logo } from "@/shell/site-shell";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const description = heroCopy.lead;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "TUM.ai Makeathon", template: "%s · TUM.ai Makeathon" },
  description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "TUM.ai Makeathon",
    description,
    locale: "en",
  },
  twitter: { card: "summary_large_image", title: "TUM.ai Makeathon", description },
};

/*
 * Safari 26 ignores theme-color and tints its status bar and toolbar from the
 * page. As on tum-ai.com, nothing dark spans the whole document: no
 * `color-scheme` meta and no tone on `#app-root` (below). Each band brings its
 * own tone, and the root canvas between them is the kit's brand black
 * (shell.css). The theme-color is for browsers that still read it (Chrome on
 * Android) and matches that canvas. See "Safari bars" in AGENTS.md.
 */
export const viewport: Viewport = {
  themeColor: "#0d0214",
};

// Marks the document as scripted before the first paint, so pinned layouts
// (the 48-hour replay) never shift when the page hydrates.
const scriptedMarker = "document.documentElement.dataset.js=''";

export default function RootLayout({ children }: { children: ReactNode }) {
  const now = getNow();
  const cta = headerAction(nextEdition, now);
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptedMarker }} />
      </head>
      <body>
        <MotionProvider>
          <div id="app-root">
            <SkipLink />
            <Header
              logo={logo}
              navigation={navigation.map((link) => ({ ...link }))}
              cta={cta}
              homeLabel="TUM.ai Makeathon, back to the top"
            />
            {children}
            <Footer
              logo={logo}
              tagline={footerCopy.tagline}
              columns={footerColumns}
              bottomLine={<p>{footerCopy.bottomLine(new Date(now).getUTCFullYear())}</p>}
            />
          </div>
        </MotionProvider>
        <NavScroll />
      </body>
    </html>
  );
}
