"use client";

import { X } from "lucide-react";

import {
  BAIT_TYPES,
  FISH_SPECIES,
  REGIONS,
  WATER_TYPES,
  type DiscoveryFilters,
} from "@/types/spot";

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-[#12343B] bg-[#12343B] text-white shadow-sm"
          : "border-ink/10 bg-white text-ink/72 hover:border-ink/20 hover:bg-mist/70"
      }`}
    >
      {label}
    </button>
  );
}

export function FilterDrawer({
  open,
  filters,
  onClose,
  onReset,
  onChange,
}: {
  open: boolean;
  filters: DiscoveryFilters;
  onClose: () => void;
  onReset: () => void;
  onChange: (next: DiscoveryFilters) => void;
}) {
  if (!open) return null;

  const toggleArrayValue = (
    key: "regions" | "waterTypes" | "species" | "baitTypes",
    value: string,
  ) => {
    const currentValues = filters[key] as string[];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((entry) => entry !== value)
      : [...currentValues, value];

    onChange({ ...filters, [key]: nextValues } as DiscoveryFilters);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#081A1D]/45 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[2rem] border border-white/40 bg-fog p-5 shadow-panel sm:left-auto sm:right-4 sm:top-4 sm:max-h-[calc(100svh-2rem)] sm:w-[440px] sm:rounded-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss/70">Síur</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Þrengdu leitina
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white shadow-sm"
          >
            <X className="h-4 w-4 text-ink" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
              Landshluti
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {REGIONS.filter((region) => region !== "Óstaðfest").map((region) => (
                <ToggleChip
                  key={region}
                  label={region}
                  active={filters.regions.includes(region)}
                  onClick={() => toggleArrayValue("regions", region)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
              Vatnategund
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {WATER_TYPES.filter((waterType) => waterType !== "óstaðfest").map((waterType) => (
                <ToggleChip
                  key={waterType}
                  label={waterType}
                  active={filters.waterTypes.includes(waterType)}
                  onClick={() => toggleArrayValue("waterTypes", waterType)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
              Fisktegundir
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {FISH_SPECIES.filter((species) => species !== "óstaðfest").map((species) => (
                <ToggleChip
                  key={species}
                  label={species}
                  active={filters.species.includes(species)}
                  onClick={() => toggleArrayValue("species", species)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
              Veiðiaðferð
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {BAIT_TYPES.filter((bait) => bait !== "óstaðfest").map((bait) => (
                <ToggleChip
                  key={bait}
                  label={bait}
                  active={filters.baitTypes.includes(bait)}
                  onClick={() => toggleArrayValue("baitTypes", bait)}
                />
              ))}
            </div>
          </section>

          <section>
            <label className="rounded-[1.4rem] border border-ink/10 bg-white p-4 shadow-sm">
              <span className="text-sm font-semibold text-ink">Veiðikortið</span>
              <select
                value={filters.includedInVeidikortid}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    includedInVeidikortid:
                      event.target.value as DiscoveryFilters["includedInVeidikortid"],
                  })
                }
                className="mt-3 w-full rounded-xl border border-ink/10 bg-mist/55 px-3 py-2 text-sm text-ink outline-none"
              >
                <option value="all">Skiptir ekki máli</option>
                <option value="yes">Innifalið</option>
                <option value="no">Ekki innifalið</option>
              </select>
            </label>
          </section>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-full border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm"
          >
            Endurstilla
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-[#12343B] px-4 py-3 text-sm font-semibold text-white shadow-sm"
          >
            Sýna niðurstöður
          </button>
        </div>
      </div>
    </div>
  );
}
