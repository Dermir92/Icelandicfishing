export const IMPORT_CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

export const IMPORT_REGIONS = [
  "Höfuðborgarsvæðið",
  "Suðvesturland",
  "Suðurland",
  "Vesturland",
  "Vestfirðir",
  "Norðurland",
  "Austurland",
  "Hálendið",
  "Óstaðfest",
] as const;

export const IMPORT_WATER_TYPES = ["á", "vatn", "svæði", "óstaðfest"] as const;
export const IMPORT_SPECIES = ["bleikja", "urriði", "lax", "sjóbirtingur"] as const;
export const IMPORT_BAITS = ["fluga", "spúnn", "maðkur"] as const;
export const IMPORT_PERMIT_MODELS = ["Veiðikortið", "Stakt leyfi", "Óstaðfest"] as const;

export type ImportConfidence = (typeof IMPORT_CONFIDENCE_LEVELS)[number];
export type ImportedRegion = (typeof IMPORT_REGIONS)[number];
export type ImportedWaterType = (typeof IMPORT_WATER_TYPES)[number];
export type ImportedSpecies = (typeof IMPORT_SPECIES)[number];
export type ImportedBait = (typeof IMPORT_BAITS)[number];
export type ImportedPermitModel = (typeof IMPORT_PERMIT_MODELS)[number];

export interface ImportedSpotRecord {
  id: string;
  sourceName: "Veiðikortið" | "veida.is";
  sourceUrl: string;
  name: string;
  slug: string;
  sourceCategory: string;
  imageUrl: string | null;
  imageAlt: string | null;
  imageSource: string | null;
  region: ImportedRegion | null;
  waterType: ImportedWaterType | null;
  species: ImportedSpecies[];
  allowedBaits: ImportedBait[];
  permitModel: ImportedPermitModel;
  shortDescription: string | null;
  priceText: string | null;
  seasonText: string | null;
  dailyHoursText: string | null;
  rulesText: string | null;
  practicalInfoText: string | null;
  latitude: number | null;
  longitude: number | null;
  dataConfidence: ImportConfidence;
  scrapedAt: string;
}
