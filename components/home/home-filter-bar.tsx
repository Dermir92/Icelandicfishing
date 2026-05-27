"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

type Option = {
  label: string;
  value: string;
};

const fishOptions: Option[] = [
  { label: "Bleikja", value: "bleikja" },
  { label: "Urriði", value: "urriði" },
  { label: "Lax", value: "lax" },
  { label: "Sjóbirtingur", value: "sjóbirtingur" },
];

const baitOptions: Option[] = [
  { label: "Fluga", value: "fluga" },
  { label: "Spúnn", value: "spúnn" },
  { label: "Maðkur", value: "maðkur" },
];

const regionOptions: Option[] = [
  { label: "Höfuðborgarsvæðið", value: "Höfuðborgarsvæðið" },
  { label: "Suðurland", value: "Suðurland" },
  { label: "Vesturland", value: "Vesturland" },
  { label: "Norðurland", value: "Norðurland" },
  { label: "Austurland", value: "Austurland" },
  { label: "Vestfirðir", value: "Vestfirðir" },
];

const permitOptions: Option[] = [
  { label: "Veiðikortið", value: "veidikortid" },
  { label: "Veiða.is", value: "veida-is" },
  { label: "Stök leyfi", value: "stakt-leyfi" },
  { label: "Óstaðfest leyfi", value: "ostadfest" },
];

function MultiSelect({
  label,
  placeholder,
  options,
  selectedValues,
  onToggle,
}: {
  label: string;
  placeholder: string;
  options: Option[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  return (
    <div ref={containerRef} className="relative z-[70] grid gap-2">
      <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white">
        {label}
      </span>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-[1rem] border border-white/18 bg-white/12 px-4 text-left text-sm font-semibold text-white shadow-[0_18px_36px_rgba(5,19,27,0.18)] backdrop-blur transition hover:bg-white/16"
      >
        <span className="truncate text-white">
          {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[80] w-full overflow-hidden rounded-[1rem] border border-white/12 bg-[#0D3550] shadow-[0_24px_48px_rgba(5,19,27,0.28)]">
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const active = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className={`flex w-full items-center justify-between rounded-[0.8rem] px-3 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? "bg-white/16 text-white"
                      : "bg-transparent text-white/95 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  {active ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HomeFilterBar() {
  const router = useRouter();
  const [species, setSpecies] = useState<string[]>([]);
  const [bait, setBait] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [veidikortid, setVeidikortid] = useState<string[]>([]);

  const toggleValue = (values: string[], nextValue: string, setter: (values: string[]) => void) => {
    setter(values.includes(nextValue) ? values.filter((value) => value !== nextValue) : [...values, nextValue]);
  };

  const href = useMemo(() => {
    const params = new URLSearchParams();

    species.forEach((value) => params.append("species", value));
    bait.forEach((value) => params.append("bait", value));
    region.forEach((value) => params.append("region", value));

    veidikortid.forEach((value) => {
      if (value === "veidikortid") params.append("source", "Veiðikortið");
      if (value === "veida-is") params.append("source", "veida.is");
      if (value === "stakt-leyfi") params.append("permitModel", "Stakt leyfi");
      if (value === "ostadfest") params.append("permitModel", "Óstaðfest");
    });

    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
  }, [bait, region, species, veidikortid]);

  return (
    <section className="relative z-[60] mt-14 rounded-[1.8rem] bg-[#0D3550] px-5 py-5 shadow-[0_28px_60px_rgba(5,19,27,0.16)] sm:px-6 lg:px-7">
      <div className="grid gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-end">
        <MultiSelect
          label="Hvaða fisktegundir?"
          placeholder="Veldu fisktegundir"
          options={fishOptions}
          selectedValues={species}
          onToggle={(value) => toggleValue(species, value, setSpecies)}
        />
        <MultiSelect
          label="Hvernig viltu veiða?"
          placeholder="Veldu veiðiaðferð"
          options={baitOptions}
          selectedValues={bait}
          onToggle={(value) => toggleValue(bait, value, setBait)}
        />
        <MultiSelect
          label="Hvar?"
          placeholder="Veldu landshluta"
          options={regionOptions}
          selectedValues={region}
          onToggle={(value) => toggleValue(region, value, setRegion)}
        />
        <MultiSelect
          label="Veiðileyfi"
          placeholder="Veldu söluaðila eða leyfi"
          options={permitOptions}
          selectedValues={veidikortid}
          onToggle={(value) => toggleValue(veidikortid, value, setVeidikortid)}
        />

        <button
          type="button"
          onClick={() => router.push(href)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] bg-white px-5 text-sm font-semibold text-[#0D3550] shadow-[0_18px_36px_rgba(5,19,27,0.18)] transition hover:bg-white/92"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Skoða í yfirliti
        </button>
      </div>
    </section>
  );
}
