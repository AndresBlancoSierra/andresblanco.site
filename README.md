# andresblanco.site

Personal website and portfolio of **Andrés Felipe Blanco Sierra** — Systems Engineering student at Universidad EAN (Bogotá, Colombia). Focus: software, cloud, security, Linux.

Aesthetic: black + white + a subtle constellation of systems — "Engineering as a System". No gradients, no glassmorphism, no fake metrics. Every fact on the site is real and traceable.

## Stack

- **Astro 7** — static site generation, content layer, routing
- **React 19** — islands only (constellation visualization, scroll reveals)
- **Three.js / @react-three/fiber** — the constellation canvas on the hero
- **GSAP + ScrollTrigger** — scroll animations (respects `prefers-reduced-motion`)
- **Tailwind CSS v4** — design tokens via `@theme` in `src/styles/global.css`
- **MDX** — case studies under `src/content/projects/`
- **TypeScript** (strict) — data is centralized in `src/lib/profile.ts`

## Content model

`src/lib/profile.ts` is the single source of truth for personal data (education, projects, skills, honors, languages, domains). It mirrors the CV in `~/Documents/CV` — no invented experience, no certifications, no LinkedIn, no percentages. Tests in `tests/profile.test.ts` guard these invariants.

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
  layouts/          # Base, Page, Article, Project layouts
  components/       # Header, Footer, React islands, site UI
  content/projects/ # 6 MDX case studies (01 Problem → 07 Lessons Learned)
  lib/profile.ts    # single source of truth (all personal data)
  lib/site.ts       # nav, canonical URL helpers
  pages/            # index, about, projects, security, writing, resume, contact, rss
  styles/global.css # Tailwind v4 theme tokens
tests/              # vitest unit tests (profile invariants)
e2e/                # Playwright smoke tests (desktop + mobile)
```

## CI

`.github/workflows/ci.yml` runs on push/PR: install → lint → typecheck → unit tests → build → Playwright (Chromium).

## Deploy

Static output in `dist/`. Compatible with Cloudflare Pages or Vercel. Domain: `andresblanco.site`. RSS at `/rss.xml`, sitemap at `/sitemap-index.xml`, PDF CV at `/resume.pdf`.

## Key decisions

- **Astro 7 content layer**: collection config lives in `src/content.config.ts` with `glob()` loaders; entries are rendered with `render(entry)` from `astro:content`.
- **Mobile nav is a native `<details>` disclosure** — zero JS.
- **Constellation** uses a low-power WebGL canvas with reduced device-pixel ratio and `frameloop="demand"` on small screens.
- **Writing section is intentionally empty** until real articles are published.
