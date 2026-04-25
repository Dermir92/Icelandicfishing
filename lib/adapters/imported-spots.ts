import importedSpots from "@/data/imported-spots.json";
import type { ImportedSpotRecord } from "@/types/imported-spot";
import type { FishingSpot } from "@/types/spot";

const UNKNOWN_REGION = "Óstaðfest";
const UNKNOWN_WATER_TYPE = "óstaðfest";
const UNKNOWN_SPECIES = "óstaðfest";
const UNKNOWN_BAIT = "óstaðfest";
const UNKNOWN_ACCESS = "óstaðfest";

const SEASONAL_VARIANT_PATTERNS = [
  /(?:[.,]\s*)vorveiði$/i,
  /(?:[.,]\s*)haustveiði$/i,
  /(?:[.,]\s*)vor$/i,
  /(?:[.,]\s*)haust$/i,
] as const;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function canonicalizeImportedName(name: string) {
  let normalized = normalizeWhitespace(name);

  for (const pattern of SEASONAL_VARIANT_PATTERNS) {
    normalized = normalized.replace(pattern, "");
  }

  return normalized.replace(/\s+[–-]\s+$/, "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasCoordinates(spot: ImportedSpotRecord) {
  return typeof spot.latitude === "number" && typeof spot.longitude === "number";
}

function scoreImportedRecord(spot: ImportedSpotRecord) {
  let score = 0;

  if (spot.dataConfidence === "high") score += 10;
  if (spot.dataConfidence === "medium") score += 6;
  if (spot.dataConfidence === "low") score += 2;

  if (hasCoordinates(spot)) score += 4;
  if (spot.seasonText) score += 2;
  if (spot.species.length) score += 2;
  if (spot.allowedBaits.length) score += 1;
  if (spot.rulesText) score += 3;
  if (spot.practicalInfoText) score += 3;
  if (spot.dailyHoursText) score += 1;
  if (spot.imageUrl) score += 1;
  if (!SEASONAL_VARIANT_PATTERNS.some((pattern) => pattern.test(spot.name))) score += 2;

  return score;
}

interface DedupedImportedRecord {
  canonical: ImportedSpotRecord;
  variants: ImportedSpotRecord[];
  duplicateGroupKey: string | null;
}

export function dedupeImportedRecords(records: ImportedSpotRecord[]): DedupedImportedRecord[] {
  const groups = new Map<string, ImportedSpotRecord[]>();

  for (const record of records) {
    const key = `${record.sourceName}:${slugify(canonicalizeImportedName(record.name))}`;
    const existing = groups.get(key);

    if (existing) {
      existing.push(record);
    } else {
      groups.set(key, [record]);
    }
  }

  return [...groups.entries()].map(([groupKey, recordsInGroup]) => {
    const ranked = [...recordsInGroup].sort((left, right) => scoreImportedRecord(right) - scoreImportedRecord(left));
    const canonical = ranked[0];
    const variants = ranked.slice(1);

    return {
      canonical,
      variants,
      duplicateGroupKey: variants.length ? groupKey : null,
    };
  });
}

function buildFallbackDescription(spot: ImportedSpotRecord) {
  if (spot.sourceName === "veida.is") {
    return "Innflutt skráning úr veida.is. Frekari upplýsingar eru á upprunasíðu staðarins.";
  }

  return "Innflutt skráning úr Veiðikortinu. Frekari upplýsingar eru á upprunasíðu staðarins.";
}

function buildGoogleMapsUrl(latitude: number | null, longitude: number | null) {
  if (latitude == null || longitude == null) {
    return null;
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function collectMissingFields(record: ImportedSpotRecord) {
  const missing: Array<"coordinates" | "season" | "species" | "bait" | "region" | "waterType"> = [];

  if (!hasCoordinates(record)) missing.push("coordinates");
  if (!record.seasonText) missing.push("season");
  if (!record.species.length) missing.push("species");
  if (!record.allowedBaits.length) missing.push("bait");
  if (!record.region) missing.push("region");
  if (!record.waterType) missing.push("waterType");

  return missing;
}

function isFilterable(record: ImportedSpotRecord) {
  return Boolean(record.name && (record.region || record.waterType || record.species.length || record.allowedBaits.length));
}

function isDetailReady(record: ImportedSpotRecord) {
  return Boolean(
    record.name &&
      record.shortDescription &&
      (record.seasonText || record.rulesText || record.practicalInfoText || record.sourceUrl),
  );
}

export function adaptImportedRecordToFishingSpot(entry: DedupedImportedRecord): FishingSpot {
  const { canonical, variants, duplicateGroupKey } = entry;
  const missingFields = collectMissingFields(canonical);
  const lowConfidence = canonical.dataConfidence === "low";
  const filterable = isFilterable(canonical);
  const detailReady = isDetailReady(canonical);

  const notes = [
    `Innflutt frá ${canonical.sourceName}.`,
    ...(lowConfidence ? ["Gæði gagna eru lág og staðurinn ætti að fara í handvirka yfirferð."] : []),
    ...(missingFields.includes("coordinates") ? ["Hnit vantar enn fyrir kortanotkun."] : []),
    ...(missingFields.includes("season") ? ["Veiðitímabil vantar í núverandi innlestri."] : []),
    ...(variants.length ? [`Afbrigði sameinuð: ${variants.map((variant) => variant.name).join(", ")}.`] : []),
  ];

  return {
    id: canonical.id,
    name: canonical.name,
    slug: canonical.slug,
    region: (canonical.region ?? UNKNOWN_REGION) as FishingSpot["region"],
    waterType: (canonical.waterType ?? UNKNOWN_WATER_TYPE) as FishingSpot["waterType"],
    fishSpecies: (canonical.species.length ? canonical.species : [UNKNOWN_SPECIES]) as FishingSpot["fishSpecies"],
    allowedBaits: (canonical.allowedBaits.length ? canonical.allowedBaits : [UNKNOWN_BAIT]) as FishingSpot["allowedBaits"],
    permitModel: canonical.permitModel as FishingSpot["permitModel"],
    includedInVeidikortid: canonical.permitModel === "Veiðikortið",
    sourceName: canonical.sourceName,
    sourceUrl: canonical.sourceUrl,
    googleMapsUrl: buildGoogleMapsUrl(canonical.latitude, canonical.longitude),
    imageUrl: canonical.imageUrl,
    imageAlt: canonical.imageAlt,
    imageSource: canonical.imageSource,
    shortDescription: canonical.shortDescription ?? buildFallbackDescription(canonical),
    familyFriendly: null,
    accessLevel: UNKNOWN_ACCESS as FishingSpot["accessLevel"],
    seasonText: canonical.seasonText,
    latitude: canonical.latitude,
    longitude: canonical.longitude,
    dataConfidence: canonical.dataConfidence as FishingSpot["dataConfidence"],
    notes,
    integrationMeta: {
      dataset: "imported",
      sourceCategory: canonical.sourceCategory,
      importedSourceRecordIds: [canonical.id, ...variants.map((variant) => variant.id)],
      variantNames: variants.map((variant) => variant.name),
      duplicateGroupKey,
      isMappable: hasCoordinates(canonical),
      isFilterable: filterable,
      isDetailReady: detailReady,
      missingFields,
      lowConfidence,
      dailyHoursText: canonical.dailyHoursText,
      rulesText: canonical.rulesText,
      practicalInfoText: canonical.practicalInfoText,
      scrapedAt: canonical.scrapedAt,
    },
  };
}

export const importedSpotRecords = importedSpots as ImportedSpotRecord[];
export const dedupedImportedSpotRecords = dedupeImportedRecords(importedSpotRecords);
export const importedFishingSpotsForUi = dedupedImportedSpotRecords.map(adaptImportedRecordToFishingSpot);

export const importedSpotUiStats = {
  rawImportedRecords: importedSpotRecords.length,
  dedupedUiRecords: importedFishingSpotsForUi.length,
  usableForMapMarkers: importedFishingSpotsForUi.filter((spot) => spot.integrationMeta?.isMappable).length,
  usableForFilterableListingCards: importedFishingSpotsForUi.filter((spot) => spot.integrationMeta?.isFilterable).length,
  usableForFullDetailPages: importedFishingSpotsForUi.filter((spot) => spot.integrationMeta?.isDetailReady).length,
  lowConfidenceRecords: importedFishingSpotsForUi.filter((spot) => spot.integrationMeta?.lowConfidence).length,
};
