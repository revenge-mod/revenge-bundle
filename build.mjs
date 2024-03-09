import { build } from "esbuild";
import alias from "esbuild-plugin-alias";
import swc from "@swc/core";
import { promisify } from "util";
import { exec as _exec } from "child_process";
import fs from "fs/promises";
import path from "path";
const exec = promisify(_exec);

const tsconfig = JSON.parse(await fs.readFile("./tsconfig.json"));
const aliases = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).map(([alias, [target]]) => [
    alias,
    path.resolve(target),
  ])
);
const commit =
  (await exec("git rev-parse HEAD")).stdout.trim().substring(0, 7) || "custom";

try {
  await build({
    entryPoints: ["./src/entry.ts"],
    outfile: "./dist/revenge.js",
    minify: true,
    bundle: true,
    format: "iife",
    target: "esnext",
    plugins: [
      {
        name: "swc",
        setup: (build) => {
          build.onLoad({ filter: /\.[jt]sx?/ }, async (args) => {
            // This actually works for dependencies as well!!
            const result = await swc.transformFile(args.path, {
              jsc: {
                externalHelpers: true,
              },
              env: {
                targets: "defaults",
                include: ["transform-classes", "transform-arrow-functions"],
              },
            });
            return { contents: result.code };
          });
        },
      },
      alias(aliases),
    ],
    define: {
      __revengeVersion: `"${commit}"`,
    },
    footer: {
      js: "//# sourceURL=Revenge",
    },
    legalComments: "none",
  });

  console.log("Build successful!");
} catch (e) {
  console.error("Build failed...", e);
  process.exit(1);
}
