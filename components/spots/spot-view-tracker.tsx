"use client";

import { useEffect } from "react";

export function SpotViewTracker({ id }: { id: string }) {
  useEffect(() => {
    fetch(`/api/spots/${encodeURIComponent(id)}/view`, { method: "POST" }).catch(() => {});
  }, [id]);

  return null;
}
