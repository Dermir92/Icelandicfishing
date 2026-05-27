import { fetchJson } from "../fetch";
import {
  buildListingDescription,
  cleanDailyHoursText,
  cleanSeasonText,
  extractLabeledValue,
  inferAllowedBaits,
  inferConfidence,
  inferRegion,
  inferSpecies,
  inferWaterType,
  stripHtml,
} from "../normalize";
import type { ImportedSpotRecord } from "../../../types/imported-spot";

interface VeidaCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description: string;
  permalink: string;
  image?: {
    src?: string;
    thumbnail?: string;
    alt?: string;
    name?: string;
  } | null;
}

const VEIDA_CATEGORIES_URL = "https://veida.is/wp-json/wc/store/products/categories";
const ROOT_CATEGORY_SLUGS = ["laxveidi", "silungsveidi"] as const;
const EXCLUDED_VEIDA_CHILD_SLUGS = new Set(["gjafakort-veida-is-lax-og-silungur", "veidikortid-2024"]);

function cleanCategoryName(name: string): string {
  return stripHtml(name).replace(/\s+/g, " ").trim();
}

export async function importVeidaListings(scrapedAt: string): Promise<ImportedSpotRecord[]> {
  const categories = await fetchJson<VeidaCategory[]>(VEIDA_CATEGORIES_URL);
  const roots = new Map(
    categories
      .filter((category) => ROOT_CATEGORY_SLUGS.includes(category.slug as (typeof ROOT_CATEGORY_SLUGS)[number]))
      .map((category) => [category.id, category]),
  );

  const listingCategories = categories.filter(
    (category) => roots.has(category.parent) && !EXCLUDED_VEIDA_CHILD_SLUGS.has(category.slug),
  );

  return listingCategories.map((category) => {
    const parent = roots.get(category.parent);
    const cleanName = cleanCategoryName(category.name);
    const descriptionText = stripHtml(category.description);
    const sourceCategory = parent?.slug === "laxveidi" ? "laxveiði" : "silungsveiði";
    const shortDescription = buildListingDescription(cleanName, descriptionText, 155);
    const seasonText = cleanSeasonText(
      extractLabeledValue(descriptionText, ["Veiðitímabil", "Veiðitímabilið", "Tímabil", "Tímabilið"]),
    );
    const dailyHoursText = cleanDailyHoursText(
      extractLabeledValue(descriptionText, ["Daglegur veiðitími", "Veiðitíminn", "Veiðitími"]),
    );
    const species = inferSpecies(cleanName, sourceCategory, descriptionText);
    const allowedBaits = inferAllowedBaits(descriptionText);
    const region = inferRegion(cleanName, descriptionText);
    const waterType = inferWaterType(cleanName, descriptionText, sourceCategory);
    const dataConfidence = inferConfidence({
      shortDescription,
      region,
      waterType,
      species,
      seasonText,
      dailyHoursText,
    });

    return {
      id: `veida:${category.slug}`,
      sourceName: "veida.is",
      sourceUrl: category.permalink,
      name: cleanName,
      slug: category.slug,
      sourceCategory,
      imageUrl: category.image?.src ?? category.image?.thumbnail ?? null,
      imageAlt: category.image?.alt?.trim() || cleanName,
      imageSource: "veida.is category image",
      region,
      waterType,
      species,
      allowedBaits,
      permitModel: "Stakt leyfi",
      shortDescription,
      priceText: null,
      seasonText,
      dailyHoursText,
      rulesText: null,
      practicalInfoText: null,
      latitude: null,
      longitude: null,
      dataConfidence,
      scrapedAt,
    } satisfies ImportedSpotRecord;
  });
}
