# andresblanco.site

Personal website and portfolio of **Andres Blanco** — Systems Engineering student at Universidad EAN (Bogotá, Colombia). Focus: software, cloud, security, Linux.

Aesthetic: black + white + a subtle constellation of systems — "Engineering as a System". No gradients, no glassmorphism, no fake metrics. Every fact on the site is real and traceable.

## Stack

- **Astro 7** — static site generation, content layer, routing
- **React 19** — islands only (constellation visualization, satellite overlay, scroll reveals)
- **Three.js / @react-three/fiber** — the constellation canvas on the hero
- **GSAP + ScrollTrigger** — scroll animations (respects `prefers-reduced-motion`)
- **Tailwind CSS v4** — design tokens via `@theme` in `src/styles/global.css`
- **MDX** — case studies under `src/content/projects/`
- **TypeScript** (strict) — data is centralized in `src/lib/profile.ts`
- **Hipparcos catalog** — the hero sky is built from real star data (`src/lib/constellations.ts`)
- **Historical satellites** — a foreground overlay crosses the viewport with real spacecraft renders (`src/lib/satellites.ts`)

## Content model

`src/lib/profile.ts` is the single source of truth for personal data (education, skills, honors, languages, domains). It mirrors the CV in `~/Documents/CV` — no invented experience, no certifications, no LinkedIn, no percentages. Case studies live in MDX under `src/content/projects/` and are the single source for project facts (title, year, summary, tags, repo, metrics, sections); the index and detail pages read them through the Astro content layer. Tests in `tests/profile.test.ts`, `tests/projects.test.ts` and `tests/constellations.test.ts` guard these invariants.

## Commands

```bash
npm install       # install dependencies
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the built site

npm run check     # lint + typecheck + unit tests
npm run lint      # eslint
npm run typecheck # astro check
npm run test      # vitest (unit)
npm run test:e2e  # playwright (requires built dist)
npm run format    # prettier --write
```

## Layout

```
src/
  layouts/          # Base, Page, Project layouts
  components/       # Header, Footer, React islands, site UI
  content/projects/ # 6 MDX case studies (01 Problem → 07 Lessons Learned) — single source for projects
  lib/profile.ts    # single source of truth (personal data)
  lib/constellations.ts # real star catalog + scene builder for the hero sky
  lib/satellites.ts # real historical satellites (launch date, agency, milestone, source)
  lib/site.ts       # nav anchors, canonical URL helpers
  pages/            # index (single page with anchor sections) + projects/[slug]
  styles/global.css # Tailwind v4 theme tokens
tests/              # vitest unit tests (profile + projects + constellations + satellites)
public/satellites/  # grayscale PNGs of the 7 spacecraft (NASA/Commons, traceable)
e2e/                # Playwright smoke tests (desktop + mobile)
```

## CI

`.github/workflows/ci.yml` runs on push/PR: install → lint → typecheck → unit tests → build → Playwright (Chromium).

## Deploy

Static output in `dist/`. Compatible with Cloudflare Pages or Vercel. Domain: `andresblanco.site`. Sitemap at `/sitemap-index.xml`, PDF CV at `/resume.pdf`. Removed top-level routes (`/about`, `/projects`, `/security`, `/resume`, `/contact`, `/writing`) redirect to their single-page anchor on `/`.

## Key decisions

- **Astro 7 content layer**: collection config lives in `src/content.config.ts` with `glob()` loaders; entries are rendered with `render(entry)` from `astro:content`.
- **Single-page layout**: everything lives on `/` as anchor sections (`#about`, `#projects`, `#security`, `#resume`, `#contact`); only project case studies are separate routes.
- **Mobile nav is a native `<details>` disclosure** — zero JS.
- **Hero sky is real astronomy**: 8 constellations (Orion, Ursa Major, Cassiopeia, Leo, Scorpius, Cygnus, Crux, Sagittarius) with Hipparcos positions and magnitudes; size/brightness derived from real magnitude. Events (supernova, black hole, satellite, variable stars, star birth, meteors) are declarative and data-driven.
- **`prefers-reduced-motion`** freezes the sky (static frame, no events, no twinkle), disables GSAP animations and hides the satellite overlay.
- **Satellite overlay**: historical spacecraft (Sputnik-1, Explorer-1, Vanguard-1, Telstar-1, Skylab, Hubble, ISS) cross the viewport slowly in a `pointer-events-none` fixed layer above all text; `mix-blend-mode: screen` hides their black backgrounds, `grayscale()` keeps them monochrome, and the catalog links each to its Commons source and license.
- **Performance tiers**: mobile/low-end gets fewer stars, capped DPR and `frameloop="demand"`; the default canvas is `low-power` with instanced geometry.
- **Projects come from MDX** (`getCollection('projects')`), not `profile.ts` — one source of truth, guarded by tests.
