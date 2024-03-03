import { patchCommands } from "@lib/commands";
import { patchLogHook } from "@lib/debug";
import initFixes from "@lib/fixes";
import logger from "@lib/logger";
import { initPlugins } from "@lib/plugins";
import { patchChatBackground } from "@lib/themes";
import windowObject from "@lib/windowObject";
import { patchAssets } from "@ui/assets";
import initQuickInstall from "@ui/quickInstall";
import initSafeMode from "@ui/safeMode";
import initSettings from "@ui/settings";

export default async () => {
  // Load everything in parallel
  const unloads = await Promise.all([
    patchLogHook(),
    patchAssets(),
    patchCommands(),
    patchChatBackground(),
    initFixes(),
    initSafeMode(),
    initSettings(),
    initQuickInstall(),
  ]);

  // Assign window object
  window.vendetta = await windowObject(unloads);

  // Once done, load plugins
  unloads.push(await initPlugins());

  // We good :)
  logger.log("Revenge is ready!");
};
