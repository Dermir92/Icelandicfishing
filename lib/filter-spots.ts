import type { DiscoveryFilters, FishingSpot } from "@/types/spot";

export const defaultFilters: DiscoveryFilters = {
  query: "",
  regions: [],
  waterTypes: [],
  species: [],
  baitTypes: [],
  includedInVeidikortid: "all",
  permitModels: [],
  sourceNames: [],
};

export const quickFilters = [
  {
    label: "Veiðikortið",
    matches: (filters: DiscoveryFilters) => filters.includedInVeidikortid === "yes",
    apply: (filters: DiscoveryFilters): DiscoveryFilters => ({
      ...filters,
      includedInVeidikortid: filters.includedInVeidikortid === "yes" ? "all" : "yes",
    }),
  },
  {
    label: "Ár",
    matches: (filters: DiscoveryFilters) => filters.waterTypes.includes("á"),
    apply: (filters: DiscoveryFilters): DiscoveryFilters => ({
      ...filters,
      waterTypes: filters.waterTypes.includes("á")
        ? filters.waterTypes.filter((type) => type !== "á")
        : [...filters.waterTypes, "á"],
    }),
  },
  {
    label: "Vötn",
    matches: (filters: DiscoveryFilters) => filters.waterTypes.includes("vatn"),
    apply: (filters: DiscoveryFilters): DiscoveryFilters => ({
      ...filters,
      waterTypes: filters.waterTypes.includes("vatn")
        ? filters.waterTypes.filter((type) => type !== "vatn")
        : [...filters.waterTypes, "vatn"],
    }),
  },
  {
    label: "Lax",
    matches: (filters: DiscoveryFilters) => filters.species.includes("lax"),
    apply: (filters: DiscoveryFilters): DiscoveryFilters => ({
      ...filters,
      species: filters.species.includes("lax")
        ? filters.species.filter((species) => species !== "lax")
        : [...filters.species, "lax"],
    }),
  },
  {
    label: "Fluga",
    matches: (filters: DiscoveryFilters) => filters.baitTypes.includes("fluga"),
    apply: (filters: DiscoveryFilters): DiscoveryFilters => ({
      ...filters,
      baitTypes: filters.baitTypes.includes("fluga")
        ? filters.baitTypes.filter((bait) => bait !== "fluga")
        : [...filters.baitTypes, "fluga"],
    }),
  },
];

export function filterSpots(spots: FishingSpot[], filters: DiscoveryFilters) {
  const query = filters.query.trim().toLowerCase();

  return spots.filter((spot) => {
    const searchableText = [
      spot.name,
      spot.region,
      spot.waterType,
      spot.shortDescription,
      spot.sourceName,
      spot.permitModel,
      spot.accessLevel,
      spot.seasonText ?? "",
      ...spot.fishSpecies,
      ...spot.allowedBaits,
    ]
      .join(" ")
      .toLowerCase();

    if (query && !searchableText.includes(query)) return false;
    if (filters.regions.length && !filters.regions.includes(spot.region)) return false;
    if (filters.waterTypes.length && !filters.waterTypes.includes(spot.waterType)) return false;
    if (
      filters.species.length &&
      !filters.species.some((species) => spot.fishSpecies.includes(species))
    ) {
      return false;
    }
    if (
      filters.baitTypes.length &&
      !filters.baitTypes.some((bait) => spot.allowedBaits.includes(bait))
    ) {
      return false;
    }
    if (filters.includedInVeidikortid === "yes" && !spot.includedInVeidikortid) return false;
    if (filters.includedInVeidikortid === "no" && spot.includedInVeidikortid) return false;
    if (filters.permitModels.length || filters.sourceNames.length) {
      const matchesPermitModel = filters.permitModels.includes(spot.permitModel);
      const matchesSourceName = filters.sourceNames.some((sourceName) => sourceName === spot.sourceName);

      if (!matchesPermitModel && !matchesSourceName) return false;
    }

    return true;
  });
}
