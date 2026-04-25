"use client";

import { useMemo, useRef, useState, type WheelEvent } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";

import icelandGeoJson from "@/data/iceland.geo.json";
import type { FishingSpot } from "@/types/spot";

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 760;
const MAP_PADDING = 64;
const OVERLAP_DISTANCE = 34;
const VIEWBOX_CENTER_X = VIEWBOX_WIDTH / 2;
const VIEWBOX_CENTER_Y = VIEWBOX_HEIGHT / 2;
const MAX_ZOOM = 2.6;
const MIN_ZOOM = 1;
const ZOOM_STEP = 0.3;
const LABEL_WIDTH = 214;
const LABEL_META_WIDTH = 188;
const NAME_MAX_CHARS = 22;
const NAME_MAX_LINES = 2;

type Coordinate = [number, number];
type Polygon = Coordinate[][];
type MultiPolygon = Polygon[];

type GeoFeature = {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Polygon | MultiPolygon;
  };
};

type GeoFeatureCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

type Projection = {
  project: (lon: number, lat: number) => { x: number; y: number };
  paths: string[];
};

type PositionedSpot = {
  spot: FishingSpot;
  index: number;
  x: number;
  y: number;
  clusterSize: number;
  clusterIndex: number;
  isDenseCluster: boolean;
};

type Pan = {
  x: number;
  y: number;
};

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function wrapText(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word);
      current = "";
    }

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  const joinedWordCount = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (joinedWordCount < words.length && lines.length) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = lines[lastIndex].replace(/[.,;:!?\-\u2013\u2014\s]+$/u, "").concat("…");
  }

  return lines;
}

function buildProjection(collection: GeoFeatureCollection): Projection {
  const allCoordinates = collection.features.flatMap((feature) =>
    feature.geometry.type === "Polygon"
      ? (feature.geometry.coordinates as Polygon).flat()
      : (feature.geometry.coordinates as MultiPolygon).flat(2),
  );

  const minLon = Math.min(...allCoordinates.map(([lon]) => lon));
  const maxLon = Math.max(...allCoordinates.map(([lon]) => lon));
  const minLat = Math.min(...allCoordinates.map(([, lat]) => lat));
  const maxLat = Math.max(...allCoordinates.map(([, lat]) => lat));
  const referenceLatitude = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const longitudeScale = Math.cos(referenceLatitude);

  const projectedCoordinates = allCoordinates.map(([lon, lat]) => ({
    x: lon * longitudeScale,
    y: lat,
  }));

  const minX = Math.min(...projectedCoordinates.map((point) => point.x));
  const maxX = Math.max(...projectedCoordinates.map((point) => point.x));
  const minY = Math.min(...projectedCoordinates.map((point) => point.y));
  const maxY = Math.max(...projectedCoordinates.map((point) => point.y));

  const projectedWidth = maxX - minX;
  const projectedHeight = maxY - minY;

  const scale = Math.min(
    (VIEWBOX_WIDTH - MAP_PADDING * 2) / projectedWidth,
    (VIEWBOX_HEIGHT - MAP_PADDING * 2) / projectedHeight,
  );

  const offsetX = (VIEWBOX_WIDTH - projectedWidth * scale) / 2;
  const offsetY = (VIEWBOX_HEIGHT - projectedHeight * scale) / 2;

  const project = (lon: number, lat: number) => ({
    x: offsetX + (lon * longitudeScale - minX) * scale,
    y: offsetY + (maxY - lat) * scale,
  });

  const ringToPath = (ring: Coordinate[]) =>
    ring
      .map(([lon, lat], index) => {
        const point = project(lon, lat);
        return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      })
      .join(" ")
      .concat(" Z");

  const polygonToPath = (polygon: Polygon) => polygon.map(ringToPath).join(" ");

  const paths = collection.features.flatMap((feature) =>
    feature.geometry.type === "Polygon"
      ? [polygonToPath(feature.geometry.coordinates as Polygon)]
      : (feature.geometry.coordinates as MultiPolygon).map(polygonToPath),
  );

  return { project, paths };
}

function clusterSizeWeight(size: number) {
  return size <= 2 ? 0.9 : size <= 4 ? 1.14 : 1.34;
}

function distributeSpots(
  spots: FishingSpot[],
  project: (lon: number, lat: number) => { x: number; y: number },
) {
  const mappableSpots = spots.filter(
    (spot): spot is FishingSpot & { latitude: number; longitude: number } =>
      spot.latitude !== null && spot.longitude !== null,
  );

  const basePositions = mappableSpots.map((spot) => ({
    spot,
    ...project(spot.longitude, spot.latitude),
  }));

  const groups: number[][] = [];
  const visited = new Set<number>();

  for (let index = 0; index < basePositions.length; index += 1) {
    if (visited.has(index)) continue;

    const group = [index];
    visited.add(index);

    for (let compareIndex = index + 1; compareIndex < basePositions.length; compareIndex += 1) {
      if (distance(basePositions[index], basePositions[compareIndex]) < OVERLAP_DISTANCE) {
        group.push(compareIndex);
        visited.add(compareIndex);
      }
    }

    groups.push(group);
  }

  return groups.flatMap((group) => {
    if (group.length === 1) {
      const base = basePositions[group[0]];

      return [
        {
          spot: base.spot,
          index: group[0],
          x: base.x,
          y: base.y,
          clusterSize: 1,
          clusterIndex: 0,
          isDenseCluster: false,
        },
      ];
    }

    const centroid = group.reduce(
      (accumulator, baseIndex) => ({
        x: accumulator.x + basePositions[baseIndex].x / group.length,
        y: accumulator.y + basePositions[baseIndex].y / group.length,
      }),
      { x: 0, y: 0 },
    );

    const ringRadius = Math.min(38, 13 + group.length * 3.8);
    const isDenseCluster = group.length >= 3;

    return group.map((baseIndex, clusterIndex) => {
      const base = basePositions[baseIndex];
      const angle = -Math.PI / 2 + (clusterIndex / group.length) * Math.PI * 2;
      const spreadWeight = clusterSizeWeight(group.length);
      const localShift = isDenseCluster ? 0.06 : 0.12;

      return {
        spot: base.spot,
        index: baseIndex,
        x: base.x + Math.cos(angle) * ringRadius * spreadWeight + (centroid.x - base.x) * localShift,
        y: base.y + Math.sin(angle) * ringRadius * spreadWeight + (centroid.y - base.y) * localShift,
        clusterSize: group.length,
        clusterIndex,
        isDenseCluster,
      };
    });
  });
}

function SpotMarker({
  positionedSpot,
  selected,
  hovered,
  onSelect,
  onHover,
  onLeave,
}: {
  positionedSpot: PositionedSpot;
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { spot, index, x, y, clusterSize, clusterIndex, isDenseCluster } = positionedSpot;
  const showLabel = selected || hovered;
  const markerRadius = selected ? 16.5 : hovered ? 13.25 : isDenseCluster ? 10 : 10.8;
  const titleLines = wrapText(spot.name, NAME_MAX_CHARS, NAME_MAX_LINES);
  const metadata = `${spot.region} • ${spot.waterType}`;
  const metadataLines = wrapText(metadata, 28, 1);
  const titleHeight = titleLines.length * 14;
  const metadataHeight = metadataLines.length ? 12 : 0;
  const labelHeight = 22 + titleHeight + (metadataHeight ? 9 + metadataHeight : 0) + 16;
  const labelX = x - LABEL_WIDTH / 2;
  const labelY = y + 18;
  const hasClusterMates = clusterSize > 1;

  return (
    <g
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="cursor-pointer outline-none"
      role="button"
      tabIndex={0}
      aria-label={`Opna ${spot.name}`}
    >
      {selected ? (
        <>
          <circle cx={x} cy={y} r={markerRadius + 12} fill="rgba(92,151,160,0.16)" />
          <circle cx={x} cy={y} r={markerRadius + 7} fill="rgba(255,255,255,0.08)" />
        </>
      ) : null}

      {showLabel ? (
        <g opacity={1}>
          <rect
            x={labelX}
            y={labelY}
            width={LABEL_WIDTH}
            height={labelHeight}
            rx={15}
            fill={selected ? "#F7F7F4" : "rgba(23,55,61,0.96)"}
            stroke={selected ? "rgba(18,52,59,0.12)" : "rgba(255,255,255,0.12)"}
          />

          {titleLines.map((line, lineIndex) => (
            <text
              key={`${spot.id}-title-${lineIndex}`}
              x={x}
              y={labelY + 22 + lineIndex * 14}
              textAnchor="middle"
              fontSize="12.5"
              fontWeight="700"
              fill={selected ? "#12343B" : "rgba(255,255,255,0.94)"}
            >
              {line}
            </text>
          ))}

          {metadataLines.map((line, lineIndex) => (
            <text
              key={`${spot.id}-meta-${lineIndex}`}
              x={x}
              y={labelY + 22 + titleHeight + 9 + lineIndex * 12}
              textAnchor="middle"
              fontSize="11"
              textLength={LABEL_META_WIDTH}
              lengthAdjust="spacingAndGlyphs"
              fill={selected ? "rgba(18,52,59,0.68)" : "rgba(255,255,255,0.64)"}
            >
              {line}
            </text>
          ))}
        </g>
      ) : null}

      {hasClusterMates && !selected ? (
        <circle
          cx={x}
          cy={y}
          r={markerRadius + (isDenseCluster ? 5.5 : 4)}
          fill="none"
          stroke={hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}
          strokeDasharray={isDenseCluster ? "2.5 3.5" : "3 3"}
          strokeWidth="1"
        />
      ) : null}

      <circle
        cx={x}
        cy={y}
        r={markerRadius}
        fill={selected ? "#5C97A0" : hovered ? "#2C5760" : "rgba(23,55,61,0.97)"}
        stroke={
          selected
            ? "rgba(255,255,255,0.7)"
            : hovered
              ? "rgba(255,255,255,0.4)"
              : "rgba(255,255,255,0.16)"
        }
        strokeWidth={selected ? "2.3" : "1.3"}
      />

      <text
        x={x}
        y={y + 3.7}
        textAnchor="middle"
        fontSize={selected ? "11" : isDenseCluster ? "9.2" : "9.8"}
        fontWeight="700"
        fill="#FFFFFF"
      >
        {index + 1}
      </text>

      {hasClusterMates && clusterIndex === 0 ? (
        <text
          x={x + markerRadius + 8}
          y={y - markerRadius - 3}
          fontSize="9"
          fontWeight="700"
          fill={selected ? "rgba(255,255,255,0.84)" : "rgba(255,255,255,0.72)"}
        >
          +{clusterSize - 1}
        </text>
      ) : null}
    </g>
  );
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
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const { paths, project } = useMemo(
    () => buildProjection(icelandGeoJson as unknown as GeoFeatureCollection),
    [],
  );
  const positionedSpots = useMemo(() => distributeSpots(spots, project), [project, spots]);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const clampPan = (nextPan: Pan, nextZoom: number) => {
    if (nextZoom <= 1) return { x: 0, y: 0 };

    const maxOffsetX = ((VIEWBOX_WIDTH * nextZoom) - VIEWBOX_WIDTH) / 2;
    const maxOffsetY = ((VIEWBOX_HEIGHT * nextZoom) - VIEWBOX_HEIGHT) / 2;

    return {
      x: clamp(nextPan.x, -maxOffsetX, maxOffsetX),
      y: clamp(nextPan.y, -maxOffsetY, maxOffsetY),
    };
  };

  const updateZoom = (direction: "in" | "out") => {
    const nextZoom = clamp(
      zoom + (direction === "in" ? ZOOM_STEP : -ZOOM_STEP),
      MIN_ZOOM,
      MAX_ZOOM,
    );
    setZoom(nextZoom);
    setPan((current) => clampPan(current, nextZoom));
  };

  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();

    const nextZoom = clamp(
      zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP),
      MIN_ZOOM,
      MAX_ZOOM,
    );

    if (nextZoom === zoom) return;

    setZoom(nextZoom);
    setPan((current) => clampPan(current, nextZoom));
  };

  const orderedSpots = [
    ...positionedSpots.filter(
      (spot) => spot.spot.id !== hoveredSpotId && spot.spot.id !== selectedSpotId,
    ),
    ...positionedSpots.filter(
      (spot) => spot.spot.id === hoveredSpotId && spot.spot.id !== selectedSpotId,
    ),
    ...positionedSpots.filter((spot) => spot.spot.id === selectedSpotId),
  ];

  return (
    <div className="relative h-full overflow-hidden rounded-[1.7rem] bg-[linear-gradient(180deg,#144C76_0%,#123F63_48%,#102F49_100%)]">
      <div className="absolute inset-0 opacity-18 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(118,182,222,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(150,208,232,0.1),transparent_22%),radial-gradient(circle_at_50%_86%,rgba(255,255,255,0.06),transparent_24%)]" />

      <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <div className="pointer-events-auto flex overflow-hidden rounded-[1rem] border border-white/12 bg-[#17373D]/88 shadow-panel backdrop-blur-xl">
          <button
            type="button"
            onClick={() => updateZoom("out")}
            disabled={zoom <= MIN_ZOOM}
            className="flex h-10 w-10 items-center justify-center text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:text-white/35"
            aria-label="Minnka aðdrátt"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex min-w-14 items-center justify-center border-x border-white/10 px-2 text-[11px] font-semibold text-white/74">
            {zoom.toFixed(1)}x
          </div>
          <button
            type="button"
            onClick={() => updateZoom("in")}
            disabled={zoom >= MAX_ZOOM}
            className="flex h-10 w-10 items-center justify-center text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:text-white/35"
            aria-label="Auka aðdrátt"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={resetView}
          className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-[1rem] border border-white/12 bg-[#17373D]/88 px-3.5 text-sm font-semibold text-white shadow-panel backdrop-blur-xl transition hover:bg-[#17373D]"
        >
          <LocateFixed className="h-4 w-4" />
          Yfirlit
        </button>
      </div>

      <div className="absolute inset-4 flex items-center justify-center">
        <div
          className="relative h-full max-h-full w-auto max-w-full"
          style={{ aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}` }}
        >
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            aria-hidden="true"
            className="h-full w-full select-none"
            preserveAspectRatio="xMidYMid meet"
            onWheel={handleWheel}
            onPointerDown={(event) => {
              if (zoom <= 1) return;
              dragState.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                panX: pan.x,
                panY: pan.y,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;
              const deltaX = event.clientX - dragState.current.startX;
              const deltaY = event.clientY - dragState.current.startY;
              setPan(
                clampPan(
                  {
                    x: dragState.current.panX + deltaX * 1.1,
                    y: dragState.current.panY + deltaY * 1.1,
                  },
                  zoom,
                ),
              );
            }}
            onPointerUp={(event) => {
              if (dragState.current?.pointerId === event.pointerId) {
                dragState.current = null;
              }
            }}
            onPointerCancel={() => {
              dragState.current = null;
            }}
          >
            <defs>
              <linearGradient id="islandFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DCE5E2" stopOpacity="0.97" />
                <stop offset="42%" stopColor="#CCD9D5" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#B7C7C2" stopOpacity="0.92" />
              </linearGradient>
              <linearGradient id="islandEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F4FAF8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#A8BBB6" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            <g
              transform={`translate(${pan.x} ${pan.y}) translate(${VIEWBOX_CENTER_X} ${VIEWBOX_CENTER_Y}) scale(${zoom}) translate(${-VIEWBOX_CENTER_X} ${-VIEWBOX_CENTER_Y})`}
            >
              {paths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  fill="url(#islandFill)"
                  stroke="url(#islandEdge)"
                  strokeWidth={index === 0 ? 5 : 3}
                  strokeLinejoin="round"
                />
              ))}

              {orderedSpots.map((positionedSpot) => (
                <SpotMarker
                  key={positionedSpot.spot.id}
                  positionedSpot={positionedSpot}
                  selected={selectedSpotId === positionedSpot.spot.id}
                  hovered={hoveredSpotId === positionedSpot.spot.id}
                  onSelect={() => onSelectSpot(positionedSpot.spot.id)}
                  onHover={() => setHoveredSpotId(positionedSpot.spot.id)}
                  onLeave={() =>
                    setHoveredSpotId((current) =>
                      current === positionedSpot.spot.id ? null : current,
                    )
                  }
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
