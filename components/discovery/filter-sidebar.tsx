"use client";

import { RotateCcw, X } from "lucide-react";

import { SearchBar } from "@/components/discovery/search-bar";
import {
  BAIT_TYPES,
  FISH_SPECIES,
  PERMIT_MODELS,
  REGIONS,
  SOURCE_NAMES,
  WATER_TYPES,
  type DiscoveryFilters,
  type Region,
} from "@/types/spot";

const visibleRegions: Region[] = REGIONS.filter((region) => region !== "Óstaðfest");
const visiblePermitModels = PERMIT_MODELS.filter((permitModel) => permitModel !== "Veiðikortið");

function FilterChip({
  active,
  label,
  onClick,
  multiline = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  multiline?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border text-sm font-medium transition ${
        multiline
          ? "min-h-[3.45rem] rounded-[1.05rem] px-3.5 py-2.5 text-left leading-5"
          : "rounded-full px-4 py-2.5"
      } ${
        active
          ? "border-[#12343B] bg-[#12343B] text-white shadow-[0_14px_28px_rgba(18,52,59,0.12)]"
          : "border-ink/10 bg-white text-ink/72 hover:border-[#12343B]/18 hover:bg-[#f7fbfc]"
      }`}
    >
      <span className={multiline ? "block whitespace-normal break-words" : "block"}>{label}</span>
    </button>
  );
}

function SidebarSection({
  title,
  count,
  children,
  dense = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
        {count ? (
          <span className="text-[12px] font-semibold text-moss/62">{count}</span>
        ) : null}
      </div>
      <div className={dense ? "grid grid-cols-2 gap-2.5" : "flex flex-wrap gap-2.5"}>{children}</div>
    </section>
  );
}

function ActiveFilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-[#12343B]/12 bg-[#edf5f7] px-3 py-1.5 text-xs font-medium text-ink/74 transition hover:border-[#12343B]/18"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}

export function FilterSidebar({
  filters,
  activeFilterCount,
  onChange,
  onReset,
}: {
  filters: DiscoveryFilters;
  activeFilterCount: number;
  onChange: (next: DiscoveryFilters) => void;
  onReset: () => void;
}) {
  const toggleArrayValue = (
    key: "regions" | "waterTypes" | "species" | "baitTypes" | "permitModels" | "sourceNames",
    value: string,
  ) => {
    const currentValues = filters[key] as string[];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((entry) => entry !== value)
      : [...currentValues, value];

    onChange({ ...filters, [key]: nextValues } as DiscoveryFilters);
  };

  const activePills = [
    ...filters.regions.map((region) => ({
      label: region,
      onRemove: () => toggleArrayValue("regions", region),
    })),
    ...filters.waterTypes.map((waterType) => ({
      label: waterType,
      onRemove: () => toggleArrayValue("waterTypes", waterType),
    })),
    ...filters.species.map((species) => ({
      label: species,
      onRemove: () => toggleArrayValue("species", species),
    })),
    ...filters.baitTypes.map((bait) => ({
      label: bait,
      onRemove: () => toggleArrayValue("baitTypes", bait),
    })),
    ...filters.permitModels.map((permitModel) => ({
      label: permitModel,
      onRemove: () => toggleArrayValue("permitModels", permitModel),
    })),
    ...filters.sourceNames.map((sourceName) => ({
      label: sourceName,
      onRemove: () => toggleArrayValue("sourceNames", sourceName),
    })),
    ...(filters.includedInVeidikortid === "all"
      ? []
      : [
          {
            label:
              filters.includedInVeidikortid === "yes" ? "Í Veiðikortinu" : "Utan Veiðikortsins",
            onRemove: () => onChange({ ...filters, includedInVeidikortid: "all" }),
          },
        ]),
  ];
  const permitFilterCount =
    filters.permitModels.length +
    filters.sourceNames.length +
    (filters.includedInVeidikortid === "all" ? 0 : 1);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[5.2rem] space-y-6 border-r border-ink/8 pr-8">
        <div className="space-y-4 pb-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-moss/58">
                Síur
              </p>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-ink"
              >
                <RotateCcw className="h-4 w-4" />
                Hreinsa
              </button>
            </div>
            <h2 className="text-[1.25rem] font-semibold tracking-tight text-ink">
              Þrengdu leitina
            </h2>
            <p className="text-[14px] leading-6 text-ink/60">
              {activeFilterCount
                ? `${activeFilterCount} síur eru virkar núna.`
                : "Veldu landshluta, fisktegundir eða leyfi og sjáðu kortið uppfærast strax."}
            </p>
          </div>

          <SearchBar value={filters.query} onChange={(query) => onChange({ ...filters, query })} />

          {activePills.length ? (
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-ink/46">Virkar síur</p>
              <div className="flex flex-wrap gap-2.5">
                {activePills.map((pill) => (
                  <ActiveFilterPill key={pill.label} label={pill.label} onRemove={pill.onRemove} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6 pb-6">
          <SidebarSection title="Landshluti" count={filters.regions.length} dense>
            {visibleRegions.map((region) => (
              <FilterChip
                key={region}
                label={region}
                active={filters.regions.includes(region)}
                onClick={() => toggleArrayValue("regions", region)}
                multiline
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Vatnategund" count={filters.waterTypes.length}>
            {WATER_TYPES.filter((waterType) => waterType !== "óstaðfest").map((waterType) => (
              <FilterChip
                key={waterType}
                label={waterType}
                active={filters.waterTypes.includes(waterType)}
                onClick={() => toggleArrayValue("waterTypes", waterType)}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Fisktegund" count={filters.species.length}>
            {FISH_SPECIES.filter((species) => species !== "óstaðfest").map((species) => (
              <FilterChip
                key={species}
                label={species}
                active={filters.species.includes(species)}
                onClick={() => toggleArrayValue("species", species)}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Veiðiaðferð / Agn" count={filters.baitTypes.length}>
            {BAIT_TYPES.filter((bait) => bait !== "óstaðfest").map((bait) => (
              <FilterChip
                key={bait}
                label={bait}
                active={filters.baitTypes.includes(bait)}
                onClick={() => toggleArrayValue("baitTypes", bait)}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Veiðileyfi" count={permitFilterCount} dense>
            {SOURCE_NAMES.map((sourceName) => (
              <FilterChip
                key={sourceName}
                label={sourceName}
                active={filters.sourceNames.includes(sourceName)}
                onClick={() => toggleArrayValue("sourceNames", sourceName)}
                multiline
              />
            ))}
            {visiblePermitModels.map((permitModel) => (
              <FilterChip
                key={permitModel}
                label={permitModel}
                active={filters.permitModels.includes(permitModel)}
                onClick={() => toggleArrayValue("permitModels", permitModel)}
                multiline
              />
            ))}
          </SidebarSection>
        </div>
      </div>
    </aside>
  );
}
