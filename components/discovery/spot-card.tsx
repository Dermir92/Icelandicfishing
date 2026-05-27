import Link from "next/link";
import { ArrowUpRight, Fish, MapPin, Navigation, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatSeasonText, getKnownValues, getTextOrNull, isKnownValue } from "@/lib/format";
import { getSpotVisualClasses } from "@/lib/spot-visuals";
import type { FishingSpot } from "@/types/spot";

export function SpotCard({
  spot,
  selected = false,
  onSelect,
  compact = false,
  layout = "grid",
}: {
  spot: FishingSpot;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
  layout?: "grid" | "list";
}) {
  const visual = getSpotVisualClasses(spot);
  const visibleSpecies = getKnownValues(spot.fishSpecies);
  const visibleBaits = getKnownValues(spot.allowedBaits);
  const visibleRegion = getTextOrNull(spot.region);
  const visibleWaterType = getTextOrNull(spot.waterType);
  const visiblePermitModel = getTextOrNull(spot.permitModel);
  const isList = layout === "list";

  return (
    <Link
      href={`/spots/${spot.slug}`}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      className={cn(
        "group block overflow-hidden rounded-[1.6rem] border border-ink/8 bg-white outline-none transition",
        selected
          ? "border-[#12343B]/35 shadow-[0_18px_40px_rgba(18,40,45,0.09)] ring-1 ring-[#12343B]/10"
          : "hover:-translate-y-0.5 hover:border-ink/12 hover:shadow-[0_18px_40px_rgba(18,40,45,0.08)]",
        "focus-visible:ring-2 focus-visible:ring-[#12343B]/28 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      )}
    >
      <article className={cn(isList && "grid gap-0 md:grid-cols-[16rem_minmax(0,1fr)]")}>
        <div className={cn("relative overflow-hidden", compact ? "h-44" : "h-56", isList && "md:h-full", visual.frame)}>
          {spot.imageUrl ? (
            <img
              src={spot.imageUrl}
              alt={spot.imageAlt ?? spot.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
          <div className={cn("absolute inset-0", visual.overlay)} />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {visibleRegion ? <Badge tone="light">{visibleRegion}</Badge> : null}
            {visibleWaterType ? <Badge tone="light">{visibleWaterType}</Badge> : null}
            {spot.includedInVeidikortid ? <Badge tone="light">Veiðikortið</Badge> : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            {visiblePermitModel ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                {visiblePermitModel}
              </p>
            ) : null}
            <div className="mt-2 flex items-end justify-between gap-3">
              <h3 className="text-[1.45rem] font-semibold tracking-tight">{spot.name}</h3>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/12 backdrop-blur">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <p className="overflow-hidden text-[15px] leading-6 text-ink/68 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {spot.shortDescription}
          </p>

          <div className={cn("grid gap-3 text-sm text-ink/64", isList ? "sm:grid-cols-2 xl:grid-cols-4" : "grid-cols-2")}>
            <div className="rounded-[1.15rem] bg-mist/62 p-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-moss/70">
                <Fish className="h-3.5 w-3.5" />
                Fisktegundir
              </div>
              <p className="mt-2 text-sm font-medium text-ink">
                {visibleSpecies.length ? visibleSpecies.join(", ") : "Sjá nánar á staðasíðu"}
              </p>
            </div>
            <div className="rounded-[1.15rem] bg-mist/62 p-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-moss/70">
                <MapPin className="h-3.5 w-3.5" />
                Staða á korti
              </div>
              <p className="mt-2 text-sm font-medium text-ink">
                {spot.integrationMeta?.isMappable ? "Sýnt á korti" : "Birtist í lista"}
              </p>
            </div>
            <div className="rounded-[1.15rem] bg-mist/62 p-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-moss/70">
                <Navigation className="h-3.5 w-3.5" />
                Veiðitímabil
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{formatSeasonText(spot)}</p>
            </div>
            <div className="rounded-[1.15rem] bg-mist/62 p-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-moss/70">
                <Ticket className="h-3.5 w-3.5" />
                Heimild
              </div>
              <p className="mt-2 text-sm font-medium text-ink">
                {isKnownValue(spot.sourceName) ? spot.sourceName : "Nánar á staðasíðu"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {visibleBaits.slice(0, compact ? 2 : 3).map((bait) => (
                <span
                  key={bait}
                  className="rounded-full border border-ink/8 bg-fog px-3 py-1.5 text-[11px] font-medium text-ink/60"
                >
                  {bait}
                </span>
              ))}
            </div>

            <span className="text-sm font-semibold text-[#12343B]">Skoða stað</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
