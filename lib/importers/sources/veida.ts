import { fetchJson } from "../fetch";
import {
  extractLabeledValue,
  inferAllowedBaits,
  inferConfidence,
  inferRegion,
  inferSpecies,
  inferWaterType,
  stripHtml,
  toExcerpt,
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
    const descriptionText = stripHtml(category.description);
    const sourceCategory = parent?.slug === "laxveidi" ? "laxveiði" : "silungsveiði";
    const shortDescription = toExcerpt(descriptionText);
    const seasonText = extractLabeledValue(descriptionText, ["Veiðitími", "Veiðitímabil", "Tímabil"]);
    const species = inferSpecies(category.name, sourceCategory, descriptionText);
    const allowedBaits = inferAllowedBaits(descriptionText);
    const region = inferRegion(category.name, descriptionText);
    const waterType = inferWaterType(category.name, descriptionText, sourceCategory);
    const dataConfidence = inferConfidence({
      shortDescription,
      region,
      waterType,
      species,
      seasonText,
    });

    return {
      id: `veida:${category.slug}`,
      sourceName: "veida.is",
      sourceUrl: category.permalink,
      name: cleanCategoryName(category.name),
      slug: category.slug,
      sourceCategory,
      imageUrl: category.image?.src ?? category.image?.thumbnail ?? null,
      imageAlt: category.image?.alt?.trim() || cleanCategoryName(category.name),
      imageSource: "veida.is category image",
      region,
      waterType,
      species,
      allowedBaits,
      permitModel: "Stakt leyfi",
      shortDescription,
      priceText: null,
      seasonText,
      dailyHoursText: null,
      rulesText: null,
      practicalInfoText: null,
      latitude: null,
      longitude: null,
      dataConfidence,
      scrapedAt,
    } satisfies ImportedSpotRecord;
  });
}
