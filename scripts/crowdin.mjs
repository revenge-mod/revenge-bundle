import { readdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { write } from "./make_defs.mjs";

const dir = dirname(fileURLToPath(import.meta.url));

const data = {};

for (const lang of await readdir(".")) {
  if (lang === "base" || lang.endsWith(".json")) continue;

  for (const file of await readdir(join(".", lang))) {
    const key = file.split(".")[0];
    data[key] ??= {};
    data[key][lang] = JSON.parse(await readFile(join(".", lang, file), "utf8"));
  }
}

for (const [plugin, dt] of Object.entries(data)) {
  await writeFile(
    join(dir, "../lang", "strings.json"),
    JSON.stringify(dt),
  );

  console.log(`Wrote strings.json`);
}

write(join(".", "base"), join(dir, "..", "lang", "defs.d.ts"));

console.log("Done");
