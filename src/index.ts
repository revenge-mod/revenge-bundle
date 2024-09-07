import patchErrorBoundary from "@core/debug/patches/patchErrorBoundary";
import { initFetchI18nStrings } from "@core/i18n";
import { logger } from "@core/logger";
import { patchLogHook } from "@core/logger/debugger";
import BunnySettings from "@core/storage/BunnySettings";
import PluginReporter from "@core/ui/reporter/PluginReporter";
import initRegisterSettings from "@core/ui/settings";
import { initVendettaObject } from "@core/vendetta/api";
import FontManager from "@lib/addons/fonts/FontManager";
import PluginManager from "@lib/addons/plugins/PluginManager";
import ColorManager from "@lib/addons/themes/colors/ColorManager";
import { patchCommands } from "@lib/api/commands";
import { injectFluxInterceptor } from "@lib/api/flux";
import { patchSettingsSection } from "@ui/settings";

import * as lib from "./lib";

export default async () => {
    await BunnySettings.prepare();
    await ColorManager.prepare();
    await PluginManager.prepare();
    await FontManager.prepare();
    await PluginReporter.prepare();

    // Load everything in parallel
    await Promise.all([
        injectFluxInterceptor(),
        patchSettingsSection(),
        patchLogHook(),
        patchCommands(),
        initVendettaObject(),
        initFetchI18nStrings(),
        initRegisterSettings(),
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
