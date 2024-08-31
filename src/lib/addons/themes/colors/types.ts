import { Author, BunnyManifest } from "@lib/addons/types";

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

export interface BunnyColorManifest extends BunnyManifest {
    spec: 3;
    // ignoreThemedProfiles: boolean (to consider)
    type: "dark" | "light";
    semantic?: Record<string, string | string[] | SemanticReference>;
    raw?: Record<string, string>;
    background?: BackgroundDefinition;
}

export interface VendettaThemeManifest {
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

/** @internal */
export interface InternalColorDefinition {
    spec: 2 | 3;
    reference: "darker" | "light";
    semantic: Record<string, {
        value: string[];
        opacity: number;
    }>;
    raw: Record<string, string>;
    background?: BackgroundDefinition;
}

export type ThemeManifest = BunnyColorManifest | VendettaThemeManifest;

/** @internal */
export interface InternalThemeRef {
    key: `bn-theme-${string}`;
    context: InternalColorDefinition | null;
    readonly origRaw: Record<string, string>;
    lastSetDiscordTheme: string;
}
