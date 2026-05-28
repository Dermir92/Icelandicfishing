import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { importVeidaListings } from "../lib/importers/sources/veida";
import { importVeidikortidListings } from "../lib/importers/sources/veidikortid";
import { importVeidiappidListings } from "../lib/importers/sources/veidiappid";
import type { ImportedSpotRecord } from "../types/imported-spot";

async function main() {
  const scrapedAt = new Date().toISOString();

  const [veidikortid, veida, veidiappid] = await Promise.all([
    importVeidikortidListings(scrapedAt),
    importVeidaListings(scrapedAt),
    importVeidiappidListings(scrapedAt),
  ]);

  const records: ImportedSpotRecord[] = [...veidikortid, ...veida, ...veidiappid].sort((left, right) =>
    left.sourceName === right.sourceName
      ? left.name.localeCompare(right.name, "is")
      : left.sourceName.localeCompare(right.sourceName, "is"),
  );

  const targetDirectory = path.join(process.cwd(), "data");
  const targetFile = path.join(targetDirectory, "imported-spots.json");

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(targetFile, `${JSON.stringify(records, null, 2)}\n`, "utf8");

  console.log(`Imported ${records.length} records to ${targetFile}`);
  console.log(`- Veiðikortið: ${veidikortid.length}`);
  console.log(`- veida.is: ${veida.length}`);
  console.log(`- Veiði Appið: ${veidiappid.length}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
