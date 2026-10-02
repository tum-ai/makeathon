/**
 * The sun over Munich, from NOAA's solar position equations (the algorithm
 * of NOAA's Solar Calculator spreadsheet, after Jean Meeus, "Astronomical
 * Algorithms"). Accurate to well under a minute for rise and set times at
 * mid latitudes this century, which `solar.test.ts` checks against
 * published values.
 *
 * Server only: pages compute what they need and pass compact samples to the
 * client (see `weekend.ts`).
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Geometric elevation of the sun's centre at sunrise and sunset (refraction and semi-diameter). */
export const HORIZON = -0.833;
/** Civil twilight: the sun 6° below the horizon. */
export const CIVIL_TWILIGHT = -6;

export type SunPosition = {
  /** Degrees above the horizon (geometric, no refraction). */
  elevation: number;
  /** Degrees clockwise from north (90 is east, 270 west). */
  azimuth: number;
};

function solarParameters(ms: number) {
  const julianDay = ms / 86_400_000 + 2_440_587.5;
  const t = (julianDay - 2_451_545) / 36_525; // Julian centuries since J2000
  const meanLongitude = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const m = meanAnomaly * RAD;
  const centre =
    Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m) * 0.000289;
  const omega = (125.04 - 1934.136 * t) * RAD;
  const apparentLongitude = (meanLongitude + centre - 0.00569 - 0.00478 * Math.sin(omega)) * RAD;
  const meanObliquity =
    23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = (meanObliquity + 0.00256 * Math.cos(omega)) * RAD;
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(apparentLongitude));
  const y = Math.tan(obliquity / 2) ** 2;
  const l0 = meanLongitude * RAD;
  // Equation of time, in minutes.
  const equationOfTime =
    4 *
    DEG *
    (y * Math.sin(2 * l0) -
      2 * eccentricity * Math.sin(m) +
      4 * eccentricity * y * Math.sin(m) * Math.cos(2 * l0) -
      0.5 * y * y * Math.sin(4 * l0) -
      1.25 * eccentricity * eccentricity * Math.sin(2 * m));
  return { declination, equationOfTime };
}

/** Where the sun stands at a moment, seen from latitude/longitude (degrees, east positive). */
export function sunPosition(ms: number, latitude: number, longitude: number): SunPosition {
  const { declination, equationOfTime } = solarParameters(ms);
  const minutesUtc = (((ms % 86_400_000) + 86_400_000) % 86_400_000) / 60_000;
  const trueSolarTime = (((minutesUtc + equationOfTime + 4 * longitude) % 1440) + 1440) % 1440;
  const hourAngle = trueSolarTime / 4 - 180; // degrees, negative before solar noon
  const lat = latitude * RAD;
  const ha = hourAngle * RAD;
  const cosZenith = Math.min(
    1,
    Math.max(
      -1,
      Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(ha),
    ),
  );
  const zenith = Math.acos(cosZenith);
  const elevation = 90 - zenith * DEG;

  const sinZenith = Math.sin(zenith);
  let azimuth: number;
  if (Math.abs(sinZenith) < 1e-9) azimuth = 180;
  else {
    const cosAz = Math.min(
      1,
      Math.max(
        -1,
        (Math.sin(lat) * cosZenith - Math.sin(declination)) / (Math.cos(lat) * sinZenith),
      ),
    );
    const az = Math.acos(cosAz) * DEG;
    azimuth = hourAngle > 0 ? (az + 180) % 360 : (540 - az) % 360;
  }
  return { elevation, azimuth };
}

/**
 * Moments between `from` and `to` when the sun's elevation crosses
 * `threshold`, found by stepping and then bisecting to the second.
 */
export function crossings(
  from: number,
  to: number,
  latitude: number,
  longitude: number,
  threshold = HORIZON,
  stepMinutes = 5,
): { at: number; rising: boolean }[] {
  const step = stepMinutes * 60_000;
  const elevationAt = (ms: number) => sunPosition(ms, latitude, longitude).elevation - threshold;
  const found: { at: number; rising: boolean }[] = [];
  let a = from;
  let fa = elevationAt(a);
  while (a < to) {
    const b = Math.min(a + step, to);
    const fb = elevationAt(b);
    if (fa === 0 || fa * fb < 0) {
      let lo = a;
      let hi = b;
      let flo = fa;
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        const fmid = elevationAt(mid);
        if (flo * fmid <= 0) hi = mid;
        else {
          lo = mid;
          flo = fmid;
        }
      }
      found.push({ at: Math.round((lo + hi) / 2), rising: fb > fa });
    }
    a = b;
    fa = fb;
  }
  return found;
}

/** Sunrise, sunset and the civil twilights between two moments (normally one Munich day). */
export function sunEvents(from: number, to: number, latitude: number, longitude: number) {
  const horizon = crossings(from, to, latitude, longitude, HORIZON);
  const civil = crossings(from, to, latitude, longitude, CIVIL_TWILIGHT);
  return {
    sunrise: horizon.find((c) => c.rising)?.at ?? null,
    sunset: horizon.find((c) => !c.rising)?.at ?? null,
    civilDawn: civil.find((c) => c.rising)?.at ?? null,
    civilDusk: civil.find((c) => !c.rising)?.at ?? null,
  };
}

/** The moment of highest elevation between two moments, to the second. */
export function solarNoon(from: number, to: number, latitude: number, longitude: number): number {
  let lo = from;
  let hi = to;
  while (hi - lo > 1000) {
    const third = (hi - lo) / 3;
    const a = lo + third;
    const b = hi - third;
    if (
      sunPosition(a, latitude, longitude).elevation < sunPosition(b, latitude, longitude).elevation
    )
      lo = a;
    else hi = b;
  }
  return Math.round((lo + hi) / 2);
}
