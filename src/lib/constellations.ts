/**
 * Real sky catalog for the background "system field".
 *
 * Single source of truth for the constellation visualization. Every star is a
 * real object from the Hipparcos catalogue (J2000 epoch): HIP identifier,
 * proper name, right ascension / declination and apparent visual magnitude.
 * Nothing here is invented — the asterisms (edges) are the classic figures of
 * each constellation and magnitudes map to real brightness.
 *
 * Reference: Wikipedia "List of stars in <constellation>", Hipparcos catalogue.
 */

export interface Star {
  /** Hipparcos catalogue number. */
  hip: number;
  /** Common/proper name. */
  name: string;
  /** Right ascension, J2000, sexagesimal (e.g. "05h 55m 10.29s"). */
  ra: string;
  /** Declination, J2000, sexagesimal (e.g. "+07° 24′ 25.3″"). */
  dec: string;
  /** Apparent visual magnitude (smaller = brighter). */
  magnitude: number;
}

export interface ConstellationData {
  /** IAU three-letter abbreviation. */
  iau: string;
  name: string;
  stars: Star[];
  /** Asterism lines as index pairs into `stars`. */
  edges: [number, number][];
}

const ORI: ConstellationData = {
  iau: 'ORI',
  name: 'Orion',
  stars: [
    {
      hip: 27989,
      name: 'Betelgeuse',
      ra: '05h 55m 10.29s',
      dec: '+07° 24′ 25.3″',
      magnitude: 0.42,
    },
    { hip: 24436, name: 'Rigel', ra: '05h 14m 32.27s', dec: '−08° 12′ 05.9″', magnitude: 0.18 },
    { hip: 25336, name: 'Bellatrix', ra: '05h 25m 07.87s', dec: '+06° 20′ 59.0″', magnitude: 1.64 },
    { hip: 26311, name: 'Alnilam', ra: '05h 36m 12.81s', dec: '−01° 12′ 06.9″', magnitude: 1.69 },
    { hip: 26727, name: 'Alnitak', ra: '05h 40m 45.52s', dec: '−01° 56′ 33.3″', magnitude: 1.88 },
    { hip: 25930, name: 'Mintaka', ra: '05h 32m 00.40s', dec: '−00° 17′ 56.7″', magnitude: 2.2 },
    { hip: 27366, name: 'Saiph', ra: '05h 47m 45.39s', dec: '−09° 40′ 10.6″', magnitude: 2.07 },
    { hip: 26207, name: 'Meissa', ra: '05h 35m 08.28s', dec: '+09° 56′ 03.0″', magnitude: 3.47 },
  ],
  edges: [
    [0, 7],
    [0, 2],
    [2, 3],
    [3, 5],
    [5, 4],
    [4, 0],
    [4, 1],
    [5, 6],
    [1, 6],
  ],
};

const UMA: ConstellationData = {
  iau: 'UMA',
  name: 'Ursa Major',
  stars: [
    { hip: 54061, name: 'Dubhe', ra: '11h 03m 43.84s', dec: '+61° 45′ 04.0″', magnitude: 1.79 },
    { hip: 53910, name: 'Merak', ra: '11h 01m 50.39s', dec: '+56° 22′ 56.4″', magnitude: 2.37 },
    { hip: 58001, name: 'Phecda', ra: '11h 53m 49.74s', dec: '+53° 41′ 41.0″', magnitude: 2.44 },
    { hip: 59774, name: 'Megrez', ra: '12h 15m 25.45s', dec: '+57° 01′ 57.4″', magnitude: 3.31 },
    { hip: 62956, name: 'Alioth', ra: '12h 54m 01.63s', dec: '+55° 57′ 35.4″', magnitude: 1.77 },
    { hip: 65378, name: 'Mizar', ra: '13h 23m 55.54s', dec: '+54° 55′ 31.3″', magnitude: 2.23 },
    { hip: 67301, name: 'Alkaid', ra: '13h 47m 32.55s', dec: '+49° 18′ 47.9″', magnitude: 1.86 },
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [3, 4],
    [4, 5],
    [5, 6],
  ],
};

const CAS: ConstellationData = {
  iau: 'CAS',
  name: 'Cassiopeia',
  stars: [
    { hip: 3179, name: 'Schedar', ra: '00h 40m 30.39s', dec: '+56° 32′ 14.7″', magnitude: 2.24 },
    { hip: 746, name: 'Caph', ra: '00h 09m 10.09s', dec: '+59° 09′ 00.8″', magnitude: 2.28 },
    { hip: 4427, name: 'Gamma Cas', ra: '00h 56m 42.50s', dec: '+60° 43′ 00.3″', magnitude: 2.47 },
    { hip: 6686, name: 'Ruchbah', ra: '01h 25m 48.60s', dec: '+60° 14′ 07.5″', magnitude: 2.68 },
    { hip: 8886, name: 'Segin', ra: '01h 54m 23.68s', dec: '+63° 40′ 12.5″', magnitude: 3.35 },
  ],
  edges: [
    [1, 0],
    [0, 2],
    [2, 3],
    [3, 4],
  ],
};

const LEO: ConstellationData = {
  iau: 'LEO',
  name: 'Leo',
  stars: [
    { hip: 49669, name: 'Regulus', ra: '10h 08m 22.46s', dec: '+11° 58′ 01.9″', magnitude: 1.36 },
    { hip: 57632, name: 'Denebola', ra: '11h 49m 03.88s', dec: '+14° 34′ 20.4″', magnitude: 2.14 },
    { hip: 50583, name: 'Algieba', ra: '10h 19m 58.16s', dec: '+19° 50′ 30.7″', magnitude: 2.37 },
    { hip: 54872, name: 'Zosma', ra: '11h 14m 06.41s', dec: '+20° 31′ 26.5″', magnitude: 2.56 },
    { hip: 54879, name: 'Chertan', ra: '11h 14m 14.44s', dec: '+15° 25′ 47.1″', magnitude: 3.33 },
    { hip: 50335, name: 'Adhafera', ra: '10h 16m 41.40s', dec: '+23° 25′ 02.4″', magnitude: 3.43 },
  ],
  edges: [
    [5, 2],
    [2, 4],
    [4, 0],
    [0, 3],
    [3, 1],
    [2, 3],
  ],
};

const SCO: ConstellationData = {
  iau: 'SCO',
  name: 'Scorpius',
  stars: [
    { hip: 80763, name: 'Antares', ra: '16h 29m 24.47s', dec: '−26° 25′ 55.0″', magnitude: 0.91 },
    { hip: 85927, name: 'Shaula', ra: '17h 33m 36.53s', dec: '−37° 06′ 13.5″', magnitude: 1.62 },
    { hip: 86228, name: 'Sargas', ra: '17h 37m 19.13s', dec: '−42° 59′ 52.2″', magnitude: 1.86 },
    { hip: 78401, name: 'Dschubba', ra: '16h 00m 20.01s', dec: '−22° 37′ 17.8″', magnitude: 2.29 },
    { hip: 78820, name: 'Acrab', ra: '16h 05m 26.23s', dec: '−19° 48′ 19.4″', magnitude: 2.62 },
    { hip: 85696, name: 'Lesath', ra: '17h 30m 45.84s', dec: '−37° 17′ 44.7″', magnitude: 2.7 },
    { hip: 80112, name: 'Sigma Sco', ra: '16h 21m 11.32s', dec: '−25° 35′ 33.9″', magnitude: 2.9 },
  ],
  edges: [
    [4, 3],
    [3, 6],
    [6, 0],
    [0, 2],
    [2, 1],
    [1, 5],
  ],
};

const CYG: ConstellationData = {
  iau: 'CYG',
  name: 'Cygnus',
  stars: [
    { hip: 102098, name: 'Deneb', ra: '20h 41m 25.91s', dec: '+45° 16′ 49.2″', magnitude: 1.25 },
    { hip: 100453, name: 'Sadr', ra: '20h 22m 13.70s', dec: '+40° 15′ 24.1″', magnitude: 2.23 },
    { hip: 95947, name: 'Albireo', ra: '19h 30m 43.29s', dec: '+27° 57′ 34.9″', magnitude: 3.05 },
    { hip: 102488, name: 'Gienah', ra: '20h 46m 12.43s', dec: '+33° 58′ 10.0″', magnitude: 2.48 },
    { hip: 97165, name: 'Delta Cyg', ra: '19h 44m 58.44s', dec: '+45° 07′ 50.5″', magnitude: 2.86 },
    { hip: 104732, name: 'Zeta Cyg', ra: '21h 12m 56.18s', dec: '+30° 13′ 37.5″', magnitude: 3.21 },
  ],
  edges: [
    [3, 4],
    [1, 3],
    [1, 5],
    [0, 1],
    [1, 2],
  ],
};

const CRU: ConstellationData = {
  iau: 'CRU',
  name: 'Crux',
  stars: [
    { hip: 60718, name: 'Acrux', ra: '12h 26m 35.94s', dec: '−63° 05′ 56.6″', magnitude: 1.4 },
    { hip: 62434, name: 'Mimosa', ra: '12h 47m 43.32s', dec: '−59° 41′ 19.4″', magnitude: 1.25 },
    { hip: 61084, name: 'Gacrux', ra: '12h 31m 09.93s', dec: '−57° 06′ 45.2″', magnitude: 1.6 },
    { hip: 59747, name: 'Imai', ra: '12h 15m 08.76s', dec: '−58° 44′ 56.0″', magnitude: 2.79 },
    {
      hip: 60260,
      name: 'Epsilon Cru',
      ra: '12h 21m 21.81s',
      dec: '−60° 24′ 04.9″',
      magnitude: 3.59,
    },
  ],
  edges: [
    [2, 0],
    [1, 3],
    [2, 3],
    [1, 0],
    [0, 4],
  ],
};

const SGR: ConstellationData = {
  iau: 'SGR',
  name: 'Sagittarius',
  stars: [
    {
      hip: 90185,
      name: 'Kaus Australis',
      ra: '18h 24m 10.31840s',
      dec: '−34° 23′ 0.46193″',
      magnitude: 1.85,
    },
    {
      hip: 92855,
      name: 'Nunki',
      ra: '18h 55m 15.92650s',
      dec: '−26° 17′ 48.2068″',
      magnitude: 2.05,
    },
    { hip: 93506, name: 'Ascella', ra: '19h 02m 36.72s', dec: '−29° 52′ 48.4″', magnitude: 2.6 },
    {
      hip: 89931,
      name: 'Kaus Media',
      ra: '18h 20m 59.62s',
      dec: '−29° 49′ 40.9″',
      magnitude: 2.72,
    },
    {
      hip: 90496,
      name: 'Kaus Borealis',
      ra: '18h 27m 58.27s',
      dec: '−25° 25′ 16.5″',
      magnitude: 2.82,
    },
    { hip: 88635, name: 'Alnasl', ra: '18h 05m 48.52s', dec: '−30° 25′ 25.1″', magnitude: 2.98 },
  ],
  edges: [
    [5, 0],
    [0, 3],
    [3, 1],
    [1, 2],
    [2, 4],
    [4, 3],
    [4, 5],
  ],
};

/** The eight constellations shown: visible from Bogotá (lat ≈ 4.6° N). */
export const CONSTELLATIONS: ConstellationData[] = [ORI, UMA, CAS, LEO, SCO, CYG, CRU, SGR];

/* ------------------------------------------------------------------ */
/* Coordinate parsing — sexagesimal catalogue values → decimal degrees */
/* ------------------------------------------------------------------ */

const RA_RE = /^(\d+)h\s+(\d+)m\s+([\d.]+)s$/;
const DEC_RE = /^([+\-\u2212])?(\d+)°\s+(\d+)′\s+([\d.]+)″$/;

export function parseRa(ra: string): number {
  const m = RA_RE.exec(ra.trim());
  if (!m) throw new Error(`Invalid right ascension: ${ra}`);
  const h = Number(m[1]) + Number(m[2]) / 60 + Number(m[3]) / 3600;
  return h * 15;
}

export function parseDec(dec: string): number {
  const m = DEC_RE.exec(dec.trim());
  if (!m) throw new Error(`Invalid declination: ${dec}`);
  const sign = m[1] === '−' || m[1] === '-' ? -1 : 1;
  return sign * (Number(m[2]) + Number(m[3]) / 60 + Number(m[4]) / 3600);
}

/* ------------------------------------------------------------------ */
/* Brightness mapping — apparent magnitude → visual weight (pure)      */
/* ------------------------------------------------------------------ */

/** Reference magnitude used to anchor the brightness scale. */
export const REFERENCE_MAGNITUDE = 1.5;

/** Flux relative to the reference magnitude: 2.512^(Δm) on a power scale. */
export function magnitudeToFlux(magnitude: number): number {
  return 10 ** (-0.4 * (magnitude - REFERENCE_MAGNITUDE));
}

/** World-space star radius derived from real flux. */
export function starRadius(magnitude: number): number {
  const flux = magnitudeToFlux(magnitude);
  return clamp(0.012 * Math.sqrt(flux), 0.0045, 0.022);
}

/** Grayscale factor 0..1 (1 = brightest) used for per-star color. */
export function starBrightness(magnitude: number): number {
  const flux = magnitudeToFlux(magnitude);
  // flux range over the catalog is roughly [0.14, 2.0]; sqrt softens the curve.
  const norm = Math.sqrt(Math.min(Math.max((flux - 0.12) / 1.9, 0), 1));
  return 0.3 + 0.7 * norm;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/* ------------------------------------------------------------------ */
/* Scene layout — gnomonic projection of each constellation to a plane */
/* ------------------------------------------------------------------ */

export interface SceneStar {
  /** Global index across the whole field. */
  index: number;
  iau: string;
  name: string;
  magnitude: number;
  radius: number;
  brightness: number;
  position: [number, number, number];
}

export interface SceneEdge {
  iau: string;
  from: [number, number, number];
  to: [number, number, number];
}

export interface SceneLink {
  from: [number, number, number];
  to: [number, number, number];
}

export interface ConstellationScene {
  stars: SceneStar[];
  edges: SceneEdge[];
  links: SceneLink[];
}

interface Placement {
  origin: [number, number, number];
  targetSize: number;
  rotation: number;
}

const PLACEMENTS: Record<string, Placement> = {
  ORI: { origin: [0, 0.45, 0.0], targetSize: 1.2, rotation: 0.12 },
  CAS: { origin: [-4.5, 1.7, -0.9], targetSize: 1.05, rotation: -0.3 },
  UMA: { origin: [4.3, 1.6, -0.6], targetSize: 1.05, rotation: 0.4 },
  LEO: { origin: [4.2, -1.6, -0.35], targetSize: 1.05, rotation: -0.35 },
  SCO: { origin: [-4.5, -1.5, -0.2], targetSize: 1.1, rotation: 0.25 },
  CYG: { origin: [-2.3, 1.85, -1.15], targetSize: 0.95, rotation: -0.2 },
  CRU: { origin: [2.3, 1.9, -1.05], targetSize: 0.85, rotation: 0.3 },
  SGR: { origin: [-2.4, -1.9, -0.8], targetSize: 1.0, rotation: 0.15 },
};

/** Project a constellation's stars onto a local tangent plane (gnomonic). */
export function projectConstellation(constellation: ConstellationData): { x: number; y: number }[] {
  const dec0 = (parseDec(constellation.stars[0].dec) * Math.PI) / 180;
  const ra0 = (parseRa(constellation.stars[0].ra) * Math.PI) / 180;
  const out: { x: number; y: number }[] = [];
  for (const star of constellation.stars) {
    const dec = (parseDec(star.dec) * Math.PI) / 180;
    const ra = (parseRa(star.ra) * Math.PI) / 180;
    const cosC =
      Math.sin(dec0) * Math.sin(dec) + Math.cos(dec0) * Math.cos(dec) * Math.cos(ra - ra0);
    out.push({
      x: (Math.cos(dec) * Math.sin(ra - ra0)) / cosC,
      y:
        (Math.cos(dec0) * Math.sin(dec) - Math.sin(dec0) * Math.cos(dec) * Math.cos(ra - ra0)) /
        cosC,
    });
  }
  return out;
}

/** Build the full 3D field: star positions, asterism edges, faint web links. */
export function buildScene(): ConstellationScene {
  const stars: SceneStar[] = [];
  const edges: SceneEdge[] = [];
  const centers: { iau: string; position: [number, number, number] }[] = [];

  let index = 0;
  for (const constellation of CONSTELLATIONS) {
    const placement = PLACEMENTS[constellation.iau];
    const proj = projectConstellation(constellation);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of proj) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    const span = Math.max(maxX - minX, maxY - minY);
    const scale = span > 0 ? placement.targetSize / span : 1;

    const cosR = Math.cos(placement.rotation);
    const sinR = Math.sin(placement.rotation);
    const points: [number, number, number][] = proj.map((p) => {
      const x = p.x * scale * cosR - p.y * scale * sinR;
      const y = p.x * scale * sinR + p.y * scale * cosR;
      return [placement.origin[0] + x, placement.origin[1] + y, placement.origin[2]];
    });

    constellation.stars.forEach((star, i) => {
      stars.push({
        index: index++,
        iau: constellation.iau,
        name: star.name,
        magnitude: star.magnitude,
        radius: starRadius(star.magnitude),
        brightness: starBrightness(star.magnitude),
        position: points[i],
      });
    });

    for (const [a, b] of constellation.edges) {
      edges.push({ iau: constellation.iau, from: points[a], to: points[b] });
    }

    const center: [number, number, number] = [
      ((minX + maxX) / 2) * scale + placement.origin[0],
      ((minY + maxY) / 2) * scale + placement.origin[1],
      placement.origin[2],
    ];
    centers.push({ iau: constellation.iau, position: center });
  }

  // Faint inter-constellation web: connect each constellation to its nearest neighbour.
  const links: SceneLink[] = [];
  const seen = new Set<string>();
  for (const a of centers) {
    let best: { iau: string; position: [number, number, number] } | null = null;
    let bestD = Infinity;
    for (const b of centers) {
      if (a.iau === b.iau) continue;
      const d = dist(a.position, b.position);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    if (!best) continue;
    const key = [a.iau, best.iau].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ from: a.position, to: best.position });
  }

  return { stars, edges, links };
}

function dist(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
