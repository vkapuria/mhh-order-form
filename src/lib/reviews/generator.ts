// src/lib/reviews/generator.ts
// Human-sounding, subject-aware reviews (~N/day), spread 6 months → 1 week ago.
// Deterministic per calendar day in a given timezone.

export type ReviewItem = {
    code: string;      // DMH-2025-123AB
    subject: string;   // chip label, e.g. "Programming"
    text: string;      // human review (varied style)
    rating: 4 | 5;     // mostly 5
    date: Date;        // actual timestamp
    label: string;     // "Mon, Aug 12" (never Today/Yesterday)
  };
  
  type Group =
    | "programming" | "quant" | "research" | "lit" | "lab"
    | "business" | "presentation" | "writing" | "general" | "editing";
  
  type SubjectDef = {
    label: string;   // UI chip
    work: string;    // base noun used in text
    group: Group;
    weight?: number;
  };
  
  const SUBJECTS: SubjectDef[] = [
    { label: "Essay",               work: "essay",                   group: "writing",      weight: 2 },
    { label: "Research Paper",      work: "research paper",          group: "research",     weight: 2 },
    { label: "Statistics",          work: "statistics assignment",   group: "quant",        weight: 1.5 },
    { label: "Programming",         work: "programming task",        group: "programming",  weight: 1.5 },
    { label: "Case Study",          work: "case study",              group: "business",     weight: 1.25 },
    { label: "Literature Review",   work: "literature review",       group: "lit",          weight: 1.25 },
    { label: "Lab Report",          work: "lab report",              group: "lab",          weight: 1.1 },
    { label: "Presentation",        work: "presentation",            group: "presentation", weight: 1.0 },
    { label: "Homework",            work: "homework",                group: "general",      weight: 1.25 },
    { label: "Thesis",              work: "thesis",                  group: "research",     weight: 1.0 },
    { label: "Dissertation",        work: "dissertation",            group: "research",     weight: 0.9 },
    { label: "Analysis",            work: "analysis project",        group: "writing",      weight: 1.0 },
    { label: "Coursework",          work: "coursework",              group: "general",      weight: 1.0 },
    { label: "Business Plan",       work: "business plan",           group: "business",     weight: 0.9 },
    { label: "Reflective Journal",  work: "reflective journal",      group: "writing",      weight: 0.9 },
    { label: "Proposal",            work: "proposal",                group: "research",     weight: 0.9 },
    { label: "Critical Thinking",   work: "critical thinking task",  group: "writing",      weight: 0.9 },
    { label: "Editing",             work: "editing & proofreading",  group: "editing",      weight: 0.8 },
    { label: "Discussion Post",     work: "discussion post",         group: "general",      weight: 1.0 },
    { label: "Personal Statement",  work: "personal statement",      group: "writing",      weight: 0.9 },
  ];
  
  // ——— Subject-aware vocab to sprinkle ———
  const LEXICON_BY_GROUP: Record<Group, string[]> = {
    programming:  ["edge cases", "unit tests", "clean code", "comments", "debugging", "functions"],
    quant:        ["regression", "hypothesis test", "confidence intervals", "p-values", "SPSS/R/Stata"],
    research:     ["methodology", "citations", "abstract", "conclusion", "peer-reviewed sources"],
    lit:          ["source synthesis", "APA/MLA", "annotation", "literature gaps"],
    lab:          ["method", "results", "discussion", "observations", "graphs"],
    business:     ["KPIs", "market analysis", "executive summary", "benchmarks"],
    presentation: ["slides", "speaker notes", "visual hierarchy", "flow"],
    writing:      ["structure", "formatting", "tone", "cohesion"],
    general:      ["rubric", "requirements", "deadline", "instructions"],
    editing:      ["grammar", "flow", "style", "proofreading", "consistency"],
  };
  
  // ——— Synonyms for the “work” noun (prevents repetition) ———
  const WORK_SYNONYMS: Partial<Record<Group, string[]>> = {
    programming:  ["code", "solution", "script"],
    quant:        ["analysis", "stats work", "write-up"],
    research:     ["paper", "write-up", "draft"],
    lit:          ["review", "write-up"],
    lab:          ["report", "write-up"],
    business:     ["case", "plan", "analysis"],
    presentation: ["deck", "slides"],
    writing:      ["piece", "draft"],
    general:      ["work", "assignment"],
    editing:      ["edit", "revision"],
  };
  
  // ——— Expanded openers/closers (no repeats per daily set) ———
  const OPENERS = [
    "Honestly,", "Not gonna lie,", "To be honest,", "Low-key,", "Real talk—",
    "Truth is,", "Gotta say,", "For what it’s worth,", "Quick note—", "Just saying,",
    "Straight up,", "No exaggeration,", "If I’m honest,", "Tbh,", "Short version—",
    "Long story short,", "Surprisingly,", "Pleasant surprise—", "Didn’t expect this but,", "Heads up—",
    "FWIW,", "In short,", "Bottom line—", "Realistically,"
  ];
  
  const CLOSERS = [
    "Big relief of course.", "Exactly what I needed.", "Will use again.", "Made life easier.", "Saved me time.",
    "Worth it.", "Zero stress.", "No complaints.", "Clean work got me good grades.", "Good value.",
    "Helped a ton.", "This helped with A.", "Appreciated.", "Solid experience.", "Would recommend.",
    "Super helpful.", "Nicely done.", "All good here.", "Kept it simple.", "No fluff, just done.",
    "On point.", "Smooth process.", "Happy with it.", "Did the job as hoped for."
  ];
  
  // ——— Group-specific base patterns (short + varied syntax). Use [work]. ———
  const TPL: Record<Group, string[]> = {
    programming: [
      "Got my [work] back early and it was easy to run—no drama.",
      "The [work] read clean and handled edge cases well.",
      "Clear logic, sensible comments. The [work] just made sense.",
      "Passed tests on the first try. Solid [work].",
    ],
    quant: [
      "The [work] used the right methods and explained results clearly.",
      "Clean [work] with the analysis laid out simply—no fluff.",
      "Good [work]—methods made sense and the takeaways were grounded.",
      "Short, clear [work]. Easy to follow.",
    ],
    research: [
      "Well-organized [work] with solid sources and tidy citations.",
      "The [work] flowed naturally and the references were consistent.",
      "Strong [work]—argument made sense and stayed on track.",
      "Polished [work]. Professional from start to finish.",
    ],
    lit: [
      "The [work] pulled sources together clearly and kept format consistent.",
      "Well-structured [work] with proper citations and a concise summary.",
      "Natural read—the [work] didn’t feel forced.",
      "Focused [work] that stayed relevant.",
    ],
    lab: [
      "The [work] laid out method, results, and discussion cleanly.",
      "Clear sections, no confusion. The [work] was easy to scan.",
      "Everything in the [work] was where I expected it—nice.",
      "Data was easy to read at a glance. Solid [work].",
    ],
    business: [
      "The [work] used a sensible structure and got to the point.",
      "Clear [work] with a practical summary.",
      "Straightforward [work]—useful and focused.",
      "No fluff. The [work] covered what mattered.",
    ],
    presentation: [
      "The [work] looked sharp and flowed naturally. Easy to present.",
      "Readable [work] with clean slides and clear speaker notes.",
      "Balanced [work]—nothing crammed, nothing missing.",
      "Well-designed [work] with a steady pace.",
    ],
    writing: [
      "The [work] read smoothly and stayed on topic.",
      "Clear [work] with a logical flow.",
      "The [work] hit the brief and kept the tone steady.",
      "Concise [work] that still felt complete.",
    ],
    general: [
      "The [work] followed the instructions closely and arrived on time.",
      "Clean [work] that matched the rubric—no surprises.",
      "Neat, ready-to-submit [work].",
      "Simple, effective [work] that didn’t waste time.",
    ],
    editing: [
      "The [work] was tightened up nicely—grammar and flow both improved.",
      "Clean [work] with consistent style and no distracting errors.",
      "Sharper after edits—easy to read.",
      "Polished [work] without changing the message.",
    ],
  };
  
  // ——— Date / RNG utils ———
  const dtfKey = (tz: string) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const dtfLabel = (tz: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" });
  
  function dateKey(d: Date, tz: string): string {
    const parts = dtfKey(tz).formatToParts(d).reduce((acc: Record<string, string>, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  function labelForDate(d: Date, _now: Date, tz: string) {
    return dtfLabel(tz).format(d); // we only generate 7–180 days ago
  }
  function seededFromString(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  }
  function mulberry32(seed: number) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randomInt(rng: () => number, min: number, max: number) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  function pickWeighted<T>(rng: () => number, items: T[], weight: (x: T) => number) {
    const weights = items.map(weight);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
  function generateCompletionId(year: number, rng: () => number): string {
    const digits = String(randomInt(rng, 100, 999)).padStart(3, "0");
    const letters =
      String.fromCharCode(65 + randomInt(rng, 0, 25)) +
      String.fromCharCode(65 + randomInt(rng, 0, 25));
    return `MHH-${year}-${digits}${letters}`;
  }
  
  // ——— Unique pickers for openers/closers (no repeats) ———
  function makeUniquePicker(list: string[], rng: () => number) {
    // Shuffle indices deterministically
    const idx = list.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    let cursor = 0;
    return () => {
      if (cursor >= idx.length) return null;
      return list[idx[cursor++]];
    };
  }
  
  // ——— “Humanize” helpers ———
  function varyWork(group: Group, base: string, rng: () => number) {
    const list = WORK_SYNONYMS[group];
    if (!list || rng() < 0.6) return base; // 40% chance to swap
    return list[Math.floor(rng() * list.length)];
  }
  function maybeAddLexicon(group: Group, rng: () => number) {
    if (rng() < 0.55) return "";
    const terms = LEXICON_BY_GROUP[group] || [];
    if (!terms.length) return "";
    const t = terms[Math.floor(rng() * terms.length)];
    return rng() < 0.5 ? ` (incl. ${t})` : ` — ${t}`;
  }
  // Openers/closers are optional, but when used we pull uniquely from the pool
  function maybeOpener(pick: () => string | null, rng: () => number) {
    if (rng() < 0.25) {
      const o = pick();
      return o ? o + " " : "";
    }
    return "";
  }
  function maybeCloser(pick: () => string | null, rng: () => number) {
    if (rng() < 0.35) {
      const c = pick();
      return c ? " " + c : "";
    }
    return "";
  }
  // Tiny, safe “human slips” (~20%)
  function microTypo(text: string, rng: () => number) {
    if (rng() >= 0.2) return text;
    if (rng() < 0.5) {
      const words = text.split(" ");
      const idx = Math.floor(rng() * words.length);
      const w = words[idx];
      const m = /[A-Za-z]{4,}/.exec(w);
      if (m) {
        const i = Math.min(m.index + 1, w.length - 1);
        words[idx] = w.slice(0, i) + w[i] + w.slice(i);
        return words.join(" ");
      }
      return text;
    } else {
      return text.replace(/([,.])( )/m, (_x, p1, p2) => `${p1}${p2} `);
    }
  }
  
  // Compose one sentence from template + variations
  function composeSentence(
    group: Group,
    workBase: string,
    rng: () => number,
    pickOpener: () => string | null,
    pickCloser: () => string | null
  ) {
    const work = varyWork(group, workBase, rng);
    const tpl = TPL[group][Math.floor(rng() * TPL[group].length)];
    let sentence = tpl.replace(/\[work\]/g, work);
  
    sentence += maybeAddLexicon(group, rng);
    sentence = maybeOpener(pickOpener, rng) + sentence + maybeCloser(pickCloser, rng);
    sentence = microTypo(sentence, rng);
    return sentence.trim();
  }
  
  // ——— Public generator ———
  export function generateLiveReviews(opts: { count?: number; timezone?: string } = {}): ReviewItem[] {
    const count = Math.max(1, Math.floor(opts.count ?? 20));
    const tz = opts.timezone ?? "Asia/Kolkata";
  
    const now = new Date();
    const seedKey = dateKey(now, tz);               // stable per day
    const rng = mulberry32(seededFromString(`REVIEWS-${seedKey}`));
  
    const pickOpener = makeUniquePicker(OPENERS, rng);
    const pickCloser = makeUniquePicker(CLOSERS, rng);
    const usedTexts = new Set<string>();
  
    const items: ReviewItem[] = [];
    for (let i = 0; i < count; i++) {
      const subj = pickWeighted(rng, SUBJECTS, (s) => s.weight ?? 1);
      const { label: subject, work, group } = subj;
  
      // compose with de-dup safeguard
      let text = "";
      for (let tries = 0; tries < 8; tries++) {
        const candidate = composeSentence(group, work, rng, pickOpener, pickCloser);
        if (!usedTexts.has(candidate)) {
          usedTexts.add(candidate);
          text = candidate;
          break;
        }
      }
      if (!text) {
        // last resort: force a tiny variant to break the tie
        text = composeSentence(group, work, rng, pickOpener, pickCloser) + " (nicely done)";
        usedTexts.add(text);
      }
  
      // 6 months (≈180d) … 1 week (7d) ago
      const daysAgo = randomInt(rng, 7, 180);
      const date = new Date(now);
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      const label = labelForDate(date, now, tz);
  
      const rating: 4 | 5 = rng() < 0.2 ? 4 : 5;
      const code = generateCompletionId(date.getFullYear(), rng);
  
      items.push({ code, subject, text, rating, date, label });
    }
  
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items;
  }
  