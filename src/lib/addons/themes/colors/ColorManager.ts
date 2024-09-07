import BunnySettings from "@core/storage/BunnySettings";
import { BunnyPluginManifest } from "@lib/addons/plugins/types";
import { fileExists, removeFile, writeFile } from "@lib/api/native/fs";
import { LOADER_IDENTITY } from "@lib/api/native/loader";
import { awaitStorage, createStorage, createStorageAsync, migrateToNewStorage, preloadStorageIfExists, updateStorageAsync } from "@lib/api/storage";
import { invariant } from "@lib/utils";
import safeFetch from "@lib/utils/safeFetch";
import chroma from "chroma-js";
import { omit } from "lodash";

import initColors from ".";
import { applyAndroidAlphaKeys, normalizeToHex, parseColorManifest } from "./parser";
import { ColorManifest, VendettaThemeManifest } from "./types";
import { updateBunnyColor } from "./updater";

interface BunnyColorPreferencesStorage {
    selected: string | null;
    type?: "dark" | "light" | null;
    customBackground: "hidden" | null;
    per: Record<string, { autoUpdate: boolean; }>;
}

interface BunnyColorInfoStorage {
    [id: string]: {
        sourceUrl: string;
        timeInstalled: string | null;
    }
}

export default {
    preferences: createStorage<BunnyColorPreferencesStorage>(
        "themes/colors/preferences.json",
        {
            dflt: { selected: null, per: {}, customBackground: null }
        }
    ),

    infos: createStorage<BunnyColorInfoStorage>("themes/colors/info.json"),

    async prepare(): Promise<void> {
        await awaitStorage(this.preferences, this.infos);
        await this.migrate("VENDETTA_THEMES");

        await Promise.allSettled(this.getAllIds().map(id =>
            preloadStorageIfExists(`themes/colors/data/${id}.json`)
        ));

        if (!BunnySettings.isSafeMode()) {
            if (this.preferences.selected) {
                initColors(this.getCurrentManifest());
            } else {
                initColors(null);
            }
        }

        if (LOADER_IDENTITY.type === "bunny" && await fileExists("../vendetta_theme.json")) {
            await writeFile("../vendetta_theme.json", "null");
        }
    },

    async initialize(): Promise<void> {
        this.updateAll();
    },

    async migrate(oldKey: string) {
        return migrateToNewStorage(oldKey, async storage => {
            for (const [id, vdTheme] of Object.entries<any>(storage)) {
                const sanitizedId = this.sanitizeId(id);
                await updateStorageAsync(`themes/colors/data/${sanitizedId}.json`, vdTheme.data);

                if (vdTheme.selected) {
                    this.preferences.selected = sanitizedId;
                }

                this.preferences.per[sanitizedId] ??= { autoUpdate: true };
                this.infos[sanitizedId] ??= {
                    timeInstalled: null,
                    sourceUrl: id
                };
            }
        });
    },

    sanitizeId(id: string) {
        return id.replace(/[<>:"/\\|?*]/g, "-").replace(/-+/g, "-");
    },

    convertToVd(manifest: ColorManifest): VendettaThemeManifest {
        const semanticColors = {} as VendettaThemeManifest["semanticColors"] & {};

        if (manifest.spec === 2 && manifest.semanticColors) {
            for (const key in manifest.semanticColors) {
                semanticColors[key] &&= semanticColors[key].map(
                    str => normalizeToHex(str || undefined)
                ).map(x => x || false);
            }
        } else if (manifest.spec === 3) {
            const intDef = parseColorManifest(manifest);
            for (const key in intDef.semantic) {
                const applyOpacity = (v: string) => chroma(v).alpha(intDef.semantic[key].opacity).hex();
                const value = applyOpacity(intDef.semantic[key].value);
                semanticColors[key] = manifest.type === "dark" ? [value] : [false, value];
            }
        }

        return {
            spec: 2,
            name: manifest.spec === 3 ? manifest.display.name : manifest.name,
            description: manifest.spec === 3 ? manifest.display.description : manifest.description,
            authors: manifest.spec === 3 ? manifest.display.authors : manifest.authors,
            semanticColors,
            rawColors: manifest.spec === 3 ? manifest.raw : applyAndroidAlphaKeys(manifest.rawColors),
            background: manifest.spec === 2 ? manifest.background : manifest.background ? { ...omit(manifest.background, ["opacity"]), alpha: manifest.background.opacity } : undefined,
            ...(manifest.spec === 3 && manifest.extras)
        };
    },

    checkColor(manifest: ColorManifest) {
        invariant(manifest.spec === 2 || manifest.spec === 3, "Invalid theme spec");
        if (manifest.spec === 2) {
            return this.convertToVd(manifest);
        } else {
            parseColorManifest(manifest);
            return manifest;
        }
    },

    getAllIds(): string[] {
        return Object.keys(this.infos);
    },

    getId(manifest: ColorManifest, url: string) {
        return this.sanitizeId("id" in manifest ? manifest.id : url);
    },

    getCurrentManifest(): ColorManifest | null {
        if (!this.preferences.selected) return null;
        return this.getManifest(this.preferences.selected);
    },

    getManifest(id: string): ColorManifest {
        id = this.sanitizeId(id);
        if (!this.infos[id]) throw new Error(`${id} is not installed`);
        return createStorage(`themes/colors/data/${id}.json`);
    },

    getDisplayInfo(id: string): BunnyPluginManifest["display"] & { id: string } {
        id = this.sanitizeId(id);
        const manifest = createStorage<ColorManifest>(`themes/colors/data/${id}.json`, { nullIfEmpty: true });
        if (!manifest) throw new Error(`Theme manifest of '${id}' was not stored`);

        if (manifest.spec === 3) {
            return { id, ...manifest.display };
        } else {
            return {
                id,
                name: manifest.name,
                description: manifest.description,
                authors: manifest.authors
            };
        }
    },

    async writeForNative(manifest: ColorManifest | null) {
        manifest = manifest && this.convertToVd(manifest);

        if (manifest) {
            await writeFile("current-theme.json", JSON.stringify({
                id: "native",
                data: manifest,
                selected: true
            }));
        } else {
            await writeFile("current-theme.json", "null");
        }
    },

    async fetch(url: string) {
        let manifest: ColorManifest;

        try {
            manifest = await (await safeFetch(url, { cache: "no-store" })).json();
            manifest = this.checkColor(manifest);
        } catch {
            throw new Error(`Failed to fetch theme at ${url}`);
        }

        const id = this.getId(manifest, url);
        await updateStorageAsync(`themes/colors/data/${id}.json`, manifest);

        return manifest;
    },

    async refresh(id: string) {
        id = this.sanitizeId(id);
        const { sourceUrl } = this.infos[id];
        await this.fetch(sourceUrl);

        if (this.preferences.selected === id) {
            updateBunnyColor(this.getCurrentManifest(), { update: true });
        }
    },

    async select(id: string | null) {
        id &&= this.sanitizeId(id);
        invariant(id ? this.infos[id] : true, "Tried to select non-existent theme");

        if (this.preferences.selected === id) return;
        this.preferences.selected = id;

        if (id) {
            let manifest = await createStorageAsync<ColorManifest>(`themes/colors/data/${id}.json`, { nullIfEmpty: true });
            manifest ??= await this.fetch(this.infos[id].sourceUrl);
            updateBunnyColor(manifest, { update: true });
            await this.writeForNative(manifest);
        } else {
            updateBunnyColor(null, { update: true });
            await this.writeForNative(null);
        }
    },

    async install(url: string): Promise<void> {
        if (this.getAllIds().some(id => this.infos[id].sourceUrl === url)) {
            throw new Error("Theme is already installed");
        }

        const manifest = await this.fetch(url);
        const id = this.getId(manifest, url);

        this.preferences.per[id] = { autoUpdate: true };
        this.infos[id] = { sourceUrl: url, timeInstalled: new Date().toISOString() };
    },

    async uninstall(id: string): Promise<void> {
        id = this.sanitizeId(id);

        if (this.preferences.selected === id) {
            await this.select(null);
        }

        delete this.infos[id];
        delete this.preferences.per[id];

        await removeFile(`themes/colors/data/${id}.json`);
    },

    async updateAll(): Promise<void> {
        const update = (id: string) => this.fetch(this.infos[id].sourceUrl);
        await Promise.allSettled(this.getAllIds().map(update));
    }
};
