import { importedFishingSpotsForUi, importedSpotUiStats } from "@/data/imported-spots-ui";
import type { FishingSpot } from "@/types/spot";

export const discoverSpots = importedFishingSpotsForUi;

export const discoverSpotSummary = {
  dataset: "imported" as const,
  total: discoverSpots.length,
  mapReady: importedSpotUiStats.usableForMapMarkers,
  lowConfidence: importedSpotUiStats.lowConfidenceRecords,
  missingFields: discoverSpots.reduce(
    (accumulator, spot) => {
      for (const field of spot.integrationMeta?.missingFields ?? []) {
        accumulator[field] += 1;
      }

      return accumulator;
    },
    {
      coordinates: 0,
      season: 0,
      species: 0,
      bait: 0,
      region: 0,
      waterType: 0,
    },
  ),
};

export function getDiscoverSpotBySlug(slug: string) {
  return discoverSpots.find((spot) => spot.slug === slug);
}

export function getNearbyDiscoverSpots(spot: FishingSpot, limit = 3) {
  return discoverSpots
    .filter((candidate) => candidate.id !== spot.id)
    .sort((left, right) => {
      const leftScore =
        Number(left.region === spot.region) +
        Number(left.waterType === spot.waterType) +
        Number(left.includedInVeidikortid === spot.includedInVeidikortid);
      const rightScore =
        Number(right.region === spot.region) +
        Number(right.waterType === spot.waterType) +
        Number(right.includedInVeidikortid === spot.includedInVeidikortid);

      return rightScore - leftScore;
    })
    .slice(0, limit);
}
