import chokidar from "chokidar";
import { join } from "path";
import { write } from "./make_defs.mjs";

const changed = async (file) => {
  console.clear();
  if (file) console.log("Update!", file, "\n");
  else console.log("Ready!\n");

  write(join("lang", "base"), join("lang", "defs.d.ts"));
};

chokidar
  .watch(["lang/base/*.json"], {
    persistent: true,
    ignoreInitial: true,
  })
  .on("add", changed)
  .on("change", changed)
  .on("unlink", changed)
  .on("ready", () => changed());
