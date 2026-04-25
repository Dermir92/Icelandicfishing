"use client";

import Link from "next/link";
import { ArrowUpRight, Fish, MapPin } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatSeasonText } from "@/lib/format";
import type { FishingSpot } from "@/types/spot";

export function SpotListItem({
  spot,
  selected = false,
  onSelect,
  prominent = false,
}: {
  spot: FishingSpot;
  selected?: boolean;
  onSelect?: () => void;
  prominent?: boolean;
}) {
  return (
    <Link
      href={`/spots/${spot.slug}`}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      className={cn(
        "group block rounded-[1.35rem] border transition outline-none",
        prominent ? "p-4" : "p-4",
        selected
          ? "border-[#12343B]/18 bg-[#F7F2EA] shadow-[0_18px_34px_rgba(18,40,45,0.08)]"
          : "border-ink/8 bg-[#fffdfa] hover:border-ink/14 hover:bg-white hover:shadow-[0_14px_28px_rgba(18,40,45,0.05)]",
        "focus-visible:ring-2 focus-visible:ring-[#12343B]/24 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-moss/72">
            <MapPin className="h-3.5 w-3.5" />
            <span>{spot.region}</span>
            <span className="text-ink/30">·</span>
            <span>{spot.waterType}</span>
          </div>
          <h3
            className={cn(
              "mt-2 truncate font-semibold tracking-tight text-ink",
              prominent ? "text-[1.02rem]" : "text-[15px]",
            )}
          >
            {spot.name}
          </h3>
          <p
            className={cn(
              "mt-1.5 text-ink/64",
              prominent ? "text-sm leading-6" : "line-clamp-2 text-[13px] leading-5.5",
            )}
          >
            {spot.shortDescription}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border transition",
            prominent ? "h-9 w-9" : "h-8.5 w-8.5",
            selected
              ? "border-[#12343B]/18 bg-white/85 text-[#12343B]"
              : "border-ink/8 bg-fog text-ink/56 group-hover:text-ink/72",
          )}
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink/6 pt-3">
        <div className="min-w-0 text-[11px] text-ink/56">
          <div className="flex min-w-0 items-center gap-2">
            <Fish className="h-3.5 w-3.5 text-glacier" />
            <span className="truncate">{spot.fishSpecies.join(", ")}</span>
          </div>
          <p className="mt-1 truncate">{formatSeasonText(spot)}</p>
        </div>
        <span className="rounded-full border border-ink/8 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/60">
          {spot.permitModel}
        </span>
      </div>
    </Link>
  );
}
