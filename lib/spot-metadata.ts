import type { DiscoveryFilters } from "@/types/spot";

export function getActiveFilterCount(filters: DiscoveryFilters) {
  let count = 0;

  if (filters.query.trim()) count += 1;
  if (filters.regions.length) count += 1;
  if (filters.waterTypes.length) count += 1;
  if (filters.species.length) count += 1;
  if (filters.baitTypes.length) count += 1;
  if (filters.includedInVeidikortid !== "all") count += 1;

  return count;
}
