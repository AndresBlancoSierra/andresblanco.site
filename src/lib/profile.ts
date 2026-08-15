/**
 * Single source of truth for Andrés Felipe Blanco Sierra's professional
 * information. Mirrors /home/andres/Documents/CV exactly. Nothing here is
 * invented; if a fact is not in the CV files, it is not here.
 */

export const SITE = {
  name: 'Andres Blanco',
  headline: 'Systems Engineering Student · Software · Cloud · Security',
  tagline: 'I build systems. I study how they work.',
  location: 'Bogotá, Colombia',
  email: 'andresfelipeblancos15@gmail.com',
  phone: '+57 312 308 7133',
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
    details: [
      'Whisper',
      'CLIP',
      'OpenCV',
      'InsightFace',
      'Tesseract OCR',
      'embeddings',
      'scikit-learn',
    ],
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
