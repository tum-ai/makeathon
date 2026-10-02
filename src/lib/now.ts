/**
 * The server's clock. Outside production, `MAKEATHON_NOW` (any ISO 8601
 * instant) pins it, so previews and end-to-end tests can show every phase:
 * `MAKEATHON_NOW=2027-04-01T12:00:00+02:00 bun dev`.
 */
export function getNow(): number {
  const pinned = process.env.MAKEATHON_NOW;
  if (pinned && process.env.VERCEL_ENV !== "production") {
    const ms = Date.parse(pinned);
    if (!Number.isNaN(ms)) return ms;
  }
  return Date.now();
}
