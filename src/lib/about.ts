// Normalizes the Sanity "about" document so the page renders even when fields are empty.
// Casing in these defaults is intentional: only the first word of each bio paragraph is
// capitalized, "i" stays lowercase mid-sentence, and proper nouns keep their capitals.

export const ABOUT_DEFAULTS = {
  name: 'Khoi Tran',
  title: 'Applied AI Fellow, Center for Applied Entrepreneurship and Innovation',
  quote: 'Know all the theories, master all the techniques, but as you touch a human soul, be just another human soul.',
  quoteAttribution: 'attributed to Carl Jung',
  bioFallback: [
    "I'm Khoi Tran, a senior manager at the Texas Cyber Range at Texas A&M University, where i lead a student team that builds and runs cybersecurity competitions and infrastructure. i co-founded TAMU AI Safety and currently serve as an Applied AI Fellow at the Mays Center for Applied Entrepreneurship and Innovation. my focus is AI security and strategic development.",
    "I'm a Terry Scholar at Texas A&M University.",
  ],
  affiliations: [
    'Texas Cyber Range, Texas A&M University, senior manager',
    'Mays Center for Applied Entrepreneurship and Innovation, applied AI fellow',
    'TAMU AI Safety, co-founder',
    'OWASP GenAI Security Project, contributor',
    'Vietnamese Student Association at Texas A&M, former cultural chair',
    'Terry Foundation, scholar',
  ],
  expertise: [
    'AI Security',
    'Strategic Development',
    'AI Safety Field-Building',
    'Cybersecurity',
    'Applied AI',
    'Entrepreneurship',
    'Leadership',
  ],
  centersAndPrograms: [
    'Center for Applied Entrepreneurship and Innovation',
    'Texas Cyber Range',
  ],
  email: 'khoi@tamu.edu',
};

export interface RawAbout {
  name?: unknown;
  title?: unknown;
  quote?: unknown;
  quoteAttribution?: unknown;
  body?: unknown;
  affiliations?: unknown;
  expertise?: unknown;
  centersAndPrograms?: unknown;
  email?: unknown;
  portrait?: unknown;
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function list(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
}

export function resolveAbout(raw: RawAbout | null | undefined) {
  const r = raw ?? {};
  const portrait = (r.portrait as { asset?: unknown } | null | undefined)?.asset ? r.portrait : null;
  return {
    name: text(r.name, ABOUT_DEFAULTS.name),
    title: text(r.title, ABOUT_DEFAULTS.title),
    quote: text(r.quote, ABOUT_DEFAULTS.quote),
    quoteAttribution: text(r.quoteAttribution, ABOUT_DEFAULTS.quoteAttribution),
    body: Array.isArray(r.body) && r.body.length ? (r.body as unknown[]) : null,
    bioFallback: ABOUT_DEFAULTS.bioFallback,
    affiliations: list(r.affiliations, ABOUT_DEFAULTS.affiliations),
    expertise: list(r.expertise, ABOUT_DEFAULTS.expertise),
    centersAndPrograms: list(r.centersAndPrograms, ABOUT_DEFAULTS.centersAndPrograms),
    email: text(r.email, ABOUT_DEFAULTS.email),
    portrait,
  };
}
