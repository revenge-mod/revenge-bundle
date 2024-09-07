import "../global.d.ts"; // eslint-disable-line import-alias/import-alias
import "../modules.d.ts"; // eslint-disable-line import-alias/import-alias

import { logger } from "@core/logger/index.js";

export * as fonts from "./addons/fonts/FontManager.js";
export * as plugins from "./addons/plugins";
export * as themes from "./addons/themes";
export * as api from "./api";
export * as ui from "./ui";
export * as utils from "./utils";
export * as metro from "@metro";

import * as fonts from "./addons/fonts";
import * as plugins from "./addons/plugins";
import * as themes from "./addons/themes";
import { proxyLazy } from "./utils/lazy";

export const managers = proxyLazy(() => {
    logger.warn("bunny.managers.* is deprecated, and moved the top level (bunny.*). bunny.managers will be eventually removed soon");

    return {
        get fonts() { return fonts; },
        get plugins() { return plugins; },
        get themes() { return themes; }
    };
}, { hint: "object" });

const _disposer = [] as Array<() => unknown>;

export function unload() {
    for (const d of _disposer) if (typeof d === "function") d();
    // @ts-expect-error
    delete window.bunny;
}

/**
 * For internal use only, do not use!
 * @internal
 */
unload.push = (fn: typeof _disposer[number]) => {
    _disposer.push(fn);
};
