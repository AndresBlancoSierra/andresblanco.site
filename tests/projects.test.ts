/**
 * Case-study invariants. The MDX files under src/content/projects are the
 * single source of truth for the portfolio: if these break, real content is
 * missing or out of sync with what the site renders.
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const PROJECTS_DIR = fileURLToPath(new URL('../src/content/projects/', import.meta.url));
const files = readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .sort();

const EXPECTED_SLUGS = [
  'what',
  'portrait-dataset-builder',
  'opencode-telegram-controller',
  'guitar-hero-controller',
  'cp2077-ui-react',
  'physical-evolution-system',
];

const SECTIONS = [
  'problem',
  'architecture',
  'implementation',
  'engineering-decisions',
  'testing',
  'results',
  'lessons',
];

describe('case-study collection', () => {
  it('has exactly the six featured projects', () => {
    expect(files.map((f) => basename(f, '.mdx')).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it('every file is valid and complete', () => {
    for (const file of files) {
      const slug = basename(file, '.mdx');
      const { data, content } = matter(readFileSync(join(PROJECTS_DIR, file), 'utf8'));

      expect(data.status, `${slug}: status`).toBe('featured');
      expect(data.title, `${slug}: title`).toBeTypeOf('string');
      expect(data.year, `${slug}: year`).toMatch(/^\d{4}$/);
      expect(data.summary, `${slug}: summary`).toBeTypeOf('string');
      expect(data.repo, `${slug}: repo`).toMatch(/^https:\/\/github\.com\/AndresBlancoSierra\//);
      expect(Array.isArray(data.tags) && data.tags.length > 0, `${slug}: tags`).toBe(true);
      expect(
        data.sections.map((s: { id: string }) => s.id),
        `${slug}: sections`,
      ).toEqual(SECTIONS);
      if (data.metrics) {
        expect(data.metrics.length).toBeGreaterThan(0);
      }
      expect(content).toContain('## 01 / Problem');
      expect(content).toContain('## 07 / Lessons Learned');
    }
  });

  it('orders the case studies 1..6 exactly once', () => {
    const orders = files.map((f) => matter(readFileSync(join(PROJECTS_DIR, f), 'utf8')).data.order);
    expect(orders.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('metrics are real and live in the frontmatter (single source)', () => {
    const read = (slug: string) =>
      matter(readFileSync(join(PROJECTS_DIR, `${slug}.mdx`), 'utf8')).data;

    expect(read('opencode-telegram-controller').metrics).toContain('110 automated tests');
    expect(read('physical-evolution-system').metrics).toContain('88 automated tests');
  });

  it('physical-evolution-system points at its real repository', () => {
    const data = matter(
      readFileSync(join(PROJECTS_DIR, 'physical-evolution-system.mdx'), 'utf8'),
    ).data;
    expect(data.repo).toBe('https://github.com/AndresBlancoSierra/FalloutWallpaper-Anki-GYM');
  });
});
