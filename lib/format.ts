import type { FishingSpot } from "@/types/spot";

const UNKNOWN_TOKENS = new Set([
  "óstaðfest",
  "Óstaðfest",
  "unknown",
]);

function normalizeValue(value: string) {
  return value.trim();
}

export function isKnownValue(value: string | null | undefined) {
  if (!value) return false;

  return !UNKNOWN_TOKENS.has(normalizeValue(value));
}

export function getKnownValues(values: readonly string[]) {
  return values.filter((value) => isKnownValue(value));
}

export function getTextOrNull(value: string | null | undefined) {
  return isKnownValue(value) ? value : null;
}

export function formatSeasonText(spot: Pick<FishingSpot, "seasonText">) {
  return spot.seasonText ?? "Veiðitímabil kemur ekki fram";
}

export function getSeasonTextOrNull(spot: Pick<FishingSpot, "seasonText">) {
  return spot.seasonText ?? null;
}

export function formatFamilyFriendly(value: FishingSpot["familyFriendly"]) {
  if (value === true) return "Já";
  if (value === false) return "Nei";
  return "Ekki staðfest";
}

export function formatConfidenceLabel(value: FishingSpot["dataConfidence"]) {
  if (value === "high") return "Mikil vissa";
  if (value === "medium") return "Miðlungs vissa";
  return "Lág vissa";
}

export function formatDataQualityHint(value: FishingSpot["dataConfidence"]) {
  if (value === "high") {
    return "Grunnupplýsingar virðast vel staðfestar samkvæmt núverandi heimildum.";
  }

  if (value === "medium") {
    return "Flestar upplýsingar liggja fyrir, en einstök atriði geta enn tekið breytingum.";
  }

  return "Sum atriði eru enn óstaðfest. Notaðu heimildahlekkinn til að tvítékka áður en þú ferð af stað.";
}
