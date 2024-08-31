import initFixes from "@core/fixes";
import { initFetchI18nStrings } from "@core/i18n";
import initSettings from "@core/ui/settings";
import { initVendettaObject } from "@core/vendetta/api";
import { VdPluginManager } from "@core/vendetta/plugins";
import { updateFonts } from "@lib/addons/fonts";
import { checkAndRegisterUpdates, initPlugins } from "@lib/addons/plugins";
import { patchChatBackground } from "@lib/addons/themes";
import initColors from "@lib/addons/themes/colors";
import { patchCommands } from "@lib/api/commands";
import { patchLogHook } from "@lib/api/debug";
import { injectFluxInterceptor } from "@lib/api/flux";
import { logger } from "@lib/utils/logger";
import initSafeMode from "@ui/safeMode";
import { patchSettings } from "@ui/settings";

import * as lib from "./lib";

export default async () => {
    // // Themes
    // if (isThemeSupported()) {
    //     try {
    //         if (isPyonLoader()) {
    //             if (FileManager.removeFile != null) {
    //                 removeFile("vendetta_theme.json", "");
    //             } else {
    //                 writeFile("vendetta_theme.json", "null", "");
    //             }
    //         }
    //         initThemes();
    //     } catch (e) {
    //         console.error("[Bunny] Failed to initialize themes...", e);
    //     }
    // }

    initColors();

    // Load everything in parallel
    await Promise.all([
        injectFluxInterceptor(),
        patchSettings(),
        patchLogHook(),
        patchCommands(),
        patchChatBackground(),
        initVendettaObject(),
        initFetchI18nStrings(),
        initSettings(),
        initFixes(),
        initSafeMode(),
        checkAndRegisterUpdates()
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Assign window object
    window.bunny = lib;

    // Once done, load Vendetta plugins
    VdPluginManager.initPlugins()
        .then(u => lib.unload.push(u))
        .catch(() => alert("Failed to initialize Vendetta plugins"));

    initPlugins();

    // Update the fonts
    updateFonts();

    // We good :)
    logger.log("Bunny is ready!");
};
