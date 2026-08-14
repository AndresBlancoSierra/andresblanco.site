/**
 * Single source of truth for Andrés Felipe Blanco Sierra's professional
 * information. Mirrors /home/andres/Documents/CV exactly. Nothing here is
 * invented; if a fact is not in the CV files, it is not here.
 */

export const SITE = {
  name: 'Andrés Felipe Blanco Sierra',
  domain: 'andresblanco.site',
  headline: 'Systems Engineering Student · Software · Cloud · Security',
  tagline: 'I build systems. I study how they work.',
  location: 'Bogotá, Colombia',
  email: 'andresfelipeblancos15@gmail.com',
  github: 'https://github.com/AndresBlancoSierra',
  githubHandle: 'AndresBlancoSierra',
} as const;

export interface EducationItem {
  institution: string;
  degree: string;
  area: string;
  location: string;
  start: string;
  end: string;
  note: string;
}

export const EDUCATION: EducationItem = {
  institution: 'Universidad EAN',
  degree: 'B.S.',
  area: 'Systems Engineering',
  location: 'Bogotá, Colombia',
  start: '2023',
  end: '2027 (expected)',
  note: '7th semester student; student representative of the Faculty of Engineering',
};

export interface LeadershipItem {
  role: string;
  org: string;
  year: string;
  description: string;
}

export const LEADERSHIP: LeadershipItem[] = [
  {
    role: 'Student Representative — Faculty of Engineering',
    org: 'Universidad EAN',
    year: '2026',
    description:
      'Represent the Faculty of Engineering, channeling academic concerns and student initiatives to faculty leadership.',
  },
  {
    role: 'Workshop Instructor and Jury — The Code Game',
    org: 'Colegio Tilatá',
    year: '2026',
    description:
      'Delivered workshops and judged student-built video games in the national programming competition (Scratch, Python, Java).',
  },
  {
    role: 'University Choir — ASCUN Culture Choir Festival',
    org: 'Universidad EAN',
    year: '2025',
    description:
      'Choral competition of the Colombian Association of Universities (ASCUN). Awarded 3rd place.',
  },
];

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  name: string;
  year: string;
  status: 'featured' | 'additional';
  summary: string;
  tech: string[];
  repo: string;
  highlights: string[];
  /** Real, verifiable metrics from the CV source files. */
  metrics: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'what',
    name: 'WHAT? — Learn Languages with Songs',
    year: '2026',
    status: 'featured',
    summary:
      'Full-stack app that downloads songs (yt-dlp), transcribes them with Whisper large-v3 and syncs them with Genius lyrics for language learning, with Anki export.',
    tech: ['React 19', 'TypeScript', 'FastAPI', 'Whisper', 'TanStack Query', 'Tailwind 4'],
    repo: 'https://github.com/AndresBlancoSierra/what',
    highlights: [
      'Full-stack pipeline: song search → download (yt-dlp) → voice separation → Whisper transcription → Genius lyric sync.',
      'Async backend (SQLAlchemy + SQLite) and a React 19 / TanStack Query / Tailwind 4 frontend, plus Anki export.',
    ],
    metrics: [],
  },
  {
    slug: 'portrait-dataset-builder',
    name: 'Portrait Dataset Builder',
    year: '2026',
    status: 'featured',
    summary:
      'CLI that ingests images/video, detects faces with InsightFace, deduplicates perceptually and classifies semantically with CLIP.',
    tech: ['Python', 'Typer', 'OpenCV', 'InsightFace', 'CLIP', 'Hydra'],
    repo: 'https://github.com/AndresBlancoSierra/portrait-dataset-builder',
    highlights: [
      'Built a CLI that ingests images/video, detects and crops faces with InsightFace and deduplicates with perceptual hashing.',
      'Semantic classification with CLIP and vector search (usearch); Hydra-driven pipeline, asyncio tests, strict linting (ruff/black/mypy).',
    ],
    metrics: [],
  },
  {
    slug: 'opencode-telegram-controller',
    name: 'OpenCode Telegram Controller',
    year: '2026',
    status: 'featured',
    summary:
      'Telegram bot that runs AI (opencode) tasks with a task queue, controlled concurrency, graceful cancellation and allowlist-based security.',
    tech: ['Python', 'aiogram', 'SQLite', 'systemd'],
    repo: 'https://github.com/AndresBlancoSierra/opencode-telegram-controller',
    highlights: [
      'Task queue with global concurrency limit and per-project serialization; graceful process-group cancellation (SIGTERM/SIGKILL).',
      'Allowlist-based security, deterministic offline summaries, SQLite persistence; deployed as a systemd user service.',
    ],
    metrics: ['110 automated tests'],
  },
  {
    slug: 'guitar-hero-controller',
    name: 'Guitar Hero Controller',
    year: '2026',
    status: 'featured',
    summary:
      'Physical controller: Arduino firmware (5 frets + joystick, 4-byte serial protocol) and a C++ uinput driver emulating keyboard/joystick on Linux.',
    tech: ['C++', 'Arduino', 'uinput', 'termios'],
    repo: 'https://github.com/AndresBlancoSierra/guitar-hero-controller',
    highlights: [
      'Arduino firmware with 5 fret buttons (INPUT_PULLUP) + joystick, binary 4-byte serial protocol at 115200 baud.',
      'C++ uinput driver that creates a virtual input device and translates serial frames into keyboard/joystick events (termios, 8N1, raw).',
    ],
    metrics: [],
  },
  {
    slug: 'cp2077-ui-react',
    name: 'CP2077 UI — Cyberpunk 2077 Replica',
    year: '2026',
    status: 'featured',
    summary:
      'Replica of the Cyberpunk 2077 interface (Hub, character, cyberware, inventory, stats) in React 19 + TypeScript with a custom router.',
    tech: ['React 19', 'TypeScript', 'Vite', 'Tailwind'],
    repo: 'https://github.com/AndresBlancoSierra/cp2077-ui-react',
    highlights: [
      'Replicated the game interface (Hub, character, cyberware, inventory and stats) with a custom router and virtualized lists (react-window).',
      'Clean component architecture: screens, components, data, hooks, styles.',
    ],
    metrics: [],
  },
  {
    slug: 'physical-evolution-system',
    name: 'Physical Evolution System (GYM OS)',
    year: '2026',
    status: 'featured',
    summary:
      'Backend that parses an Obsidian vault into SQLite and computes progression, PRs and gamification (XP/levels) with an automatic inotify watcher.',
    tech: ['Python', 'SQLite', 'inotify', 'pytest'],
    repo: 'https://github.com/AndresBlancoSierra/GYM-ciberpunk-wallpaper',
    highlights: [
      'Obsidian Markdown as source of truth (never modified); parser extracts data into SQLite.', 
      'Gamification engine: XP only for real progress, levels, achievements keyed by entity; inotify watcher with debounce; feeds live desktop wallpapers.',
    ],
    metrics: ['88 automated tests'],
  },
];

export interface SkillGroup {
  label: string;
  details: string[];
}

export const SKILLS: SkillGroup[] = [
  { label: 'Languages', details: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Bash', 'C++'] },
  {
    label: 'Backend',
    details: ['FastAPI', 'SQLAlchemy', 'REST APIs', 'Node.js', 'Express', 'Laravel'],
  },
  {
    label: 'Frontend',
    details: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'TanStack Query', 'Next.js'],
  },
  {
    label: 'AI / ML',
    details: ['Whisper', 'CLIP', 'OpenCV', 'InsightFace', 'Tesseract OCR', 'embeddings', 'scikit-learn'],
  },
  {
    label: 'Systems',
    details: ['Linux (Arch/Hyprland)', 'systemd', 'Docker', 'Git', 'uinput', 'Arduino'],
  },
];

export interface Honor {
  title: string;
  detail?: string;
}

export const HONORS: Honor[] = [
  {
    title: 'Artistic excellence scholarship',
    detail: 'EAN Philharmonic Orchestra',
  },
  {
    title: 'Best student in cultural & wellness classes',
    detail: '3 consecutive semesters (2024-1 → 2025-2), Universidad EAN',
  },
  {
    title: '3rd place — ASCUN Culture Choir Festival 2025',
    detail: 'Choral competition of the Colombian Association of Universities',
  },
];

export const LANGUAGES = [
  { language: 'Spanish', level: 'Native' },
  { language: 'English', level: 'B2+ — professional working proficiency (TOEFL in preparation)' },
];

export const QUALITY_GUARANTEES = [
  '198+ automated tests across main projects (110 OpenCode Telegram Controller, 88 Physical Evolution)',
  'Strict linting and typing (ruff, black, mypy) in computer-vision projects',
  'Complete documentation in every repo (architecture, install, usage, troubleshooting)',
  'Security by design: secrets out of git, allowlists, non-root containers, no shell execution',
  'Consistent publication: 16 public repositories with README and generated assets',
];

/** Focused areas used on /about and the constellation nodes. */
export const DOMAINS = [
  { slug: 'software', label: 'Software', detail: 'end-to-end systems' },
  { slug: 'cloud', label: 'Cloud', detail: 'AWS · infrastructure' },
  { slug: 'security', label: 'Security', detail: 'driven by design' },
  { slug: 'linux', label: 'Linux', detail: 'environments as systems' },
] as const;