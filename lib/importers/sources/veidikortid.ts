import { fetchJson } from "../fetch";
import {
  extractLabeledValue,
  inferAllowedBaits,
  inferConfidence,
  inferRegion,
  inferSpecies,
  inferWaterType,
  parseCoordinatePair,
  stripHtml,
  toExcerpt,
} from "../normalize";
import type { ImportedSpotRecord } from "../../../types/imported-spot";

interface VeidikortidPageResponse {
  id?: number;
  featured_media?: number;
  content: {
    rendered: string;
  };
}

interface VeidikortidMediaResponse {
  source_url?: string;
  alt_text?: string;
}

const VEIDIKORTID_PAGE_API_URL = "https://veidikortid.is/wp-json/wp/v2/pages/2974";

interface VeidikortidBlock {
  name: string;
  slug: string;
  sourceUrl: string;
  descriptionHtml: string;
  imageUrl: string | null;
  imageAlt: string | null;
}

interface VeidikortidDetailData {
  imageUrl: string | null;
  imageAlt: string | null;
  shortDescription: string | null;
  seasonText: string | null;
  dailyHoursText: string | null;
  rulesText: string | null;
  practicalInfoText: string | null;
  latitude: number | null;
  longitude: number | null;
  region: ImportedSpotRecord["region"];
  waterType: ImportedSpotRecord["waterType"];
  species: ImportedSpotRecord["species"];
  allowedBaits: ImportedSpotRecord["allowedBaits"];
}

const mediaCache = new Map<number, Promise<VeidikortidMediaResponse | null>>();

function extractBlocks(html: string): VeidikortidBlock[] {
  const matches = html.matchAll(
    /<div class="page-box\s+page-box--block">[\s\S]*?(?:<a class="page-box__picture"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<\/a>)?[\s\S]*?<h2 class="page-box__title"><a href="([^"]+)">([\s\S]*?)<\/a><\/h2>[\s\S]*?<p class="page-box__text">([\s\S]*?)<\/p>[\s\S]*?<\/div>\s*<\/div>/gi,
  );

  const blocks: VeidikortidBlock[] = [];

  for (const match of matches) {
    const imageUrl = match[1]?.trim() || null;
    const imageAlt = stripHtml(match[2] ?? "") || null;
    const href = match[3]?.trim();
    const name = stripHtml(match[4] ?? "");
    const descriptionHtml = match[5]?.trim() ?? "";

    if (!href || !name) {
      continue;
    }

    const slug = href
      .replace(/^https?:\/\/[^/]+\//, "")
      .split("/")
      .filter(Boolean)
      .at(-1);

    if (!slug) {
      continue;
    }

    blocks.push({
      name,
      slug,
      sourceUrl: href,
      descriptionHtml,
      imageUrl,
      imageAlt,
    });
  }

  return blocks;
}

function collapseSectionText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n\n");

  return normalized || null;
}

function extractSectionText(html: string, headings: string[]): string | null {
  const headingRegex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const matches: Array<{ title: string; start: number; end: number }> = [];

  for (const match of html.matchAll(headingRegex)) {
    const rawTitle = stripHtml(match[2] ?? "");
    const start = match.index ?? 0;
    matches.push({
      title: rawTitle,
      start,
      end: start + match[0].length,
    });
  }

  const wanted = matches.find((entry) =>
    headings.some((heading) => entry.title.localeCompare(heading, "is", { sensitivity: "base" }) === 0),
  );

  if (!wanted) {
    return null;
  }

  const next = matches.find((entry) => entry.start > wanted.start);
  const sectionHtml = html.slice(wanted.end, next?.start ?? html.length);

  return collapseSectionText(stripHtml(sectionHtml));
}

function extractMapCoordinates(html: string): { latitude: number; longitude: number } | null {
  const weatherMatch = html.match(/data-latitude="([^"]+)"[\s\S]*?data-longitude="([^"]+)"/i);
  if (weatherMatch) {
    return {
      latitude: Number(weatherMatch[1]),
      longitude: Number(weatherMatch[2]),
    };
  }

  const addressMatch = html.match(/address\\u0026quot;:\\u0026quot;([0-9.-]+),\s*([0-9.-]+)/i);
  if (addressMatch) {
    return {
      latitude: Number(addressMatch[1]),
      longitude: Number(addressMatch[2]),
    };
  }

  return null;
}

async function fetchDetailPage(slug: string): Promise<VeidikortidPageResponse | null> {
  const detailPages = await fetchJson<VeidikortidPageResponse[]>(
    `https://veidikortid.is/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}`,
  );

  return detailPages[0] ?? null;
}

async function fetchMedia(mediaId: number): Promise<VeidikortidMediaResponse | null> {
  if (!mediaCache.has(mediaId)) {
    mediaCache.set(
      mediaId,
      fetchJson<VeidikortidMediaResponse>(`https://veidikortid.is/wp-json/wp/v2/media/${mediaId}`).catch(
        () => null,
      ),
    );
  }

  return mediaCache.get(mediaId) ?? null;
}

async function enrichBlockFromDetail(block: VeidikortidBlock): Promise<VeidikortidDetailData> {
  const detailPage = await fetchDetailPage(block.slug);
  const listingDescriptionText = stripHtml(block.descriptionHtml);

  if (!detailPage) {
    return {
      imageUrl: block.imageUrl,
      imageAlt: block.imageAlt ?? block.name,
      shortDescription: toExcerpt(listingDescriptionText),
      seasonText: extractLabeledValue(listingDescriptionText, ["Veiðitímabil", "Tímabil"]),
      dailyHoursText: extractLabeledValue(listingDescriptionText, ["Daglegur veiðitími", "Veiðitími"]),
      rulesText: null,
      practicalInfoText: null,
      latitude: parseCoordinatePair(listingDescriptionText)?.latitude ?? null,
      longitude: parseCoordinatePair(listingDescriptionText)?.longitude ?? null,
      region: inferRegion(block.name, listingDescriptionText),
      waterType: inferWaterType(block.name, listingDescriptionText),
      species: inferSpecies(block.name, listingDescriptionText),
      allowedBaits: inferAllowedBaits(listingDescriptionText),
    };
  }

  const detailHtml = detailPage.content.rendered;
  const detailText = stripHtml(detailHtml);
  const media = detailPage.featured_media ? await fetchMedia(detailPage.featured_media) : null;
  const coordinatePair = parseCoordinatePair(detailText) ?? extractMapCoordinates(detailHtml);
  const agnText = extractSectionText(detailHtml, ["Agn"]);
  const rulesText = collapseSectionText(
    [extractSectionText(detailHtml, ["Reglur"]), extractSectionText(detailHtml, ["Verndunarátak"])]
      .filter(Boolean)
      .join("\n\n"),
  );
  const practicalInfoText = collapseSectionText(
    [
      extractSectionText(detailHtml, ["Leiðarlýsing og fjarlægð frá Reykjavík og næsta bæjarfélagi"]),
      extractSectionText(detailHtml, ["Upplýsingar um vatnið"]),
      extractSectionText(detailHtml, ["Veiðisvæðið"]),
      extractSectionText(detailHtml, ["Gisting"]),
      extractSectionText(detailHtml, ["Annað"]),
      extractSectionText(detailHtml, ["Veiðivörður"]),
      extractSectionText(detailHtml, ["Veiðivörður / umsjónarmaður á staðnum"]),
    ]
      .filter(Boolean)
      .join("\n\n"),
  );

  const shortDescription =
    toExcerpt(extractSectionText(detailHtml, ["Upplýsingar um vatnið"])) ??
    toExcerpt(extractSectionText(detailHtml, ["Veiðisvæðið"])) ??
    toExcerpt(detailPage.id ? stripHtml(detailHtml) : listingDescriptionText);

  return {
    imageUrl: media?.source_url ?? block.imageUrl,
    imageAlt: media?.alt_text?.trim() || block.imageAlt || block.name,
    shortDescription,
    seasonText: extractLabeledValue(detailText, ["Veiðitímabil", "Tímabil"]),
    dailyHoursText: extractLabeledValue(detailText, ["Daglegur veiðitími", "Veiðitími"]),
    rulesText,
    practicalInfoText,
    latitude: coordinatePair?.latitude ?? null,
    longitude: coordinatePair?.longitude ?? null,
    region: inferRegion(block.name, detailText, listingDescriptionText),
    waterType: inferWaterType(block.name, detailText, listingDescriptionText),
    species: inferSpecies(block.name, detailText, listingDescriptionText),
    allowedBaits: inferAllowedBaits(block.name, agnText, rulesText, detailText, listingDescriptionText),
  };
}

export async function importVeidikortidListings(scrapedAt: string): Promise<ImportedSpotRecord[]> {
  const page = await fetchJson<VeidikortidPageResponse>(VEIDIKORTID_PAGE_API_URL);
  const blocks = extractBlocks(page.content.rendered);

  const enrichedBlocks = await Promise.all(
    blocks.map(async (block) => ({
      block,
      detail: await enrichBlockFromDetail(block),
    })),
  );

  return enrichedBlocks.map(({ block, detail }) => {
    const dataConfidence = inferConfidence({
      shortDescription: detail.shortDescription,
      region: detail.region,
      waterType: detail.waterType,
      species: detail.species,
      latitude: detail.latitude,
      longitude: detail.longitude,
      seasonText: detail.seasonText,
      dailyHoursText: detail.dailyHoursText,
      rulesText: detail.rulesText,
      practicalInfoText: detail.practicalInfoText,
    });

    return {
      id: `veidikortid:${block.slug}`,
      sourceName: "Veiðikortið",
      sourceUrl: block.sourceUrl,
      name: block.name,
      slug: block.slug,
      sourceCategory: "veiðisvæði",
      imageUrl: detail.imageUrl,
      imageAlt: detail.imageAlt,
      imageSource: detail.imageUrl ? "Veiðikortið page image" : null,
      region: detail.region,
      waterType: detail.waterType,
      species: detail.species,
      allowedBaits: detail.allowedBaits,
      permitModel: "Veiðikortið",
      shortDescription: detail.shortDescription,
      priceText: null,
      seasonText: detail.seasonText,
      dailyHoursText: detail.dailyHoursText,
      rulesText: detail.rulesText,
      practicalInfoText: detail.practicalInfoText,
      latitude: detail.latitude,
      longitude: detail.longitude,
      dataConfidence,
      scrapedAt,
    } satisfies ImportedSpotRecord;
  });
}
