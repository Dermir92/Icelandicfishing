import { DiscoveryShell } from "@/components/discovery/discovery-shell";
import { discoverSpots } from "@/data/discover-spots";
import {
  BAIT_TYPES,
  FISH_SPECIES,
  REGIONS,
  WATER_TYPES,
  type DiscoveryFilters,
} from "@/types/spot";

type SearchParams = Record<string, string | string[] | undefined>;

function asArray<T extends string>(value: string | string[] | undefined, allowed: readonly T[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.filter((entry): entry is T => (allowed as readonly string[]).includes(entry));
}

function getInitialFilters(searchParams: SearchParams): Partial<DiscoveryFilters> {
  const includedInVeidikortid =
    searchParams.veidikortid === "yes" || searchParams.veidikortid === "no"
      ? searchParams.veidikortid
      : undefined;

  return {
    query: typeof searchParams.q === "string" ? searchParams.q : "",
    regions: asArray(searchParams.region, REGIONS),
    waterTypes: asArray(searchParams.waterType, WATER_TYPES),
    species: asArray(searchParams.species, FISH_SPECIES),
    baitTypes: asArray(searchParams.bait, BAIT_TYPES),
    includedInVeidikortid,
  };
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialFilters = getInitialFilters(resolvedSearchParams);

  return <DiscoveryShell spots={discoverSpots} initialFilters={initialFilters} />;
}
