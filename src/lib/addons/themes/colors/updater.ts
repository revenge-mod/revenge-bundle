import { settings } from "@lib/api/settings";
import { findByProps, findByPropsLazy, findByStoreNameLazy } from "@metro";

import { parseColorManifest } from "./parser";
import { colorsPref } from "./preferences";
import { ColorManifest, InternalColorDefinition } from "./types";

const tokenRef = findByProps("SemanticColor");
const origRawColor = { ...tokenRef.RawColor };
const AppearanceManager = findByPropsLazy("updateTheme");
const ThemeStore = findByStoreNameLazy("ThemeStore");
const FormDivider = findByPropsLazy("DIVIDER_COLORS");

let _inc = 1;

interface InternalColorRef {
    key: `bn-theme-${string}`;
    current: InternalColorDefinition | null;
    readonly origRaw: Record<string, string>;
    lastSetDiscordTheme: string;
}

/** @internal */
export const _colorRef: InternalColorRef = {
    current: null,
    key: `bn-theme-${_inc}`,
    origRaw: origRawColor,
    lastSetDiscordTheme: "darker"
};

export function updateBunnyColor(colorManifest: ColorManifest | null, { update = true }) {
    if (settings.safeMode?.enabled) return;

    const resolveType = (type = "dark") => (colorsPref.type ?? type) === "dark" ? "darker" : "light";
    const internalDef = colorManifest ? parseColorManifest(colorManifest) : null;

    if (resolveType() == "light" || update) {
        var ref = Object.assign(_colorRef, {
            current: internalDef,
            key: `bn-theme-${++_inc}`,
            lastSetDiscordTheme: !ThemeStore.theme.startsWith("bn-theme-") || !ThemeStore.theme.startsWith("darker")
                ? ThemeStore.theme
                : _colorRef.lastSetDiscordTheme
        });
    } else {
        var ref = Object.assign(_colorRef, {
            current: internalDef,
            key: `dark`,
            lastSetDiscordTheme: !ThemeStore.theme.startsWith("bn-theme-") || !ThemeStore.theme.startsWith("darker")
                ? ThemeStore.theme
                : _colorRef.lastSetDiscordTheme
        });
    }

    if (internalDef != null) {
        tokenRef.Theme[ref.key.toUpperCase()] = ref.key;
        FormDivider.DIVIDER_COLORS[ref.key] = FormDivider.DIVIDER_COLORS[ref.current!.reference];

        Object.keys(tokenRef.Shadow).forEach(k => tokenRef.Shadow[k][ref.key] = tokenRef.Shadow[k][ref.current!.reference]);
        Object.keys(tokenRef.SemanticColor).forEach(k => {
            tokenRef.SemanticColor[k][ref.key] = {
                ...tokenRef.SemanticColor[k][ref.current!.reference]
            };
        });
    }

    if (update) {
        AppearanceManager.setShouldSyncAppearanceSettings(false);
        AppearanceManager.updateTheme(internalDef != null ? ref.key : "darker");
    }
}

