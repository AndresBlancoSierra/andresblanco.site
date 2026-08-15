/**
 * Satellite catalog invariants. Every entry must be a real, traceable
 * spacecraft: unique id, valid launch date, resolvable image asset, and a
 * public-domain-or-attributed source on Wikimedia Commons.
 */
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { SATELLITES } from '../src/lib/satellites';

const PUBLIC_DIR = resolve(__dirname, '../public');

describe('satellite catalog', () => {
  it('contains the 7 historical satellites', () => {
    expect(SATELLITES).toHaveLength(7);
  });

  it('has unique ids and names', () => {
    const ids = SATELLITES.map((s) => s.id);
    const names = SATELLITES.map((s) => s.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('sorts entries by launch date ascending', () => {
    const dates = SATELLITES.map((s) => s.launched);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it('uses valid ISO launch dates', () => {
    for (const s of SATELLITES) {
      expect(s.launched, s.name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(s.launched)), s.name).toBe(false);
    }
  });

  it('has non-empty factual fields for every satellite', () => {
    for (const s of SATELLITES) {
      expect(s.name, s.id).not.toBe('');
      expect(s.agency, s.id).not.toBe('');
      expect(s.milestone, s.id).not.toBe('');
      expect(s.license, s.id).not.toBe('');
    }
  });

  it('links every entry to a Wikimedia Commons source', () => {
    for (const s of SATELLITES) {
      expect(s.source, s.id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it('points to an existing PNG asset', () => {
    for (const s of SATELLITES) {
      const file = resolve(PUBLIC_DIR, s.image.replace(/^\//, ''));
      expect(s.image, s.id).toMatch(/^\/satellites\/.*\.png$/);
      expect(existsSync(file), `${s.id}: missing ${s.image}`).toBe(true);
    }
  });

  it('covers the milestones it claims', () => {
    expect(SATELLITES.find((s) => s.id === 'sputnik-1')?.milestone).toContain(
      'First artificial satellite',
    );
    expect(SATELLITES.find((s) => s.id === 'hubble')?.milestone).toContain('telescope');
    expect(SATELLITES.find((s) => s.id === 'iss')?.milestone).toContain('Largest');
  });
});
