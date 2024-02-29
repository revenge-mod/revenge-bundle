import { readFile, writeFile, readdir } from "fs/promises";
import { join } from "path";
import { format } from "prettier";

export async function write(path, defsPath) {
  /** @type {string[]} */
  const defs = [];
  defs.push("export interface LangValues {");

  for (const file of await readdir(path)) {
    if (!file.endsWith(".json")) continue;

    let dt;
    try {
      dt = JSON.parse(await readFile(join(path, file)));
    } catch {
      console.log("Failed to parse", file);
      continue;
    }
    const fillers = Object.entries(dt)
      .map((x) => [x[0], x[1].match(/\$\w+/g)?.map((x) => x.slice(1)) ?? []])
      .filter((x) => x[1].length > 0);

    defs.push(`  ${plugin}: {`);
    defs.push(`    values: typeof import("./base/strings.json");`);
    if (fillers.length > 0) {
      defs.push("    fillers: {");
      for (const [key, stuff] of fillers)
        defs.push(`      ${JSON.stringify(key)}: ${JSON.stringify(stuff)};`);
      defs.push("    }");
    } else defs.push("    fillers: null;");
    defs.push("  };");
  }

  defs.push("}\n");
  await writeFile(
    defsPath,
    await format(defs.join("\n"), { parser: "typescript" }),
  );
  console.log("Updated defs.d.ts");
}
