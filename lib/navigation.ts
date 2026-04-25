import type { FishingSpot } from "@/types/spot";

export function getGoogleMapsUrl(spot: FishingSpot) {
  if (spot.googleMapsUrl) {
    return spot.googleMapsUrl;
  }

  if (spot.latitude !== null && spot.longitude !== null) {
    const query = encodeURIComponent(`${spot.latitude},${spot.longitude} (${spot.name})`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  const query = encodeURIComponent(`${spot.name}, ${spot.region}, Ísland`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
