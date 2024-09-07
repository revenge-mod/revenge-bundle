import "../global.d.ts"; // eslint-disable-line import-alias/import-alias
import "../modules.d.ts"; // eslint-disable-line import-alias/import-alias

export * as fonts from "./addons/fonts";
export * as plugins from "./addons/plugins";
export * as themes from "./addons/themes";
export * as api from "./api";
export * as ui from "./ui";
export * as utils from "./utils";
export * as metro from "@metro";

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
