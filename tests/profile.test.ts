/**
 * Unit tests for the pure data layer — the profile is the ground truth
 * feeding every page. If these break, real content is missing.
 */
import { describe, expect, it } from 'vitest';
import { EDUCATION, HONORS, LEADERSHIP, LANGUAGES, SKILLS, SITE } from '../src/lib/profile';
import { NAV_ITEMS, canonicalUrl, SITE_DOMAIN } from '../src/lib/site';

describe('SITE', () => {
  it('exposes real contact data', () => {
    expect(SITE.name).toContain('Andres');
    expect(SITE.name).toContain('Blanco');
    expect(SITE.email).toBe('andresfelipeblancos15@gmail.com');
    expect(SITE.phone).toBe('+57 312 308 7133');
    expect(SITE.githubHandle).toBe('AndresBlancoSierra');
    expect(SITE.location).toContain('Bogotá');
  });
});

describe('EDUCATION', () => {
  it('matches the CV source of truth', () => {
    expect(EDUCATION.institution).toBe('Universidad EAN');
    expect(EDUCATION.area.toLowerCase()).toContain('systems engineering');
    expect(EDUCATION.start).toBe('2023');
  });
});

describe('LEADERSHIP', () => {
  it('only contains real entries from the CV', () => {
    expect(LEADERSHIP.length).toBe(3);
    for (const item of LEADERSHIP) {
      expect(item.role.length).toBeGreaterThan(0);
      expect(item.org.length).toBeGreaterThan(0);
    }
  });
});

describe('SKILLS', () => {
  it('are categorized and never use bars or ratings', () => {
    for (const group of SKILLS) {
      expect(group.label.length).toBeGreaterThan(0);
      expect(group.details.length).toBeGreaterThan(0);
      for (const detail of group.details) {
        // No percentages, stars or fake ratings
        expect(detail).not.toMatch(/\d+%/);
        expect(detail).not.toMatch(/★|⭐/);
      }
    }
  });
});

describe('HONORS + LANGUAGES', () => {
  it('languages reflect reality (no fabricated CEFR levels)', () => {
    expect(LANGUAGES).toHaveLength(2);
    expect(LANGUAGES[1].level).toContain('B2');
  });

  it('every honor has a title', () => {
    for (const honor of HONORS) {
      expect(honor.title.length).toBeGreaterThan(0);
    }
  });
});

describe('NAVIGATION', () => {
  it('has only sections with real content', () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual([
      '/#top',
      '/#about',
      '/#projects',
      '/#security',
      '/#resume',
      '/#contact',
    ]);
  });

  it('builds canonical URLs on the real domain', () => {
    expect(canonicalUrl('/')).toBe(`https://${SITE_DOMAIN}/`);
    expect(canonicalUrl('/projects/what')).toBe(`https://${SITE_DOMAIN}/projects/what`);
  });
});
