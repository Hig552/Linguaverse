/**
 * Client-safe constants and type definitions. Do not import Node-only code here.
 */

export interface Languoid {
  id: string;
  name: string;
  iso639_3: string | null;
  level: 'family' | 'language' | 'dialect';
  category: string | null;
  macroarea: string | null;
  latitude: number | null;
  longitude: number | null;
  countries: string | null;
  family_id: string | null;
  parent_id: string | null;
  closest_iso: string | null;
  is_isolate: 0 | 1;
  first_year_doc: number | null;
  last_year_doc: number | null;
  aes: number | null;
  aes_label: string | null;
  med: number | null;
  med_label: string | null;
  classification: string | null;
  depth: number;
  speaker_count: number | null;
  speakers_l1: number | null;
  speakers_l2: number | null;
  script: string | null;
  wikipedia_url: string | null;
  description: string | null;
}

export interface AltName {
  languoid_id: string;
  provider: string;
  lang: string;
  name: string;
}

export const LEVELS = ['family', 'language', 'dialect'] as const;
export const MACROAREAS = [
  'Africa', 'Eurasia', 'Papunesia', 'North America', 'South America', 'Australia',
] as const;

export const ENDANGERMENT_LABELS: Record<number, { label: string; color: string; description: string }> = {
  1: { label: 'Not endangered', color: 'bg-emerald-500', description: 'EGIDS ≤ 6a; UNESCO: safe.' },
  2: { label: 'Threatened',      color: 'bg-yellow-500', description: 'EGIDS 6b; UNESCO: vulnerable.' },
  3: { label: 'Shifting',        color: 'bg-orange-500', description: 'EGIDS 7; UNESCO: definitely endangered.' },
  4: { label: 'Moribund',        color: 'bg-red-500',    description: 'EGIDS 8a; UNESCO: severely endangered.' },
  5: { label: 'Nearly extinct',  color: 'bg-red-700',    description: 'EGIDS 8b; UNESCO: critically endangered.' },
  6: { label: 'Extinct',         color: 'bg-zinc-700',   description: 'EGIDS ≥ 9; UNESCO: extinct.' },
};

export const MED_LABELS: Record<number, { label: string; description: string }> = {
  0: { label: 'Long grammar',     description: 'Grammar with more than 300 pages.' },
  1: { label: 'Grammar',          description: 'Grammar with fewer than 300 pages.' },
  2: { label: 'Grammar sketch',   description: 'Short grammar sketch.' },
  3: { label: 'Phonology or text', description: 'New Testament, text, phonology, or similar study.' },
  4: { label: 'Wordlist or less', description: 'Wordlist or less documentation.' },
};
