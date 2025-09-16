// src/lib/live-activity/generator.ts
// Generates a 7-day, weighted, realistic "Recent activity" feed.
// Deterministic per day via seed, Asia/Kolkata aware labels.

export type CountryCode = 'usa' | 'uk' | 'sg' | 'uae' | 'kr' | 'ch';

export type OrderNotification = {
  type: 'order';
  country: CountryCode;
  cityLabel: string;       // e.g., "Los Angeles (CA)" or "Geneva (GE)"
  rawCity?: string;        // optional raw city
  stateOrRegion?: string;  // "CA" or "GE"
  subject: string;
  date: Date;              // actual timestamp
  label: string;           // "Today" | "Yesterday" | "Fri, 22 Aug"
  id: string;              // stable id
  relativeDays: number; // 0 = today, 1 = yesterday, etc.
};

export type CompletionNotification = {
  type: 'completion';
  country: CountryCode;
  orderID: string;
  subject: string;          // <-- add this
  date: Date;
  label: string;
  id: string;
  // Linkage info: completion maps to a prior order
  linkedOrderDate?: Date;
  linkedOrderId?: string;
};

export type NotificationItem = OrderNotification | CompletionNotification;

type City = { city: string; state?: string; canton?: string; weight?: number };
type CountryBucket = {
  countryCode: CountryCode;
  countryWeight: number; // sampling weight for country selection
  name: string;
  labelSuffix: string;   // e.g., "US", "UK", "SG", "UAE", "KR", "CH"
  format: 'CityState' | 'CityCountry' | 'CityCanton';
  cities: City[];
};

// ------------------ CITY REPOSITORY ------------------
export const CITY_REPO: Record<CountryCode, CountryBucket> = {
  usa: {
    countryCode: 'usa',
    countryWeight: 0.70, // 70% USA
    name: 'United States',
    labelSuffix: 'US',
    format: 'CityState',
    cities: [
      { city: 'New York', state: 'NY', weight: 2 },
      { city: 'Los Angeles', state: 'CA', weight: 2 },
      { city: 'Chicago', state: 'IL', weight: 1.5 },
      { city: 'Houston', state: 'TX', weight: 1.5 },
      { city: 'Phoenix', state: 'AZ' },
      { city: 'Philadelphia', state: 'PA' },
      { city: 'San Antonio', state: 'TX' },
      { city: 'San Diego', state: 'CA' },
      { city: 'Dallas', state: 'TX' },
      { city: 'San Jose', state: 'CA' },
      { city: 'Austin', state: 'TX' },
      { city: 'Jacksonville', state: 'FL' },
      { city: 'Fort Worth', state: 'TX' },
      { city: 'Columbus', state: 'OH' },
      { city: 'Charlotte', state: 'NC' },
      { city: 'San Francisco', state: 'CA', weight: 1.25 },
      { city: 'Indianapolis', state: 'IN' },
      { city: 'Seattle', state: 'WA', weight: 1.25 },
      { city: 'Denver', state: 'CO' },
      { city: 'Washington', state: 'DC', weight: 1.25 },
      { city: 'Boston', state: 'MA', weight: 1.25 },
      { city: 'El Paso', state: 'TX' },
      { city: 'Nashville', state: 'TN' },
      { city: 'Detroit', state: 'MI' },
      { city: 'Oklahoma City', state: 'OK' },
      { city: 'Portland', state: 'OR' },
      { city: 'Las Vegas', state: 'NV' },
      { city: 'Memphis', state: 'TN' },
      { city: 'Louisville', state: 'KY' },
      { city: 'Baltimore', state: 'MD' },
      { city: 'Milwaukee', state: 'WI' },
      { city: 'Albuquerque', state: 'NM' },
      { city: 'Tucson', state: 'AZ' },
      { city: 'Fresno', state: 'CA' },
      { city: 'Mesa', state: 'AZ' },
      { city: 'Sacramento', state: 'CA' },
      { city: 'Kansas City', state: 'MO' },
      { city: 'Atlanta', state: 'GA', weight: 1.1 },
      { city: 'Miami', state: 'FL', weight: 1.1 },
      { city: 'Raleigh', state: 'NC' },
      { city: 'Omaha', state: 'NE' },
      { city: 'Colorado Springs', state: 'CO' },
      { city: 'Long Beach', state: 'CA' },
      { city: 'Virginia Beach', state: 'VA' },
      { city: 'Oakland', state: 'CA' },
      { city: 'Minneapolis', state: 'MN' },
      { city: 'Tulsa', state: 'OK' },
      { city: 'Tampa', state: 'FL' },
      { city: 'Arlington', state: 'TX' },
      { city: 'New Orleans', state: 'LA' },
    ],
  },
  uk: {
    countryCode: 'uk',
    countryWeight: 0.10,
    name: 'United Kingdom',
    labelSuffix: 'UK',
    format: 'CityCountry',
    cities: [
      { city: 'London', weight: 2 },
      { city: 'Manchester' },
      { city: 'Birmingham' },
      { city: 'Leeds' },
      { city: 'Glasgow' },
      { city: 'Edinburgh' },
      { city: 'Bristol' },
      { city: 'Liverpool' },
      { city: 'Nottingham' },
      { city: 'Newcastle upon Tyne' },
    ],
  },
  sg: {
    countryCode: 'sg',
    countryWeight: 0.06,
    name: 'Singapore',
    labelSuffix: 'SG',
    format: 'CityCountry',
    cities: [{ city: 'Singapore' }],
  },
  uae: {
    countryCode: 'uae',
    countryWeight: 0.06,
    name: 'United Arab Emirates',
    labelSuffix: 'UAE',
    format: 'CityCountry',
    cities: [
      { city: 'Dubai', weight: 1.5 },
      { city: 'Abu Dhabi' },
      { city: 'Sharjah' },
      { city: 'Ajman' },
    ],
  },
  kr: {
    countryCode: 'kr',
    countryWeight: 0.04,
    name: 'South Korea',
    labelSuffix: 'KR',
    format: 'CityCountry',
    cities: [
      { city: 'Seoul', weight: 1.5 },
      { city: 'Busan' },
      { city: 'Incheon' },
      { city: 'Daegu' },
      { city: 'Daejeon' },
    ],
  },
  ch: {
    countryCode: 'ch',
    countryWeight: 0.04,
    name: 'Switzerland',
    labelSuffix: 'CH',
    format: 'CityCanton', // <-- use canton instead of state
    cities: [
      { city: 'Zurich', canton: 'ZH', weight: 1.5 },
      { city: 'Geneva', canton: 'GE' },
      { city: 'Basel', canton: 'BS' },
      { city: 'Lausanne', canton: 'VD' },
      { city: 'Bern', canton: 'BE' },
      // (optionally: Zug ZG, Lucerne LU, St. Gallen SG)
    ],
  },
};

// ------------------ SUBJECT BUCKETS ------------------
const SUBJECTS = [
  // Essays/Reports
  'argumentative essay',
  'analytical essay',
  'lab report',
  'literature review',
  // Business
  'case study',
  'marketing plan',
  'executive summary',
  // Research/Methods
  'research proposal',
  'data analysis',
  'white paper',
  // Long form
  'dissertation',
  'thesis',
  'capstone project',
  // Admissions / Tech
  'personal statement',
  'programming task',
];

// ------------------ CONFIG ------------------
export type GenerationConfig = {
  timezone?: string;      // default 'Asia/Kolkata'
  days?: number;          // default 7 (today + 6 back)
  minTotal?: number;      // default 12
  maxTotal?: number;      // default 18
  completionRatio?: number; // default 0.25
};

const DEFAULT_CFG: Required<GenerationConfig> = {
  timezone: 'Asia/Kolkata',
  days: 7,
  minTotal: 12,
  maxTotal: 18,
  completionRatio: 0.25,
};

// Per-day soft caps to avoid “too many today”
const PER_DAY_BOUNDS = [
  // dayIndex 0 = today, 1 = yesterday, etc.
  { min: 1, max: 3 }, // today
  { min: 2, max: 4 }, // −1
  { min: 2, max: 4 }, // −2
  { min: 2, max: 4 }, // −3
  { min: 1, max: 3 }, // −4
  { min: 1, max: 3 }, // −5
  { min: 1, max: 2 }, // −6
];

// ------------------ UTILS ------------------
const dtfKey = (tz: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });

const dtfLabel = (tz: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short' });

function dateKey(d: Date, tz: string): string {
    // "yyyy-mm-dd"
    const parts = dtfKey(tz).formatToParts(d).reduce(
      (acc: Record<string, string>, p) => {
        if (p.type !== 'literal') acc[p.type] = p.value
        return acc
      },
      {} as Record<string, string>
    )
    const { day, month, year } = parts
    return `${year}-${month}-${day}`
  }
  

function isSameKey(a: Date, b: Date, tz: string) {
  return dateKey(a, tz) === dateKey(b, tz);
}

function labelForDate(d: Date, now: Date, tz: string) {
    if (isSameKey(d, now, tz)) return 'today'
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    if (isSameKey(d, y, tz)) return 'yesterday'
  
    // difference in days
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 3) return `${diffDays} days ago`
  
    return dtfLabel(tz).format(d) // "Fri, 22 Aug"
  }
  

// Simple deterministic RNG (mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededFromString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function pickWeighted<T>(rng: () => number, items: T[], weightFn: (t: T) => number) {
  const weights = items.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function cityLabel(bucket: CountryBucket, c: City) {
  if (bucket.format === 'CityState' && c.state) return `${c.city} (${c.state})`;
  if (bucket.format === 'CityCanton' && c.canton) return `${c.city} (${c.canton})`;
  // fallback to country suffix
  return `${c.city} (${bucket.labelSuffix})`;
}

function generateCompletionId(year: number): string {
    const digits = Math.floor(100 + Math.random() * 900); // 3 random digits
    const letters =
      String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
      String.fromCharCode(65 + Math.floor(Math.random() * 26)); // 2 random uppercase letters
    return `DMH-${year}-${digits}${letters}`;
  }
// ------------------ GENERATOR ------------------
export function generateLiveActivityItems(cfg: GenerationConfig = {}): NotificationItem[] {
  const { timezone, days, minTotal, maxTotal, completionRatio } = { ...DEFAULT_CFG, ...cfg };

  // Make output stable per calendar day in tz
  const now = new Date();
  const seedKey = dateKey(now, timezone);
  const rng = mulberry32(seededFromString(`MHH-LAF-${seedKey}`));

  const totalTarget = Math.round(clamp(rng() * (maxTotal - minTotal) + minTotal, minTotal, maxTotal));

  // Decide how many per day (respect bounds + ensure sum ≈ totalTarget)
  const perDay: number[] = new Array(days).fill(0);
  let remaining = totalTarget;

  for (let i = 0; i < days; i++) {
    const bounds = PER_DAY_BOUNDS[i] ?? { min: 1, max: 2 };
    // rough proportional split
    const room = Math.min(bounds.max, remaining - (days - i - 1)); // leave at least 1 for future days
    const base = Math.min(bounds.min + Math.floor(rng() * (room - bounds.min + 1)), room);
    perDay[i] = base;
    remaining -= base;
  }
  // distribute leftovers one by one within bounds
  let idx = 0;
  while (remaining > 0) {
    const bounds = PER_DAY_BOUNDS[idx] ?? { min: 1, max: 2 };
    if (perDay[idx] < bounds.max) {
      perDay[idx]++;
      remaining--;
    }
    idx = (idx + 1) % days;
  }

  // How many completions overall
  const completionsTarget = Math.round(totalTarget * completionRatio);
  let completionsLeft = completionsTarget;

  // Helper to get the Date for dayIndex (0=today, 1=yesterday, ...)
  const dateForIndex = (i: number) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0); // midday anchor to avoid edge flips
    d.setDate(d.getDate() - i);
    // Add a time between 08:00–23:00 IST
    const hour = 8 + Math.floor(rng() * 15);
    const minute = Math.floor(rng() * 60);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const buckets = Object.values(CITY_REPO);
  const countriesWeighted = buckets.map(b => ({ b, w: b.countryWeight }));

  const items: NotificationItem[] = [];
  const recentOrders: { id: string; date: Date; subject: string; country: CountryCode }[] = [];


  // Track last country to avoid >2 in a row
  let streakCountry: CountryCode | null = null;
  let streakCount = 0;

  for (let dayIdx = 0; dayIdx < days; dayIdx++) {
    const count = perDay[dayIdx];
    for (let k = 0; k < count; k++) {
      // Pick country with weight AND anti-streak
      let pick: CountryBucket | null = null;
      for (let tries = 0; tries < 4; tries++) {
        const chosen = pickWeighted(() => rng(), buckets, (x) => x.countryWeight);
        if (streakCountry && chosen.countryCode === streakCountry && streakCount >= 2) {
          continue; // avoid 3+ in a row
        }
        pick = chosen;
        break;
      }
      pick = pick ?? buckets[0];

      // City within country
      const city = pickWeighted(() => rng(), pick.cities, (c) => c.weight ?? 1);

      const date = dateForIndex(dayIdx);
      const label = labelForDate(date, now, timezone);

      const makeOrder = () => {
        const id = `ord-${pick!.countryCode}-${city.city}-${date.getTime()}`;
        const order: OrderNotification = {
          type: 'order',
          country: pick!.countryCode,
          cityLabel: cityLabel(pick!, city),
          rawCity: city.city,
          stateOrRegion: city.state ?? city.canton,
          subject: SUBJECTS[Math.floor(rng() * SUBJECTS.length)],
          date,
          label,
          id,
          relativeDays: dayIdx,
        };
        recentOrders.push({ id, date, subject: order.subject, country: pick!.countryCode });

        return order;
      };

      const canCompleteHere =
        completionsLeft > 0 &&
        recentOrders.length > 0 &&
        // Completions should typically be on today/yesterday/2-3 days back
        dayIdx <= 3 &&
        // 30% chance (bounded by completionsLeft)
        rng() < 0.3;

      if (canCompleteHere) {
        // Link to an earlier order (1–4 days earlier)
        const candidateOrders = recentOrders.filter(o => {
          const ageDays = Math.floor((date.getTime() - o.date.getTime()) / (24 * 3600 * 1000));
          return ageDays >= 1 && ageDays <= 5;
        });
        if (candidateOrders.length > 0) {
          const linked = candidateOrders[Math.floor(rng() * candidateOrders.length)];
          const id = `cmp-${pick!.countryCode}-${linked.id}-${date.getTime()}`;
          const completion: CompletionNotification = {
            type: 'completion',
            country: pick!.countryCode,
            orderID: linked.id.replace('ord-', 'MHH-').slice(0, 16).toUpperCase(), // short human-ish
            subject: linked.subject,       // <-- reuse subject from order
            date,
            label,
            id,
            linkedOrderDate: linked.date,
            linkedOrderId: linked.id,
          };
          items.push(completion);
          completionsLeft--;
        } else {
          items.push(makeOrder());
        }
      } else {
        items.push(makeOrder());
      }

      // streak bookkeeping
      if (pick.countryCode === streakCountry) streakCount++;
      else {
        streakCountry = pick.countryCode;
        streakCount = 1;
      }
    }
  }

  // If not enough completions were injected, backfill
  while (completionsLeft > 0 && recentOrders.length > 0) {
    const linked = recentOrders[Math.floor(rng() * recentOrders.length)]
    const date = new Date(linked.date)
    date.setDate(date.getDate() + 1) // 1 day after order
    const label = labelForDate(date, now, timezone)
    const completion: CompletionNotification = {
      type: 'completion',
      country: linked.id.includes('-usa-') ? 'usa' : 'uk', // quick stub; can refine
      orderID: generateCompletionId(date.getFullYear()), // <-- NEW
      subject: linked.subject,       // <-- reuse subject from order

      date,
      label,
      id: `cmp-backfill-${linked.id}`,
      linkedOrderDate: linked.date,
      linkedOrderId: linked.id,
    }
    items.push(completion)
    completionsLeft--
  }

  // Sort newest first
  items.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Ensure overall completion ratio is within +/-1 item
  // (Optional fine-tuning step — can be removed if not needed)

  return items;
}
