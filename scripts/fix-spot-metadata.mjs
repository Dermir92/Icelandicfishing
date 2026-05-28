// One-time script to fix incorrect region and waterType values in imported-spots.json.
// Root cause: veidikortid detail pages always contain "fjarlægð frá Reykjavík" in a
// section heading, causing inferRegion() to classify every spot as Höfuðborgarsvæðið.
// waterType was also unreliable because "veiðisvæði" appears in every spot's body text.
//
// Fix strategy:
//   region   → inferred from GPS coordinates (much more reliable than text matching)
//   waterType → inferred from spot NAME only (e.g. "vatn" → vatn, "á" → á)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../data/imported-spots.json");

// ── Region from coordinates ──────────────────────────────────────────────────
// Manual overrides for spots that are hard to classify by bounding box alone
const REGION_OVERRIDES = {
  "veidikortid:hagavik": "Suðurland",
  "veidikortid:thingvallavatn": "Suðurland",
};

function regionFromCoords(lat, lon) {
  if (lat == null || lon == null) return null;

  // Vestfirðir — the northwestern peninsula
  if (lon < -21.8 && lat > 65.3) return "Vestfirðir";

  // Vesturland — Snæfellsnes and Borgarfjörður
  if (lon < -20.5 && lat > 64.35 && lat < 65.8) return "Vesturland";

  // Suðvesturland — Reykjanes peninsula (checked before capital area; lat up to 64.0)
  if (lon < -21.8 && lat <= 64.0) return "Suðvesturland";

  // Höfuðborgarsvæðið — Reykjavík metro area (incl. Hafnarfjörður, Mosfellsbær)
  if (lon < -21.05 && lat > 63.85 && lat < 64.45) return "Höfuðborgarsvæðið";

  // Norðurland — north coast (Akureyri and east towards Mývatn)
  if (lat > 64.8) return "Norðurland";

  // Austurland — east of Vatnajökull
  if (lon > -15.5) return "Austurland";

  // Hálendið — highland interior (roughly between lon -18 and -16, away from coasts)
  if (lat > 64.1 && lat < 65.0 && lon > -19.0 && lon < -17.0) return "Hálendið";

  // Suðurland — everything else in the south
  return "Suðurland";
}

// ── WaterType from spot name ─────────────────────────────────────────────────
const RIVER_PATTERNS = [
  /laxá/i, /\bá\b/i, /brúará/i, /ölfusá/i, /hvítá/i, /fossá/i, /svartá/i,
  /hólaá/i, /langadalsá/i, /hvannadalsá/i, /hvolsá/i, /víðidalsá/i, /gufuá/i,
  /veiðiá/i, /bergvatnsá/i, /blindá/i, /fljót/i,
];
const LAKE_PATTERNS = [/vatn/i, /tjörn/i, /\blón\b/i];

function waterTypeFromName(name) {
  if (!name) return null;
  if (LAKE_PATTERNS.some((p) => p.test(name))) return "vatn";
  if (RIVER_PATTERNS.some((p) => p.test(name))) return "á";
  return "svæði";
}

// ── Main ─────────────────────────────────────────────────────────────────────
const raw = await readFile(DATA_FILE, "utf8");
const spots = JSON.parse(raw);

let regionFixed = 0;
let waterTypeFixed = 0;

const updated = spots.map((spot) => {
  // veidiappid.is provides reliable region and waterType — trust their data
  const isVeidiappid = spot.id?.startsWith("veidiappid:");
  const newRegion = REGION_OVERRIDES[spot.id] ?? (isVeidiappid ? spot.region : regionFromCoords(spot.latitude, spot.longitude) ?? spot.region);
  const newWaterType = isVeidiappid ? spot.waterType : (waterTypeFromName(spot.name) ?? spot.waterType);

  if (newRegion !== spot.region) regionFixed++;
  if (newWaterType !== spot.waterType) waterTypeFixed++;

  return { ...spot, region: newRegion, waterType: newWaterType };
});

await writeFile(DATA_FILE, `${JSON.stringify(updated, null, 2)}\n`, "utf8");

console.log(`Fixed ${regionFixed} region values and ${waterTypeFixed} waterType values.`);

// Print sample of changes
const sample = updated.filter((s) => s.latitude).slice(0, 8);
console.log("\nSample (name → region / waterType):");
for (const s of sample) {
  console.log(`  ${s.name.padEnd(35)} → ${s.region} / ${s.waterType}`);
}
