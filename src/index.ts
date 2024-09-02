import initFixes from "@core/fixes";
import { initFetchI18nStrings } from "@core/i18n";
import initSettings from "@core/ui/settings";
import { initVendettaObject } from "@core/vendetta/api";
import { updateFonts } from "@lib/addons/fonts";
import PluginManager from "@lib/addons/plugins/manager";
import ColorManager from "@lib/addons/themes/colors/manager";
import { patchCommands } from "@lib/api/commands";
import { patchLogHook } from "@lib/api/debug";
import { injectFluxInterceptor } from "@lib/api/flux";
import { settings } from "@lib/api/settings";
import { logger } from "@lib/utils/logger";
import initSafeMode from "@ui/safeMode";
import { patchSettings } from "@ui/settings";

import * as lib from "./lib";

export default async () => {
    await ColorManager.prepare();
    await PluginManager.prepare();

    // Load everything in parallel
    await Promise.all([
        injectFluxInterceptor(),
        patchSettings(),
        patchLogHook(),
        patchCommands(),
        initVendettaObject(),
        initFetchI18nStrings(),
        initSettings(),
        initFixes(),
        initSafeMode()
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Assign window object
    window.bunny = lib;

    if (!settings.safeMode?.enabled) {
        await ColorManager.initialize();
        await PluginManager.initialize();
    }

    // Update the fonts
    updateFonts();

    // We good :)
    logger.log("Bunny is ready!");
};
