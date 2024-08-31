import { findByProps, findByPropsLazy, findByStoreNameLazy } from "@metro";
import { omit } from "es-toolkit";

import { InternalColorDefinition, InternalThemeRef,ThemeManifest } from "./types";

const tokenRef = findByProps("SemanticColor");
const origRawColor = { ...tokenRef.RawColor };
const appearanceManager = findByPropsLazy("updateTheme");
const ThemeStore = findByStoreNameLazy("ThemeStore");
const FormDivider = findByPropsLazy("DIVIDER_COLORS");

let _inc = 1;

/** @internal */
export const _themeRef: InternalThemeRef = {
    context: null,
    key: `bn-theme-${_inc}`,
    origRaw: origRawColor,
    lastSetDiscordTheme: "darker"
};

export function setThemeRef(themeDef: InternalColorDefinition | null, { update = true }) {
    const ref = Object.assign(_themeRef, {
        context: themeDef,
        key: `bn-theme-${++_inc}`,
        lastSetDiscordTheme: !ThemeStore.theme.startsWith("bn-theme-") ? ThemeStore.theme : _themeRef.lastSetDiscordTheme
    });

    if (themeDef != null) {
        tokenRef.Theme[ref.key.toUpperCase()] = ref.key;
        FormDivider.DIVIDER_COLORS[ref.key] = FormDivider.DIVIDER_COLORS[ref.context!.reference];

        for (const k in tokenRef.Shadow) {
            tokenRef.Shadow[k][ref.key] = tokenRef.Shadow[k][ref.context!.reference];
        }

        for (const k in tokenRef.SemanticColor) {
            tokenRef.SemanticColor[k][ref.key] = {
                ...tokenRef.SemanticColor[k][ref.context!.reference]
            };
        }
    }

    if (update) {
        appearanceManager.setShouldSyncAppearanceSettings(false);
        appearanceManager.updateTheme(themeDef != null ? ref.key : ref.lastSetDiscordTheme);
    }
}

export function convertToInternalDef(manifest: ThemeManifest): InternalColorDefinition {
    if (manifest.spec === 3) {
        const semanticDefinitions: InternalColorDefinition["semantic"] = {};

        for (const key in manifest.semantic) {
            if (typeof manifest.semantic[key] === "object" && !(manifest.semantic[key] instanceof Array)) {
                const { type, value, opacity } = manifest.semantic[key];
                if (type === "raw") {
                    semanticDefinitions[key] = {
                        value: value instanceof Array ? value : [value],
                        opacity: opacity ?? 1
                    };
                } else {
                    if (value instanceof Array) {
                        throw new Error("value can't be defined as an array when referencing a rawcolor definition");
                    }

                    const colorValue = tokenRef.RawColor[value];
                    semanticDefinitions[key] = {
                        value: colorValue,
                        opacity: opacity ?? 1
                    };
                }
            } else if (manifest.semantic[key] instanceof Array) {
                if (manifest.semantic[key].some(c => !c.startsWith("#"))) {
                    throw new Error("array values may only contain raw color definition");
                }

                semanticDefinitions[key] = {
                    value: manifest.semantic[key],
                    opacity: 1
                };
            } else if (typeof manifest.semantic[key] === "string") {
                if (manifest.semantic[key].startsWith("#")) {
                    semanticDefinitions[key] = {
                        value: [manifest.semantic[key]],
                        opacity: 1
                    };
                } else {
                    semanticDefinitions[key] = {
                        value: [tokenRef.RawColor[manifest.semantic[key]]],
                        opacity: 1
                    };
                }
            } else {
                throw new Error("Invalid semantic definitions: " + manifest.semantic[key]);
            }
        }

        return {
            spec: 3,
            reference: manifest.type === "dark" ? "darker" : "light",
            semantic: semanticDefinitions,
            raw: manifest.raw ?? {},
            background: manifest.background
        };
    } else if (manifest.spec === 2) { // is Vendetta theme
        const semanticDefinitions: InternalColorDefinition["semantic"] = {};
        const background: InternalColorDefinition["background"] | undefined = manifest.background ? {
            ...omit(manifest.background, ["alpha"]),
            opacity: manifest.background.alpha
        } : undefined;

        for (const key in manifest.semanticColors) {
            const values = manifest.semanticColors[key].map(c => c || undefined).slice(0, 2);
            if (values.every(e => !e)) continue;

            semanticDefinitions[key] = {
                value: [values[0]!, values[1]!],
                opacity: 1
            };
        }

        return {
            spec: 2,
            reference: "darker", // TODO: Guess based on the defined semantic colors
            semantic: semanticDefinitions,
            raw: manifest.rawColors ?? {},
            background
        };
    }

    throw new Error("Invalid theme spec");
}
