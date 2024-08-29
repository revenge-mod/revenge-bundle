import { Author, BunnyManifest } from "@lib/addons/types";
import { omit } from "es-toolkit";

interface SemanticReference {
    type: "color" | "raw";
    value: string | string[];
    opacity?: number
}

interface BackgroundDefinition {
    url: string;
    blur?: number;
    opacity?: number;
}

interface BunnyThemeManifest extends BunnyManifest {
    spec: 3;
    // ignoreThemedProfiles: boolean (to consider)
    type: "dark" | "light";
    semantic?: Record<string, string | string[] | SemanticReference>;
    raw?: Record<string, string>;
    background?: BackgroundDefinition;
}

interface VendettaThemeManifest {
    spec: 2;
    name: string;
    description?: string;
    authors?: Author[];
    semanticColors?: Record<string, (string | false)[]>;
    rawColors?: Record<string, string>;
    background?: {
        url: string;
        blur?: number;
        alpha?: number;
    };
}

interface InternalThemeDefinition {
    spec: 2 | 3;
    type: BunnyThemeManifest["type"];
    semantic: Record<string, Required<Omit<SemanticReference, "value"> & { value: string[] }>>;
    raw: Record<string, string>;
    background?: BackgroundDefinition;
}

type ThemeManifest = BunnyThemeManifest | VendettaThemeManifest;

function isHex(input: string) {
    return input.startsWith("#");
}

function convertToInternalDef(manifest: ThemeManifest): InternalThemeDefinition {
    if (manifest.spec === 3) {
        const semanticDefinitions: InternalThemeDefinition["semantic"] = {};

        for (const key in manifest.semantic) {
            if (typeof manifest.semantic[key] === "string") {
                semanticDefinitions[key] = {
                    type: isHex(manifest.semantic[key]) ? "raw" : "color",
                    value: [manifest.semantic[key]],
                    opacity: 1
                };
            } else if (manifest.semantic[key] instanceof Array) {
                semanticDefinitions[key] = {
                    type: isHex(manifest.semantic[key][0]) ? "raw" : "color",
                    value: manifest.semantic[key],
                    opacity: 1
                };
            } else if (typeof manifest.semantic[key] === "object") {
                if (!(manifest.semantic[key].value instanceof Array)) {
                    manifest.semantic[key] = {
                        type: manifest.semantic[key].type,
                        value: [manifest.semantic[key].value],
                        opacity: manifest.semantic[key].opacity ?? 1
                    };
                }
            } else {
                throw new Error("Invalid semantic definitions: " + manifest.semantic[key]);
            }
        }

        return {
            spec: 3,
            type: manifest.type,
            semantic: semanticDefinitions,
            raw: manifest.raw ?? {},
            background: manifest.background
        };
    } else if (manifest.spec === 2) { // is Vendetta theme
        const semanticDefinitions: InternalThemeDefinition["semantic"] = {};
        const background: InternalThemeDefinition["background"] | undefined = manifest.background ? {
            ...omit(manifest.background, ["alpha"]),
            opacity: manifest.background.alpha
        } : undefined;

        for (const key in manifest.semanticColors) {
            const values = manifest.semanticColors[key].map(c => c || undefined).slice(0, 2);
            if (values.every(e => !e)) continue;

            semanticDefinitions[key] = {
                type: "raw",
                // TODO: this will fail if the color is not hex
                value: values[1] ? [values[0]!, values[1]] : [values[0]!],
                opacity: 1
            };
        }

        return {
            spec: 2,
            type: "dark", // TODO: Guess based on the defined semantic colors and provide an additional field
            semantic: semanticDefinitions,
            raw: manifest.rawColors ?? {},
            background
        };
    }

    throw new Error("Invalid theme spec");
}
