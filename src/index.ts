import patchErrorBoundary from "@core/debug/patches/patchErrorBoundary";
import { initFetchI18nStrings } from "@core/i18n";
import BunnySettings from "@core/storage/BunnySettings";
import initSettings from "@core/ui/settings";
import { initVendettaObject } from "@core/vendetta/api";
import FontManager from "@lib/addons/fonts";
import PluginManager from "@lib/addons/plugins/manager";
import ColorManager from "@lib/addons/themes/colors/manager";
import { patchCommands } from "@lib/api/commands";
import { patchLogHook } from "@lib/api/debug";
import { injectFluxInterceptor } from "@lib/api/flux";
import { logger } from "@lib/utils/logger";
import { patchSettingsSection } from "@ui/settings";

import * as lib from "./lib";

export default async () => {
    await BunnySettings.prepare();
    await ColorManager.prepare();
    await PluginManager.prepare();
    await FontManager.prepare();

    // Load everything in parallel
    await Promise.all([
        injectFluxInterceptor(),
        patchSettingsSection(),
        patchLogHook(),
        patchCommands(),
        initVendettaObject(),
        initFetchI18nStrings(),
        initSettings(),
        patchErrorBoundary()
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Assign window object
    window.bunny = lib;

    if (!BunnySettings.isSafeMode()) {
        await ColorManager.initialize();
        await PluginManager.initialize();
        await FontManager.initialize();
    }

    // We good :)
    logger.log("Bunny is ready!");
};
