import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SPOT_VIEWS_KEY = "spot_views";

export async function incrementSpotView(id: string): Promise<void> {
  await redis.zincrby(SPOT_VIEWS_KEY, 1, id);
}

export async function getTopSpotIds(count = 4): Promise<string[]> {
  if (count <= 0) return [];
  const results = await redis.zrange(SPOT_VIEWS_KEY, 0, count - 1, { rev: true });
  return results as string[];
}
