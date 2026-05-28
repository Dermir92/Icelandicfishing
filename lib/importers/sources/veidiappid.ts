import {
  buildListingDescription,
  inferConfidence,
  stripHtml,
} from "../normalize";
import type { ImportedSpotRecord } from "../../../types/imported-spot";
import type { ImportedRegion, ImportedSpecies, ImportedBait, ImportedWaterType, ImportedPermitModel } from "../../../types/imported-spot";

const BASE_URL = "https://veidiappid.is";
const LAKES_DATA_URL = `${BASE_URL}/veidisvaedi/votn/__data.json`;
const RIVERS_DATA_URL = `${BASE_URL}/veidisvaedi/ar/__data.json`;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; VeidistadirBot/1.0)",
  Accept: "application/json",
};

// ── SvelteKit __data.json decoder ───────────────────────────────────────────

type SvelteData = (string | number | boolean | null | Record<string, number> | number[])[];

function deref(data: SvelteData, idx: number): unknown {
  const v = data[idx];
  if (Array.isArray(v)) {
    return v.map((i) => (typeof i === "number" && i < data.length ? deref(data, i) : i));
  }
  if (v !== null && typeof v === "object" && !Array.isArray(v)) {
    const obj = v as Record<string, number>;
    // Coordinate pair
    if ("lat" in obj && "lng" in obj) {
      return { lat: data[obj.lat] as number, lng: data[obj.lng] as number };
    }
    // Schema object — resolve each field
    return Object.fromEntries(Object.entries(obj).map(([k, vi]) => [k, deref(data, vi)]));
  }
  return v;
}

interface VeidiappidSpot {
  name: string;
  areaType: string;
  slug: string;
  coordinates: { lat: number; lng: number } | null;
  coverPhoto: string | null;
  seasonFrom: string | null;
  seasonTo: string | null;
  price: string | null;
  memberships: string[];
  species: string[];
  about: string | null;
  permitAndInformation: string | null;
  rules: string | null;
  partOfTheCountry: string | null;
  isDisabled: boolean;
  dailyHoursStart: string | null;
  dailyHoursEnd: string | null;
  allowedItems: string[];
  id: string;
}

function decodeSpots(json: { nodes: { data: SvelteData }[] }): VeidiappidSpot[] {
  const node = json.nodes.find((n) => n.data && Array.isArray(n.data[1]));
  if (!node) return [];

  const data = node.data;
  const indices = data[1] as number[];

  return indices
    .map((i) => deref(data, i) as Record<string, unknown>)
    .filter((s) => s && typeof s.name === "string" && !(s.isDisabled as boolean))
    .map((s) => ({
      name: s.name as string,
      areaType: (s.areaType as string) ?? "lake",
      slug: s.slug as string,
      coordinates: (s.coordinates as { lat: number; lng: number }) ?? null,
      coverPhoto: (s.coverPhoto as string) || null,
      seasonFrom: (s.seasonFrom as string) || null,
      seasonTo: (s.seasonTo as string) || null,
      price: (s.price as string) || null,
      memberships: (s.memberships as string[]) ?? [],
      species: (s.species as string[]) ?? [],
      about: (s.about as string) || null,
      permitAndInformation: (s.permitAndInformation as string) || null,
      rules: (s.rules as string) || null,
      partOfTheCountry: (s.partOfTheCountry as string) || null,
      isDisabled: !!(s.isDisabled as boolean),
      dailyHoursStart: (s.dailyHoursStart as string) || null,
      dailyHoursEnd: (s.dailyHoursEnd as string) || null,
      allowedItems: (s.allowedItems as string[]) ?? [],
      id: s.id as string,
    }));
}

// ── Field mappers ────────────────────────────────────────────────────────────

const REGION_MAP: Record<string, ImportedRegion> = {
  "Höfuðborgarsvæðið": "Höfuðborgarsvæðið",
  "Suðvesturland": "Suðvesturland",
  "Suðurland": "Suðurland",
  "Vesturland": "Vesturland",
  "Vestfirðir": "Vestfirðir",
  "Norðurland": "Norðurland",
  "Austurland": "Austurland",
  "Hálendi": "Hálendið",
  "Hálendið": "Hálendið",
};

const SPECIES_MAP: Record<string, ImportedSpecies> = {
  "Urriði": "urriði",
  "Bleikja": "bleikja",
  "Lax": "lax",
  "Sjóbirtingur": "sjóbirtingur",
};

const BAIT_MAP: Record<string, ImportedBait> = {
  "Fluga": "fluga",
  "Maðkur": "maðkur",
  "Spúnn": "spúnn",
};

function mapRegion(raw: string | null): ImportedRegion | null {
  if (!raw) return null;
  return REGION_MAP[raw] ?? null;
}

function mapSpecies(raw: string[]): ImportedSpecies[] {
  return raw.flatMap((s) => (SPECIES_MAP[s] ? [SPECIES_MAP[s]] : []));
}

function mapBaits(raw: string[]): ImportedBait[] {
  return raw.flatMap((b) => (BAIT_MAP[b] ? [BAIT_MAP[b]] : []));
}

function mapWaterType(areaType: string): ImportedWaterType {
  if (areaType === "river") return "á";
  if (areaType === "lake") return "vatn";
  return "svæði";
}

function mapPermitModel(memberships: string[]): ImportedPermitModel {
  if (memberships.includes("Veiðikortið")) return "Veiðikortið";
  return "Stakt leyfi";
}

function buildSeasonText(from: string | null, to: string | null): string | null {
  if (!from && !to) return null;
  // Skip clearly invalid values
  const isGarbage = (s: string) => s.length > 40 || /^[0-9a-f]{20,}$/i.test(s);
  if (from && isGarbage(from)) return null;
  if (to && isGarbage(to)) return null;
  if (from && to) return `${from} – ${to}`;
  return from ?? to ?? null;
}

function buildDailyHoursText(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  if (start.length > 30 || end.length > 30) return null;
  if (start === "00:00" && end === "00:00") return null;
  return `Daglega frá ${start} til ${end}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function fetchSpots(url: string): Promise<VeidiappidSpot[]> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`veidiappid fetch failed: ${res.status} ${url}`);
  const json = await res.json() as { nodes: { data: SvelteData }[] };
  return decodeSpots(json);
}

function toRecord(spot: VeidiappidSpot, scrapedAt: string): ImportedSpotRecord {
  const aboutText = spot.about ? stripHtml(spot.about) : null;
  const permitText = spot.permitAndInformation ? stripHtml(spot.permitAndInformation) : null;
  const rulesText = spot.rules ? stripHtml(spot.rules) : null;

  const shortDescription = buildListingDescription(spot.name, aboutText ?? permitText);
  const region = mapRegion(spot.partOfTheCountry);
  const waterType = mapWaterType(spot.areaType);
  const species = mapSpecies(spot.species);
  const allowedBaits = mapBaits(spot.allowedItems);
  const seasonText = buildSeasonText(spot.seasonFrom, spot.seasonTo);
  const dailyHoursText = buildDailyHoursText(spot.dailyHoursStart, spot.dailyHoursEnd);
  const latitude = spot.coordinates?.lat ?? null;
  const longitude = spot.coordinates?.lng ?? null;

  return {
    id: `veidiappid:${spot.slug}`,
    sourceName: "Veiði Appið",
    sourceUrl: `${BASE_URL}/veidisvaedi/${spot.areaType === "river" ? "ar" : "votn"}/${spot.slug}`,
    name: spot.name,
    slug: spot.slug,
    sourceCategory: spot.areaType,
    imageUrl: spot.coverPhoto,
    imageAlt: spot.name,
    imageSource: "Veiði Appið",
    region,
    waterType,
    species,
    allowedBaits,
    permitModel: mapPermitModel(spot.memberships),
    shortDescription,
    priceText: spot.price,
    seasonText,
    dailyHoursText,
    rulesText,
    practicalInfoText: permitText,
    latitude,
    longitude,
    dataConfidence: inferConfidence({
      shortDescription,
      region,
      waterType,
      species,
      latitude,
      longitude,
      seasonText,
      dailyHoursText,
      rulesText,
      practicalInfoText: permitText,
    }),
    scrapedAt,
  };
}

export async function importVeidiappidListings(scrapedAt: string): Promise<ImportedSpotRecord[]> {
  const [lakes, rivers] = await Promise.all([
    fetchSpots(LAKES_DATA_URL),
    fetchSpots(RIVERS_DATA_URL),
  ]);

  const all = [...lakes, ...rivers];
  console.log(`  veidiappid.is: ${lakes.length} vötn, ${rivers.length} ár`);

  return all.map((spot) => toRecord(spot, scrapedAt));
}
