import * as commands from "@lib/commands";
import * as constants from "@lib/constants";
import * as debug from "@lib/debug";
import logger from "@lib/logger";
import patcher from "@lib/patcher";
import * as plugins from "@lib/plugins";
import settings, { loaderConfig } from "@lib/settings";
import * as storage from "@lib/storage";
import * as themes from "@lib/themes";
import * as utils from "@lib/utils";
import * as common from "@metro/common";
import * as metro from "@metro/filters";
import { VendettaObject } from "@types";
import * as alerts from "@ui/alerts";
import * as assets from "@ui/assets";
import * as color from "@ui/color";
import * as components from "@ui/components";
import * as toasts from "@ui/toasts";

export default async (unloads: any[]): Promise<VendettaObject> => ({
  patcher: utils.without(patcher, "unpatchAll"),
  metro: { ...metro, common: { ...common } },
  constants,
  utils,
  debug: utils.without(debug, "versionHash", "patchLogHook", "toggleSafeMode"),
  ui: {
    components,
    toasts,
    alerts,
    assets,
    ...color,
  },
  plugins: utils.without(plugins, "initPlugins", "evalPlugin"),
  themes: utils.without(themes, "initThemes"),
  commands: utils.without(commands, "patchCommands"),
  storage,
  settings,
  loader: {
    identity: window.__vendetta_loader,
    config: loaderConfig,
  },
  logger,
  version: debug.versionHash,
  unload: () => {
    unloads.filter((i) => typeof i === "function").forEach((p) => p());
    // @ts-expect-error On unload, nothing would be using this
    delete window.vendetta;
  },
});
