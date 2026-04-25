import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  Fish,
  MapPin,
  Navigation,
  ScrollText,
  Shield,
  Ticket,
  Users,
} from "lucide-react";

import { SpotCard } from "@/components/discovery/spot-card";
import { Badge } from "@/components/ui/badge";
import { getNearbyDiscoverSpots, getDiscoverSpotBySlug } from "@/data/discover-spots";
import { getNearbySpots, getSpotBySlug } from "@/data/spots";
import {
  formatConfidenceLabel,
  formatDataQualityHint,
  formatFamilyFriendly,
  formatSeasonText,
  getKnownValues,
  getSeasonTextOrNull,
  getTextOrNull,
} from "@/lib/format";
import { getGoogleMapsUrl } from "@/lib/navigation";
import { getSpotVisualClasses } from "@/lib/spot-visuals";

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = getDiscoverSpotBySlug(slug) ?? getSpotBySlug(slug);

  if (!spot) {
    notFound();
  }

  const nearby =
    spot.integrationMeta?.dataset === "imported" ? getNearbyDiscoverSpots(spot) : getNearbySpots(spot);
  const visual = getSpotVisualClasses(spot);
  const googleMapsUrl = getGoogleMapsUrl(spot);
  const visibleSpecies = getKnownValues(spot.fishSpecies);
  const visibleBaits = getKnownValues(spot.allowedBaits);
  const visibleRegion = getTextOrNull(spot.region);
  const visibleWaterType = getTextOrNull(spot.waterType);
  const visiblePermitModel = getTextOrNull(spot.permitModel);
  const practicalInfoText = spot.integrationMeta?.practicalInfoText ?? null;
  const rulesText = spot.integrationMeta?.rulesText ?? null;
  const dailyHoursText = spot.integrationMeta?.dailyHoursText ?? null;
  const seasonText = getSeasonTextOrNull(spot);

  return (
    <main className="mx-auto flex w-full max-w-[88rem] flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Link
        href="/discover"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/72 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Til baka í yfirlit
      </Link>

      <section className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
        <article className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 shadow-panel backdrop-blur">
          <div className={`relative h-[26rem] overflow-hidden sm:h-[32rem] ${visual.frame}`}>
            {spot.imageUrl ? (
              <img
                src={spot.imageUrl}
                alt={spot.imageAlt ?? spot.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className={`absolute inset-0 ${visual.overlay}`} />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <div className="flex flex-wrap gap-2">
                {visibleRegion ? <Badge tone="light">{visibleRegion}</Badge> : null}
                {visibleWaterType ? <Badge tone="light">{visibleWaterType}</Badge> : null}
                {visiblePermitModel ? <Badge tone="light">{visiblePermitModel}</Badge> : null}
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                {spot.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
                {spot.shortDescription}
              </p>
            </div>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/60 bg-[#12343B] p-6 text-white shadow-panel sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">Í hnotskurn</p>
          <div className="mt-5 space-y-3">
            {visibleRegion ? (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-sm font-semibold">{visibleRegion}</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">Staðsetning á Íslandi</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <Compass className="mt-1 h-4 w-4 text-white/60" />
                <div>
                  <p className="text-sm font-semibold">{formatSeasonText(spot)}</p>
                  <p className="mt-1 text-sm text-white/65">Veiðitímabil</p>
                </div>
              </div>
            </div>

            {visiblePermitModel ? (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <Ticket className="mt-1 h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-sm font-semibold">{visiblePermitModel}</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      {spot.includedInVeidikortid
                        ? "Innifalið í Veiðikortinu."
                        : "Krefst staks leyfis eða sölu hjá uppruna."}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-1 h-4 w-4 text-white/60" />
                <div>
                  <p className="text-sm font-semibold">{formatConfidenceLabel(spot.dataConfidence)}</p>
                  <p className="mt-1 text-sm leading-6 text-white/65">
                    {formatDataQualityHint(spot.dataConfidence)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {googleMapsUrl ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between rounded-[1.35rem] bg-white px-4 py-4 text-sm font-semibold text-ink transition hover:bg-fog"
              >
                <span className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-glacier" />
                  Opna í Google Maps
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink/50" />
              </a>
            ) : (
              <div className="rounded-[1.35rem] border border-white/12 bg-white/5 px-4 py-4 text-sm text-white/68">
                Staðsetning á korti kemur ekki fram í núverandi gögnum.
              </div>
            )}

            <a
              href={spot.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-between rounded-[1.35rem] border border-white/12 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <span>Opna hjá {spot.sourceName}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <article className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur sm:p-8">
          <h2 className="text-xl font-semibold text-ink">Helstu upplýsingar</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.35rem] bg-mist/55 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Fish className="h-4 w-4 text-glacier" />
                Fisktegundir
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {visibleSpecies.length ? (
                  visibleSpecies.map((species) => <Badge key={species}>{species}</Badge>)
                ) : (
                  <p className="text-sm text-ink/68">Tegundir koma ekki fram í núverandi gögnum.</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.35rem] bg-mist/55 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <ScrollText className="h-4 w-4 text-glacier" />
                Veiðiaðferð / Agn
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {visibleBaits.length ? (
                  visibleBaits.map((bait) => <Badge key={bait}>{bait}</Badge>)
                ) : (
                  <p className="text-sm text-ink/68">Aðferð eða agn kemur ekki fram í núverandi gögnum.</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.35rem] bg-mist/55 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Users className="h-4 w-4 text-glacier" />
                Fjölskylduvænt
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/72">
                {formatFamilyFriendly(spot.familyFriendly)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-xl font-semibold text-ink">Praktísk atriði</h2>
              <div className="mt-5 space-y-5 text-sm leading-7 text-ink/74">
                {visibleWaterType ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
                      Vatnategund
                    </p>
                    <p className="mt-2">{visibleWaterType}</p>
                  </div>
                ) : null}

                {seasonText ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
                      Veiðitímabil
                    </p>
                    <p className="mt-2">{seasonText}</p>
                  </div>
                ) : null}

                {dailyHoursText ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
                      Veiðitími
                    </p>
                    <p className="mt-2">{dailyHoursText}</p>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
                    Heimild
                  </p>
                  <p className="mt-2">{spot.sourceName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {practicalInfoText ? (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
                    Hagnýtar upplýsingar
                  </p>
                  <div className="mt-4 rounded-[1.25rem] border border-ink/10 bg-fog px-4 py-4">
                    <p className="text-sm leading-6 text-ink/74">{practicalInfoText}</p>
                  </div>
                </div>
              ) : null}

              {rulesText ? (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
                    Reglur
                  </p>
                  <div className="mt-4 rounded-[1.25rem] border border-ink/10 bg-fog px-4 py-4">
                    <p className="text-sm leading-6 text-ink/74">{rulesText}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss/72">
                    Gæði gagna
                  </p>
                  <div className="mt-4 rounded-[1.25rem] border border-ink/10 bg-fog px-4 py-4">
                    <p className="text-sm leading-6 text-ink/74">
                      {formatDataQualityHint(spot.dataConfidence)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-moss/70">
            Staðir í nágrenninu
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Fleiri staðir sem vert er að skoða
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nearby.map((nearbySpot) => (
            <SpotCard key={nearbySpot.id} spot={nearbySpot} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
