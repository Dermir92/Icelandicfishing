"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowDownUp, LayoutGrid, Rows3 } from "lucide-react";

import { EmptyState } from "@/components/discovery/empty-state";
import { FilterDrawer } from "@/components/discovery/filter-drawer";
import { FilterSidebar } from "@/components/discovery/filter-sidebar";
import { MapPanel } from "@/components/discovery/map-panel";
import { SpotCard } from "@/components/discovery/spot-card";
import { Badge } from "@/components/ui/badge";
import { defaultFilters, filterSpots } from "@/lib/filter-spots";
import { getActiveFilterCount } from "@/lib/spot-metadata";
import type { DiscoveryFilters, FishingSpot } from "@/types/spot";

type SortMode = "name" | "region";
type ViewMode = "grid" | "list";

function hasCoordinates(spot: FishingSpot) {
  return typeof spot.latitude === "number" && typeof spot.longitude === "number";
}

function sortSpots(spots: FishingSpot[], sortMode: SortMode) {
  const collator = new Intl.Collator("is");

  return [...spots].sort((a, b) => {
    if (sortMode === "region") {
      const regionCompare = collator.compare(a.region, b.region);
      if (regionCompare !== 0) return regionCompare;
    }

    return collator.compare(a.name, b.name);
  });
}

export function DiscoveryShell({
  spots,
  initialFilters,
}: {
  spots: FishingSpot[];
  initialFilters?: Partial<DiscoveryFilters>;
}) {
  const [filters, setFilters] = useState<DiscoveryFilters>(() => ({
    ...defaultFilters,
    ...initialFilters,
    regions: initialFilters?.regions ?? defaultFilters.regions,
    waterTypes: initialFilters?.waterTypes ?? defaultFilters.waterTypes,
    species: initialFilters?.species ?? defaultFilters.species,
    baitTypes: initialFilters?.baitTypes ?? defaultFilters.baitTypes,
  }));
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const deferredFilters = useDeferredValue(filters);

  const filteredSpots = useMemo(() => filterSpots(spots, deferredFilters), [deferredFilters, spots]);
  const sortedSpots = useMemo(() => sortSpots(filteredSpots, sortMode), [filteredSpots, sortMode]);
  const mappableSpots = useMemo(() => sortedSpots.filter(hasCoordinates), [sortedSpots]);
  const hiddenSpotsCount = sortedSpots.length - mappableSpots.length;

  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const activeFilterCount = getActiveFilterCount(filters);

  useEffect(() => {
    if (!sortedSpots.length) {
      setSelectedSpotId(null);
      return;
    }

    const stillVisible = sortedSpots.some((spot) => spot.id === selectedSpotId);
    if (!stillVisible) {
      setSelectedSpotId(null);
    }
  }, [sortedSpots, selectedSpotId]);

  const selectedSpot =
    selectedSpotId !== null ? sortedSpots.find((spot) => spot.id === selectedSpotId) ?? null : null;

  return (
    <main className="mx-auto flex w-full max-w-[160rem] flex-col gap-8 px-4 pb-16 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-14">
      <section className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-10">
        <div className="hidden xl:block" />

        <div className="space-y-4">
          <div className="max-w-3xl space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-moss/62">
              Yfirlit
            </p>
            <h1 className="text-[1.95rem] font-semibold tracking-tight text-ink sm:text-[2.3rem]">
              Finndu rétta veiðistaðinn.
            </h1>
            <p className="max-w-2xl text-[15px] leading-6 text-ink/63">
              Kortið er aðalverkfærið. Byrjaðu á yfirlitinu, þrengdu leitina með síum og berðu svo saman staðina hér fyrir neðan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-ink/66">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-moss/58">
                Á korti
              </span>
              <span className="text-base font-semibold text-ink">{mappableSpots.length}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-ink/66">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-moss/58">
                Passa við síur
              </span>
              <span className="text-base font-semibold text-ink">{sortedSpots.length}</span>
            </div>
            {activeFilterCount ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#12343B]/14 bg-[#edf5f7] px-3.5 py-2 text-ink/72">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-moss/58">
                  Virkar síur
                </span>
                <span className="text-base font-semibold text-ink">{activeFilterCount}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-10">
        <FilterSidebar
          filters={filters}
          activeFilterCount={activeFilterCount}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
        />

        <div className="min-w-0 space-y-8">
          <MapPanel
            spots={sortedSpots}
            mappableSpotCount={mappableSpots.length}
            hiddenSpotsCount={hiddenSpotsCount}
            selectedSpot={selectedSpot}
            selectedSpotId={selectedSpotId}
            onSelectSpot={setSelectedSpotId}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />

          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[1.5rem] font-semibold tracking-tight text-ink">Veiðistaðir</h2>
                  <Badge>{sortedSpots.length}</Badge>
                </div>
                <p className="text-[15px] leading-6 text-ink/62">
                  Niðurstöðurnar hjálpa þér að skanna úrvalið hratt eftir að þú hefur skoðað kortið.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 text-sm text-ink/72 shadow-[0_10px_24px_rgba(18,40,45,0.04)]">
                  <ArrowDownUp className="h-4 w-4 text-ink/46" />
                  <span className="font-medium">Raða</span>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="bg-transparent font-semibold text-ink outline-none"
                  >
                    <option value="name">Nafni</option>
                    <option value="region">Landshluta</option>
                  </select>
                </label>

                <div className="inline-flex rounded-full border border-ink/10 bg-white p-1 shadow-[0_10px_24px_rgba(18,40,45,0.04)]">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      viewMode === "grid"
                        ? "bg-ink text-white"
                        : "text-ink/62 hover:bg-mist/60 hover:text-ink"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Grind
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      viewMode === "list"
                        ? "bg-ink text-white"
                        : "text-ink/62 hover:bg-mist/60 hover:text-ink"
                    }`}
                  >
                    <Rows3 className="h-4 w-4" />
                    Listi
                  </button>
                </div>
              </div>
            </div>

            {sortedSpots.length ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-5 md:grid-cols-2 2xl:grid-cols-3"
                    : "grid gap-4"
                }
              >
                {sortedSpots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    selected={spot.id === selectedSpotId}
                    onSelect={() => setSelectedSpotId(spot.id)}
                    compact={viewMode === "list"}
                    layout={viewMode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </section>

      <FilterDrawer
        open={isDrawerOpen}
        filters={filters}
        onClose={() => setIsDrawerOpen(false)}
        onReset={() => setFilters(defaultFilters)}
        onChange={setFilters}
      />
    </main>
  );
}
