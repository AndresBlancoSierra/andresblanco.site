/**
 * Sky catalog invariants. The constellation data must stay real: every star is
 * a traceable Hipparcos object, the asterisms must be connected, and the
 * magnitude → brightness mapping must be monotonic (no invented sizes).
 */
import { describe, expect, it } from 'vitest';
import {
  CONSTELLATIONS,
  buildScene,
  magnitudeToFlux,
  parseDec,
  parseRa,
  projectConstellation,
  starBrightness,
  starRadius,
} from '../src/lib/constellations';

const ALL_STARS = CONSTELLATIONS.flatMap((c) => c.stars);

describe('coordinate parsing', () => {
  it('parses Regulus to its catalogue coordinates', () => {
    const regulus = ALL_STARS.find((s) => s.name === 'Regulus')!;
    expect(parseRa(regulus.ra)).toBeCloseTo(152.0936, 3);
    expect(parseDec(regulus.dec)).toBeCloseTo(11.9672, 3);
  });

  it('parses Betelgeuse to its catalogue coordinates', () => {
    const betelgeuse = ALL_STARS.find((s) => s.name === 'Betelgeuse')!;
    expect(parseRa(betelgeuse.ra)).toBeCloseTo(88.7929, 3);
    expect(parseDec(betelgeuse.dec)).toBeCloseTo(7.407, 3);
  });

  it('parses Deneb to its catalogue coordinates', () => {
    const deneb = ALL_STARS.find((s) => s.name === 'Deneb')!;
    expect(parseRa(deneb.ra)).toBeCloseTo(310.358, 3);
    expect(parseDec(deneb.dec)).toBeCloseTo(45.2803, 3);
  });
});

describe('catalogue integrity', () => {
  it('contains the eight chosen constellations with unique IAU codes', () => {
    expect(CONSTELLATIONS).toHaveLength(8);
    const iaus = CONSTELLATIONS.map((c) => c.iau);
    expect(new Set(iaus).size).toBe(8);
    for (const iau of iaus) expect(iau).toMatch(/^[A-Z]{3}$/);
  });

  it('every star is a real, traceable Hipparcos object', () => {
    for (const star of ALL_STARS) {
      expect(star.hip, star.name).toBeGreaterThan(0);
      expect(star.name.length, star.name).toBeGreaterThan(0);
      expect(parseRa(star.ra)).toBeGreaterThanOrEqual(0);
      expect(parseRa(star.ra)).toBeLessThan(360);
      expect(Math.abs(parseDec(star.dec))).toBeLessThanOrEqual(90);
      expect(star.magnitude).toBeGreaterThan(-2);
      expect(star.magnitude).toBeLessThan(8);
    }
    expect(new Set(ALL_STARS.map((s) => s.hip)).size).toBe(ALL_STARS.length);
  });

  it('each constellation has a connected, valid asterism', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.stars.length).toBeGreaterThanOrEqual(5);
      for (const [a, b] of c.edges) {
        expect(a, `${c.iau} edge`).toBeGreaterThanOrEqual(0);
        expect(b, `${c.iau} edge`).toBeLessThan(c.stars.length);
      }
      // every star participates in at least one edge (no isolated stars)
      const connected = new Set<number>();
      for (const [a, b] of c.edges) {
        connected.add(a);
        connected.add(b);
      }
      expect(connected.size, `${c.iau} connected`).toBe(c.stars.length);
    }
  });

  it('every constellation is recognizable: at least one mag < 2.5 star', () => {
    for (const c of CONSTELLATIONS) {
      expect(Math.min(...c.stars.map((s) => s.magnitude)), c.iau).toBeLessThan(2.5);
    }
  });

  it('contains the famous stars by constellation', () => {
    const byIau = Object.fromEntries(CONSTELLATIONS.map((c) => [c.iau, c]));
    expect(byIau.ORI.stars.some((s) => s.name === 'Betelgeuse')).toBe(true);
    expect(byIau.UMA.stars.some((s) => s.name === 'Dubhe')).toBe(true);
    expect(byIau.SCO.stars.some((s) => s.name === 'Antares')).toBe(true);
    expect(byIau.CRU.stars.some((s) => s.name === 'Acrux')).toBe(true);
    expect(byIau.LEO.stars.some((s) => s.name === 'Regulus')).toBe(true);
  });
});

describe('brightness mapping', () => {
  it('is monotonic: brighter (lower mag) → higher flux, radius and brightness', () => {
    const mags = [0.2, 1.0, 2.0, 3.5];
    for (let i = 1; i < mags.length; i++) {
      expect(magnitudeToFlux(mags[i - 1])).toBeGreaterThan(magnitudeToFlux(mags[i]));
      expect(starRadius(mags[i - 1])).toBeGreaterThan(starRadius(mags[i]));
      expect(starBrightness(mags[i - 1])).toBeGreaterThan(starBrightness(mags[i]));
    }
  });

  it('stays within the rendered bounds', () => {
    for (const star of ALL_STARS) {
      expect(starRadius(star.magnitude)).toBeGreaterThanOrEqual(0.0045);
      expect(starRadius(star.magnitude)).toBeLessThanOrEqual(0.022);
      expect(starBrightness(star.magnitude)).toBeGreaterThanOrEqual(0.3);
      expect(starBrightness(star.magnitude)).toBeLessThanOrEqual(1);
    }
  });
});

describe('scene layout', () => {
  it('projects every constellation to a non-degenerate plane', () => {
    for (const c of CONSTELLATIONS) {
      const proj = projectConstellation(c);
      const xs = proj.map((p) => p.x);
      const ys = proj.map((p) => p.y);
      expect(Math.max(...xs) - Math.min(...xs), c.iau).toBeGreaterThan(0.02);
      expect(Math.max(...ys) - Math.min(...ys), c.iau).toBeGreaterThan(0.02);
      for (const p of proj) {
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
      }
    }
  });

  it('builds a field with all stars, edges and a web of links', () => {
    const scene = buildScene();
    expect(scene.stars).toHaveLength(ALL_STARS.length);
    expect(scene.edges.length).toBeGreaterThanOrEqual(CONSTELLATIONS.length * 4);
    expect(scene.links.length).toBeGreaterThanOrEqual(5);

    for (const star of scene.stars) {
      for (const v of star.position) expect(Number.isFinite(v)).toBe(true);
      expect(Math.abs(star.position[0])).toBeLessThan(7);
      expect(Math.abs(star.position[1])).toBeLessThan(4.5);
      expect(star.position[2]).toBeLessThan(0.5);
      expect(star.position[2]).toBeGreaterThan(-2);
    }
    for (const edge of scene.edges) {
      for (const v of [...edge.from, ...edge.to]) expect(Number.isFinite(v)).toBe(true);
    }
  });

  it('constellation clusters do not fully overlap each other', () => {
    const scene = buildScene();
    const centers = new Map<string, [number, number, number]>();
    for (const star of scene.stars) {
      const cur = centers.get(star.iau);
      if (!cur) {
        centers.set(star.iau, [...star.position] as [number, number, number]);
      } else {
        cur[0] += star.position[0];
        cur[1] += star.position[1];
        cur[2] += star.position[2];
      }
    }
    const entries: [string, [number, number]][] = [...centers.entries()].map(([iau, sum]) => {
      const stars = scene.stars.filter((s) => s.iau === iau);
      return [iau, [sum[0] / stars.length, sum[1] / stars.length]];
    });
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const d = Math.hypot(
          entries[i][1][0] - entries[j][1][0],
          entries[i][1][1] - entries[j][1][1],
        );
        expect(d, `${entries[i][0]}/${entries[j][0]}`).toBeGreaterThan(1.1);
      }
    }
  });
});
