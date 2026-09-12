/**
 * Centralized, curated Unsplash imagery for Elimu Africa.
 *
 * A mix of:
 *  - Real photos of African students, classrooms and professionals (grounded, human).
 *  - Afro-futurist / vibrant portraits and tech shots (stylised, "anime" energy).
 *
 * All URLs are stable Unsplash CDN hotlinks (verified returning 200).
 * Any image passed to next/image works because next.config.ts allows
 * `remotePatterns` with hostname `**`.
 */

type Id = `photo-${string}`;

/** Build a sized, cropped Unsplash CDN URL. */
export const img = (id: Id, w = 1200, h?: number): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ''}`;

/* ────────────────────────────────────────────────
   Real African people / classrooms / campus
   ──────────────────────────────────────────────── */
export const studentClassroom = img('photo-1509062522246-3755977927d7', 1600, 900);
export const studentsCollaborating = img('photo-1522202176988-66273c2fd55f', 1200, 600);
export const studentsGraduating = img('photo-1523240795612-9a054b0db644', 1200, 800);
export const graduatesCaps = img('photo-1571260899304-425eee4c7efc', 1200, 800);
export const kidsClassroom = img('photo-1427504494785-3a9ca7044f45', 1200, 800);

/* ────────────────────────────────────────────────
   Hero video (free stock, Coverr license — no attribution required)
   African students studying outdoors with laptops & phones.
   ──────────────────────────────────────────────── */
export const heroVideo =
  'https://cdn.coverr.co/videos/coverr-students-studying-outdoors-6203/720p.mp4';
export const heroVideoPoster = studentsCollaborating;

/* Afro-futurist / vibrant African portraits (the "anime" / stylised energy) */
export const portraitConfident = img('photo-1573496359142-b8d87734a5a2', 800, 1000);
export const portraitBusiness = img('photo-1573497019940-1c28c88b4f3e', 800, 1000);
export const portraitYoung = img('photo-1522075469751-3a6694fb2f61', 800, 1000);

/* Tech / AI / coding */
export const aiRobot = img('photo-1485827404703-89b55fcc595e', 1200, 800);
export const codingLaptop = img('photo-1498050108023-c5249f4df085', 1200, 800);
export const codeScreen = img('photo-1555066931-4365d14bab8c', 1600, 900);
export const matrixCode = img('photo-1526374965328-7f61d4dc18c5', 1200, 800);
export const darkLaptop = img('photo-1517694712202-14dd9538aa97', 1200, 800);

/* ────────────────────────────────────────────────
   Learning path hero images (landing page)
   ──────────────────────────────────────────────── */
export interface PathVisual {
  number: string;
  title: string;
  description: string;
  image: string;
  accent: string;
}

export const learningPaths: PathVisual[] = [
  {
    number: '01',
    title: 'AI Literacy',
    description: 'Understanding and working with AI tools that are reshaping every industry.',
    image: aiRobot,
    accent: 'from-blue-950/80',
  },
  {
    number: '02',
    title: 'Software Skills',
    description: 'Practical coding, automation, and digital tool mastery for real-world careers.',
    image: codingLaptop,
    accent: 'from-purple-950/80',
  },
  {
    number: '03',
    title: 'Freelancing',
    description: 'Building income streams through global platforms from anywhere on the continent.',
    image: portraitBusiness,
    accent: 'from-amber-950/80',
  },
  {
    number: '04',
    title: 'Entrepreneurship',
    description: 'Turning ideas into ventures — businesses that solve African problems at scale.',
    image: portraitConfident,
    accent: 'from-emerald-950/80',
  },
];

/* ────────────────────────────────────────────────
   Course thumbnail pool (used when a course has no thumbnail)
   ──────────────────────────────────────────────── */
export const thumbnailPool: string[] = [
  img('photo-1485827404703-89b55fcc595e', 800, 450), // AI / robot
  img('photo-1498050108023-c5249f4df085', 800, 450), // code laptop
  img('photo-1555066931-4365d14bab8c', 800, 450), // code screen
  img('photo-1526374965328-7f61d4dc18c5', 800, 450), // matrix
  img('photo-1517694712202-14dd9538aa97', 800, 450), // dark laptop
  img('photo-1573496359142-b8d87734a5a2', 800, 450), // afro portrait
  img('photo-1522202176988-66273c2fd55f', 800, 450), // students
  img('photo-1509062522246-3755977927d7', 800, 450), // classroom
];

/** Deterministically pick a thumbnail from the pool for a given seed string. */
export function pickThumbnail(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return thumbnailPool[hash % thumbnailPool.length];
}

/** Category→thumbnail shortcut, falling back to the deterministic pool. */
export function categoryThumbnail(slug: string | undefined | null, seed: string): string {
  const map: Record<string, Id> = {
    ai: 'photo-1485827404703-89b55fcc595e',
    'machine-learning': 'photo-1485827404703-89b55fcc595e',
    web: 'photo-1498050108023-c5249f4df085',
    'web-development': 'photo-1498050108023-c5249f4df085',
    data: 'photo-1555066931-4365d14bab8c',
    'data-science': 'photo-1555066931-4365d14bab8c',
    design: 'photo-1573496359142-b8d87734a5a2',
    technology: 'photo-1526374965328-7f61d4dc18c5',
    business: 'photo-1573497019940-1c28c88b4f3e',
  };
  if (slug && map[slug]) return img(map[slug], 800, 450);
  return pickThumbnail(seed);
}