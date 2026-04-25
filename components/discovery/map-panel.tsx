"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Compass, MapPin, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getKnownValues, getTextOrNull } from "@/lib/format";
import type { FishingSpot } from "@/types/spot";

const MapView = dynamic(
  () => import("@/components/discovery/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-[2rem] bg-[#123F63] text-sm font-medium text-white/78">
        Hleð korti af Íslandi...
      </div>
    ),
  },
);

function SelectedPreview({ spot }: { spot: FishingSpot | null }) {
  if (!spot) {
    return (
      <div className="max-w-[22rem] rounded-[1.35rem] border border-white/12 bg-[#17373D]/72 px-4 py-3.5 text-white shadow-[0_16px_26px_rgba(6,28,33,0.12)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/78">
            <Compass className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/52">
              Kortayfirlit
            </p>
            <p className="mt-1.5 text-[15px] font-semibold tracking-tight text-white">
              Veldu stað á kortinu
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-white/66">
              Smelltu á punkt til að sjá upplýsingar, reglur og heimild.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const region = getTextOrNull(spot.region);
  const waterType = getTextOrNull(spot.waterType);
  const permitModel = getTextOrNull(spot.permitModel);
  const tags = [...getKnownValues(spot.fishSpecies).slice(0, 2), ...(permitModel ? [permitModel] : [])].slice(0, 3);

  return (
    <div className="max-w-[22rem] rounded-[1.35rem] border border-white/12 bg-white/95 px-4 py-3.5 text-ink shadow-[0_18px_30px_rgba(6,28,33,0.14)] backdrop-blur-xl">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-ink/56">
          <MapPin className="h-3.5 w-3.5 text-glacier" />
          {region ? <span>{region}</span> : <span>{spot.sourceName}</span>}
          {waterType ? (
            <>
              <span className="text-ink/26">•</span>
              <span>{waterType}</span>
            </>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <p className="text-[1.06rem] font-semibold tracking-tight text-ink">{spot.name}</p>
          <p className="text-[13px] leading-5 text-ink/68">{spot.shortDescription}</p>
        </div>

        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : null}

        <div className="pt-0.5">
          <Link
            href={`/spots/${spot.slug}`}
            className="inline-flex items-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Skoða stað
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MapPanel({
  spots,
  mappableSpotCount,
  hiddenSpotsCount,
  selectedSpot,
  selectedSpotId,
  onSelectSpot,
  onOpenFilters,
}: {
  spots: FishingSpot[];
  mappableSpotCount: number;
  hiddenSpotsCount: number;
  selectedSpot: FishingSpot | null;
  selectedSpotId: string | null;
  onSelectSpot: (id: string) => void;
  onOpenFilters: () => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-sm text-ink/60">
          <Badge>Kort</Badge>
          <p>
            {mappableSpotCount} staðir á korti
            {hiddenSpotsCount ? ` · ${hiddenSpotsCount} birtast aðeins í lista` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_10px_24px_rgba(18,40,45,0.05)] transition hover:border-ink/18 xl:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Síur
        </button>
      </div>

      <div className="relative h-[min(82svh,64rem)] min-h-[38rem] overflow-hidden rounded-[2.15rem] bg-[#103D60] shadow-[0_30px_72px_rgba(18,40,45,0.12)] lg:h-[min(86svh,68rem)]">
        <MapView spots={spots} selectedSpotId={selectedSpotId} onSelectSpot={onSelectSpot} />

        {!mappableSpotCount ? (
          <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-center px-4">
            <div className="pointer-events-auto max-w-md rounded-[1.1rem] bg-[#17373D]/82 px-4 py-3 text-sm text-white/76 shadow-[0_18px_32px_rgba(6,28,33,0.12)] backdrop-blur-xl">
              Engir staðir með staðfest hnit passa við valdar síur.
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute bottom-5 left-5 z-20 hidden xl:block">
          <div className="pointer-events-auto">
            <SelectedPreview spot={selectedSpot} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 xl:hidden">
          <div className="pointer-events-auto">
            <SelectedPreview spot={selectedSpot} />
          </div>
        </div>
      </div>
    </section>
  );
}
