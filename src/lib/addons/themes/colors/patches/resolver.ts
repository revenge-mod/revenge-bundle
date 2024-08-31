import { _themeRef } from "@lib/addons/themes/colors/internalRef";
import { ThemeManager } from "@lib/api/native/modules";
import { before, instead } from "@lib/api/patcher";
import { findByProps } from "@metro";
import { byMutableProp } from "@metro/filters";
import { createLazyModule } from "@metro/lazy";
import chroma from "chroma-js";

const tokenReference = findByProps("SemanticColor");
const isThemeModule = createLazyModule(byMutableProp("isThemeDark"));

export default function patchDefinitionAndResolver() {
    const callback = ([theme]: any[]) => theme === _themeRef.key ? [_themeRef.context!.reference] : void 0;

    Object.keys(tokenReference.RawColor).forEach(keys => {
        Object.defineProperty(tokenReference.RawColor, keys, {
            configurable: true,
            enumerable: true,
            get: () => {
                const ret = _themeRef.context?.raw?.[keys];
                return ret || _themeRef.origRaw[keys];
            }
        });
    });

    const unpatches = [
        before("isThemeDark", isThemeModule, callback),
        before("isThemeLight", isThemeModule, callback),
        before("updateTheme", ThemeManager, callback),
        instead("resolveSemanticColor", tokenReference.default.meta ?? tokenReference.default.internal, (args: any[], orig: any) => {
            if (!_themeRef.context) return orig(...args);

            if (args[0] !== _themeRef.key) return orig(...args);

            args[0] = _themeRef.context.reference;

            const [name, colorDef] = extractInfo(_themeRef.context!.reference, args[1]);

            const themeIndex = _themeRef.context!.reference === "light" ? 1 : 0;

            const semanticDef = _themeRef.context.semantic[name];
            if (semanticDef.value[themeIndex]) {
                return chroma(semanticDef.value[themeIndex]).alpha(semanticDef.opacity).hex();
            }

            const rawValue = _themeRef.context.raw[colorDef.raw];
            if (rawValue) {
                // Set opacity if needed
                return colorDef.opacity === 1 ? rawValue : chroma(rawValue).alpha(colorDef.opacity).hex();
            }

            // Fallback to default
            return orig(...args);
        }),
        () => {
            // Not the actual module but.. yeah.
            Object.defineProperty(tokenReference, "RawColor", {
                configurable: true,
                writable: true,
                value: _themeRef.origRaw
            });
        }
    ];

    return () => unpatches.forEach(p => p());
}

function extractInfo(themeName: string, colorObj: any): [name: string, colorDef: any] {
    // @ts-ignore - assigning to extractInfo._sym
    const propName = colorObj[extractInfo._sym ??= Object.getOwnPropertySymbols(colorObj)[0]];
    const colorDef = tokenReference.SemanticColor[propName];

    return [propName, colorDef[themeName]];
}
