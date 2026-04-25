export const REGIONS = [
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

export const WATER_TYPES = ["á", "vatn", "svæði", "óstaðfest"] as const;

export const FISH_SPECIES = [
  "bleikja",
  "urriði",
  "lax",
  "sjóbirtingur",
  "óstaðfest",
] as const;

export const BAIT_TYPES = ["fluga", "spúnn", "maðkur", "óstaðfest"] as const;

export const PERMIT_MODELS = ["Veiðikortið", "Stakt leyfi", "Óstaðfest"] as const;

export const ACCESS_LEVELS = ["auðvelt", "miðlungs", "krefjandi", "óstaðfest"] as const;

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

export type Region = (typeof REGIONS)[number];
export type WaterType = (typeof WATER_TYPES)[number];
export type FishSpecies = (typeof FISH_SPECIES)[number];
export type BaitType = (typeof BAIT_TYPES)[number];
export type PermitModel = (typeof PERMIT_MODELS)[number];
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export interface FishingSpot {
  id: string;
  name: string;
  slug: string;
  region: Region;
  waterType: WaterType;
  fishSpecies: FishSpecies[];
  allowedBaits: BaitType[];
  permitModel: PermitModel;
  includedInVeidikortid: boolean;
  sourceName: string;
  sourceUrl: string;
  googleMapsUrl: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageSource?: string | null;
  shortDescription: string;
  familyFriendly: boolean | null;
  accessLevel: AccessLevel;
  seasonText: string | null;
  latitude: number | null;
  longitude: number | null;
  dataConfidence: Confidence;
  notes: string[];
  integrationMeta?: {
    dataset: "manual" | "imported";
    sourceCategory?: string;
    importedSourceRecordIds?: string[];
    variantNames?: string[];
    duplicateGroupKey?: string | null;
    isMappable: boolean;
    isFilterable: boolean;
    isDetailReady: boolean;
    missingFields: Array<"coordinates" | "season" | "species" | "bait" | "region" | "waterType">;
    lowConfidence: boolean;
    dailyHoursText?: string | null;
    rulesText?: string | null;
    practicalInfoText?: string | null;
    scrapedAt?: string;
  };
}

export interface DiscoveryFilters {
  query: string;
  regions: Region[];
  waterTypes: WaterType[];
  species: FishSpecies[];
  baitTypes: BaitType[];
  includedInVeidikortid: "all" | "yes" | "no";
}
