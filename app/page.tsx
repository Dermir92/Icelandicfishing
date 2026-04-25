import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SpotCard } from "@/components/discovery/spot-card";
import { HomeFilterBar } from "@/components/home/home-filter-bar";
import { Badge } from "@/components/ui/badge";
import { discoverSpots } from "@/data/discover-spots";

const homepageText = "#0D3550";

export default function HomePage() {
  const featuredSpots = discoverSpots.filter((spot) => spot.imageUrl).slice(0, 4);

  return (
    <main className="bg-white pb-20">
      <section className="relative overflow-visible px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(173,198,203,0.1),transparent_18%),radial-gradient(circle_at_82%_10%,rgba(173,198,203,0.08),transparent_16%)]" />

        <div className="relative mx-auto w-full max-w-[128rem]">
          <div className="max-w-5xl">
            <Badge>Veiðistaðir á Íslandi</Badge>
            <p
              className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: `${homepageText}B8` }}
            >
              Veiði á Íslandi, sett fram með skýrum hætti
            </p>
            <h1
              className="mt-4 max-w-6xl text-[3.25rem] font-semibold leading-[0.93] tracking-tight sm:text-[4.65rem] xl:text-[6rem]"
              style={{ color: homepageText }}
            >
              Hvar vilt þú veiða?
            </h1>
            <p className="mt-6 max-w-3xl text-[17px] leading-8" style={{ color: `${homepageText}CC` }}>
              Veiðistaðir sameinar Íslandskort, síur og hagnýtar upplýsingar svo þú getir ákveðið hvert
              þú átt að fara án þess að hoppa á milli dreifðra heimilda.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(18,40,45,0.12)] transition hover:bg-ink/92"
              >
                Opna Íslandsyfirlit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-3.5 text-sm font-semibold transition hover:border-ink/18"
                style={{ color: `${homepageText}D9` }}
              >
                Hvernig þetta virkar
              </Link>
            </div>
          </div>

          <HomeFilterBar />
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
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
                Skoðaðu staði beint af forsíðunni.
              </h2>
              <p className="mt-2 text-[15px] leading-7" style={{ color: `${homepageText}C2` }}>
                Hér eru nokkrir staðir úr gagnasafninu svo þú getir byrjað strax að bera saman svæði,
                vatnategundir og fisktegundir.
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
