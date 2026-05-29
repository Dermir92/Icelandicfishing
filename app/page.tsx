import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SpotCard } from "@/components/discovery/spot-card";
import { HomeFilterBar } from "@/components/home/home-filter-bar";
import { HomeSearchBar } from "@/components/home/home-search-bar";
import { Badge } from "@/components/ui/badge";
import { discoverSpots } from "@/data/discover-spots";
import { getTopSpotIds } from "@/lib/redis";

const homepageText = "#0D3550";

export default async function HomePage() {
  // Try to get the most-clicked spots; fall back to image spots if Redis is empty
  const topIds = await getTopSpotIds(4).catch(() => []);
  const topSpots = topIds
    .map((id) => discoverSpots.find((s) => s.id === id))
    .filter(Boolean) as typeof discoverSpots;

  const featuredSpots =
    topSpots.length >= 4
      ? topSpots
      : discoverSpots.filter((spot) => spot.imageUrl).slice(0, 4);

  const spotSuggestions = discoverSpots.map((s) => ({ name: s.name, slug: s.slug }));

  return (
    <main className="bg-white pb-20">
      <section
        className="relative z-20 overflow-visible bg-cover bg-center px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-24"
        style={{ backgroundImage: "url('/photo-header.jpg')" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/50" />

        <div className="relative mx-auto w-full max-w-[128rem]">
          <div className="max-w-5xl">
            <Badge tone="light">Veiðistaðir á Íslandi</Badge>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              Veiði á Íslandi, sett fram með skýrum hætti
            </p>
            <h1 className="mt-4 max-w-6xl text-[3.25rem] font-semibold leading-[0.93] tracking-tight text-white sm:text-[4.65rem] xl:text-[6rem]">
              Hvar vilt þú veiða?
            </h1>
            <p className="mt-6 max-w-3xl text-[17px] leading-8 text-white/80">
              Veiðistaðir sameinar Íslandskort, síur og hagnýtar upplýsingar svo þú getir ákveðið hvert
              þú átt að fara án þess að hoppa á milli mismunandi vefsíða.
            </p>

            <HomeSearchBar spots={spotSuggestions} />

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-ink shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition hover:bg-white/90"
              >
                Opna Íslandskort
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Hvernig virkar þetta?
              </Link>
            </div>
          </div>

          <HomeFilterBar />
        </div>
      </section>

      <section className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-[128rem] space-y-6">
          <div className="flex flex-col gap-3 border-b border-ink/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: `${homepageText}A8` }}
              >
                Veiðistaðir
              </p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-tight" style={{ color: homepageText }}>
                Vinsælir veiðistaðir
              </h2>
              <p className="mt-2 text-[15px] leading-7" style={{ color: `${homepageText}C2` }}>
                Hér sérðu nokkra staði sem gefa góða mynd af úrvalinu. Opnaðu staðasíðu eða farðu í
                yfirlitið til að bera saman fleiri kosti.
              </p>
            </div>

            <Link
              href="/discover"
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold transition hover:border-ink/18 hover:bg-[#f8fbfc]"
              style={{ color: homepageText }}
            >
              Sjá allt í yfirliti
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {featuredSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
