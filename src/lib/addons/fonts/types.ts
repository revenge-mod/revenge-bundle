import { BunnyManifest } from "@lib/addons/types";

type FontMap = Record<string, string>;

export interface OldFontDefinition {
    spec: 1;
    name: string;
    description?: string;
    main: FontMap;
    __source?: string;
    __edited?: boolean;
}

export interface FontManifest extends BunnyManifest {
    spec: 3;
    main: FontMap;
}

export interface FontPreferences {
    selected: string | null;
    per: Record<string, {}>;
}

export interface FontTraces {
    [id: string]: {
        sourceUrl: string | null;
        timeInstalled: string | null;
        lastEdited: string | null;
    }
}
