"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import type { FishingSpot } from "@/types/spot";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const ICELAND_CENTER: [number, number] = [-18.5, 64.9];
const ICELAND_ZOOM = 5.8;

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function createMarkerEl(label: string): { outer: HTMLDivElement; inner: HTMLDivElement } {
  // outer: fixed 30x30 size — Mapbox applies its translate() transform here
  const outer = document.createElement("div");
  outer.style.width = "30px";
  outer.style.height = "30px";
  outer.style.cursor = "pointer";

  // inner: the visible circle — safe to apply scale() here without breaking Mapbox positioning
  const inner = document.createElement("div");
  inner.style.width = "30px";
  inner.style.height = "30px";
  inner.style.borderRadius = "50%";
  inner.style.display = "flex";
  inner.style.alignItems = "center";
  inner.style.justifyContent = "center";
  inner.style.fontSize = "11px";
  inner.style.fontWeight = "700";
  inner.style.color = "#fff";
  inner.style.boxSizing = "border-box";
  inner.style.userSelect = "none";
  inner.style.transition =
    "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease";
  inner.textContent = label;
  setMarkerVisual(inner, false);

  outer.appendChild(inner);
  return { outer, inner };
}

function setMarkerVisual(el: HTMLDivElement, selected: boolean, hovered = false) {
  el.style.background = selected ? "#5C97A0" : hovered ? "#2C5760" : "rgba(23,55,61,0.96)";
  el.style.border = selected
    ? "2.5px solid rgba(255,255,255,0.7)"
    : "2px solid rgba(255,255,255,0.25)";
  el.style.transform = selected ? "scale(1.3)" : hovered ? "scale(1.15)" : "scale(1)";
  el.style.boxShadow = selected
    ? "0 4px 14px rgba(92,151,160,0.5)"
    : "0 2px 8px rgba(0,0,0,0.35)";
}

export function MapView({
  spots,
  selectedSpotId,
  onSelectSpot,
}: {
  spots: FishingSpot[];
  selectedSpotId: string | null;
  onSelectSpot: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; inner: HTMLDivElement }>>(
    new Map(),
  );
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedIdRef = useRef(selectedSpotId);

  useEffect(() => {
    selectedIdRef.current = selectedSpotId;
  }, [selectedSpotId]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: ICELAND_CENTER,
      zoom: ICELAND_ZOOM,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();

      spots
        .filter((s): s is FishingSpot & { latitude: number; longitude: number } =>
          s.latitude != null && s.longitude != null,
        )
        .forEach((spot, i) => {
          const { outer, inner } = createMarkerEl(String(i + 1));

          outer.addEventListener("mouseenter", () => {
            if (selectedIdRef.current !== spot.id) setMarkerVisual(inner, false, true);
          });
          outer.addEventListener("mouseleave", () => {
            if (selectedIdRef.current !== spot.id) setMarkerVisual(inner, false);
          });
          outer.addEventListener("click", () => onSelectSpot(spot.id));

          const marker = new mapboxgl.Marker({ element: outer, anchor: "center" })
            .setLngLat([spot.longitude, spot.latitude])
            .addTo(map);

          markersRef.current.set(spot.id, { marker, inner });
        });
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once("load", addMarkers);
    }
  }, [spots, onSelectSpot]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(({ inner }, id) => {
      setMarkerVisual(inner, id === selectedSpotId);
    });

    popupRef.current?.remove();

    if (selectedSpotId) {
      const spot = spots.find((s) => s.id === selectedSpotId);
      const entry = markersRef.current.get(selectedSpotId);

      if (spot && entry) {
        const popup = new mapboxgl.Popup({
          offset: 20,
          closeButton: false,
          closeOnClick: false,
          maxWidth: "240px",
        })
          .setHTML(
            `<div style="font-family:system-ui,sans-serif;padding:2px 0">
              <div style="font-weight:700;font-size:13px;color:#12343B;line-height:1.3">${escapeHtml(spot.name)}</div>
              <div style="font-size:11px;color:rgba(18,52,59,0.6);margin-top:3px">${escapeHtml(spot.region)} · ${escapeHtml(spot.waterType)}</div>
            </div>`,
          )
          .setLngLat(entry.marker.getLngLat())
          .addTo(map);

        popupRef.current = popup;

        map.flyTo({
          center: entry.marker.getLngLat(),
          zoom: Math.max(map.getZoom(), 8),
          speed: 1.4,
          curve: 1,
        });
      }
    }
  }, [selectedSpotId, spots]);

  return (
    <div className="relative h-full overflow-hidden rounded-[1.7rem]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
