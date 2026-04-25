import {
  type ImportConfidence,
  type ImportedBait,
  type ImportedRegion,
  type ImportedSpecies,
  type ImportedWaterType,
} from "../../types/imported-spot";

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  deg: "°",
  quot: '"',
  rsquo: "’",
  lsquo: "‘",
};

const REGION_PATTERNS: Array<[ImportedRegion, RegExp[]]> = [
  ["Suðurland", [/suðurland/i, /selfoss/i, /þingvall/i, /grafning/i, /skálholt/i, /ölfus/i, /hvolsvöll/i, /flúð/i]],
  ["Vesturland", [/vesturland/i, /borgarfjör/i, /snæfellsnes/i, /hnappadal/i, /dal/i]],
  ["Vestfirðir", [/vestfirð/i, /barðaströnd/i, /ísafjör/i, /patreksfjör/i, /brjánslæk/i]],
  ["Norðurland", [/norðurland/i, /húnaþing/i, /skagafjör/i, /akureyr/i, /melrakkasl/i]],
  ["Austurland", [/austurland/i, /egilsstað/i, /berufjör/i, /djúpivog/i, /vopnafjör/i]],
  ["Hálendið", [/hálendi/i, /landmannalaugar/i, /fjallabak/i, /sprengisand/i]],
  ["Suðvesturland", [/suðvestur/i, /reykjanes/i]],
  ["Höfuðborgarsvæðið", [/höfuðborgarsvæð/i, /garðabæ/i, /hafnarfjör/i, /mosfellsbæ/i, /reykjavík/i, /kópavog/i]],
];

const WATER_TYPE_PATTERNS: Array<[ImportedWaterType, RegExp[]]> = [
  ["svæði", [/silungasvæði/i, /laxasvæði/i, /veiðisvæð/i, /svæði/i]],
  ["vatn", [/vatn/i, /tjörn/i, /lón/i]],
  ["á", [/laxá/i, /brúará/i, /miðfjarðará/i, /ölfusá/i, /hvítá/i, /fossá/i, /svartá/i, /hólaá/i, /langadalsá/i, /hvannadalsá/i, /hvolsá/i, /víðidalsá/i, /gufuá/i, /\bveiðiá\b/i, /\bbergvatnsá\b/i, /\blindá\b/i, /\báin\b/i]],
];

const SPECIES_PATTERNS: Array<[ImportedSpecies, RegExp[]]> = [
  ["lax", [/\blax/i, /laxveið/i]],
  ["sjóbirtingur", [/sjóbirting/i, /sjobirting/i]],
  ["bleikja", [/bleikj/i]],
  ["urriði", [/urrið/i]],
];

const BAIT_PATTERNS: Array<[ImportedBait, RegExp[]]> = [
  ["fluga", [/fluguveið/i, /\bfluga\b/i]],
  ["spúnn", [/\bspúnn\b/i]],
  ["maðkur", [/\bmaðkur\b/i]],
];

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }

    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }

    return ENTITY_MAP[entity] ?? `&${entity};`;
  });
}

export function normalizeWhitespace(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function stripHtml(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

export function toExcerpt(value: string | null, maxLength = 220): string | null {
  if (!value) {
    return null;
  }

  const text = normalizeWhitespace(value);
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength).replace(/\s+\S*$/, "");
  return `${sliced}…`;
}

export function collectMatches<T extends string>(text: string, patterns: Array<[T, RegExp[]]>): T[] {
  const values = new Set<T>();

  for (const [value, checks] of patterns) {
    if (checks.some((pattern) => pattern.test(text))) {
      values.add(value);
    }
  }

  return [...values];
}

export function inferRegion(...inputs: Array<string | null | undefined>): ImportedRegion | null {
  const haystack = inputs.filter(Boolean).join("\n");

  for (const [region, patterns] of REGION_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(haystack))) {
      return region;
    }
  }

  return null;
}

export function inferWaterType(...inputs: Array<string | null | undefined>): ImportedWaterType | null {
  const haystack = inputs.filter(Boolean).join("\n");

  for (const [waterType, patterns] of WATER_TYPE_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(haystack))) {
      return waterType;
    }
  }

  return null;
}

export function inferSpecies(...inputs: Array<string | null | undefined>): ImportedSpecies[] {
  return collectMatches(inputs.filter(Boolean).join("\n"), SPECIES_PATTERNS);
}

export function inferAllowedBaits(...inputs: Array<string | null | undefined>): ImportedBait[] {
  return collectMatches(inputs.filter(Boolean).join("\n"), BAIT_PATTERNS);
}

function looksLikeLabel(line: string): boolean {
  return /:$/.test(line) || /^(hnit|staðsetning|veiðitímabil|tímabil|veiðitími|daglegur veiðitími|leyfilegt agn|fjöldi stanga)$/i.test(line);
}

export function extractLabeledValue(text: string, labels: string[]): string | null {
  const lines = normalizeWhitespace(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    for (const label of labels) {
      const matcher = new RegExp(`^${label}\\s*:?[\\s-]*`, "i");
      if (!matcher.test(line)) {
        continue;
      }

      const inline = line.replace(matcher, "").trim();
      if (inline) {
        return inline;
      }

      const nextLine = lines[index + 1];
      if (nextLine && !looksLikeLabel(nextLine)) {
        return nextLine;
      }
    }
  }

  return null;
}

export function inferConfidence(fields: {
  shortDescription?: string | null;
  region?: ImportedRegion | null;
  waterType?: ImportedWaterType | null;
  species?: ImportedSpecies[];
  latitude?: number | null;
  longitude?: number | null;
  seasonText?: string | null;
  dailyHoursText?: string | null;
  rulesText?: string | null;
  practicalInfoText?: string | null;
}): ImportConfidence {
  let score = 0;

  if (fields.shortDescription) score += 1;
  if (fields.region) score += 1;
  if (fields.waterType) score += 1;
  if ((fields.species?.length ?? 0) > 0) score += 1;
  if (fields.latitude != null && fields.longitude != null) score += 1;
  if (fields.seasonText) score += 1;
  if (fields.dailyHoursText) score += 1;
  if (fields.rulesText) score += 1;
  if (fields.practicalInfoText) score += 1;

  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}

export function parseCoordinatePair(text: string): { latitude: number; longitude: number } | null {
  const match = normalizeWhitespace(text).match(
    /Hnit:\s*(\d{1,2})°\s*([\d.,]+)[’']?\s*([NS]),\s*(\d{1,3})°\s*([\d.,]+)[’']?\s*([EW])/i,
  );

  if (!match) {
    return null;
  }

  const [, latDegrees, latMinutes, latHemisphere, lonDegrees, lonMinutes, lonHemisphere] = match;

  const latitudeBase = Number(latDegrees) + Number(latMinutes.replace(",", ".")) / 60;
  const longitudeBase = Number(lonDegrees) + Number(lonMinutes.replace(",", ".")) / 60;

  return {
    latitude: latHemisphere.toUpperCase() === "S" ? -latitudeBase : latitudeBase,
    longitude: lonHemisphere.toUpperCase() === "W" ? -longitudeBase : longitudeBase,
  };
}
