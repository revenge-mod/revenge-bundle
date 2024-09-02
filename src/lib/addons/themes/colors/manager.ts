import AddonManager from "@lib/addons/AddonManager";
import { BunnyPluginManifest } from "@lib/addons/plugins/types";
import { removeFile } from "@lib/api/native/fs";
import { awaitStorage, createStorage, createStorageAsync, migrateToNewStorage, preloadStorageIfExists, updateStorageAsync } from "@lib/api/storage/new";
import { invariant } from "@lib/utils";
import { safeFetch } from "@lib/utils/safeFetch";
import chroma from "chroma-js";
import { omit } from "lodash";

import initColors from ".";
import { parseColorManifest } from "./parser";
import { BunnyColorManifest, ColorManifest, VendettaThemeManifest } from "./types";
import { updateBunnyColor } from "./updater";

interface BunnyColorPreferencesStorage {
    selected: string | null;
    per: Record<string, { autoUpdate: boolean; }>;
}

interface BunnyColorInfoStorage {
    [id: string]: {
        sourceUrl: string;
        timeInstalled: string | null;
    }
}

export default new class ColorManager extends AddonManager<ColorManifest> {
    preferences = createStorage<BunnyColorPreferencesStorage>(
        "themes/colors/preferences.json",
        { selected: null, per: {} }
    );

    infos = createStorage<BunnyColorInfoStorage>("themes/colors/info.json");

    async prepare(): Promise<void> {
        await awaitStorage(this.preferences, this.infos);
        await this.migrate("VENDETTA_THEMES");

        await Promise.allSettled(this.getAllIds().map(id =>
            preloadStorageIfExists(`themes/colors/data/${id}.json`)
        ));

        if (this.preferences.selected) {
            initColors(this.getCurrentManifest());
        } else {
            initColors(null);
        }
    }

    async initialize(): Promise<void> {
        this.updateAll();
    }

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
    }

    sanitizeId(id: string) {
        return id.replace(/[<>:"/\\|?*]/g, "-").replace(/-+/g, "-");
    }

    convertToVd(manifest: BunnyColorManifest | VendettaThemeManifest): VendettaThemeManifest {
        if ("name" in manifest) return manifest;
        else {
            const intDef = parseColorManifest(manifest);
            const semanticColors = {} as VendettaThemeManifest["semanticColors"] & {};

            for (const key in intDef.semantic) {
                const applyOpacity = (v: string) => chroma(v).alpha(intDef.semantic[key].opacity).hex();
                semanticColors[key] = intDef.semantic[key].value.map(applyOpacity);
            }

            return {
                spec: 2,
                name: manifest.display.name,
                description: manifest.display.description,
                authors: manifest.display.authors,
                semanticColors,
                rawColors: manifest.raw,
                background: manifest.background ? { ...omit(manifest.background, ["opacity"]), alpha: manifest.background.opacity } : undefined,
                ...manifest.extras
            };
        }
    }

    getAllIds(): string[] {
        return Object.keys(this.infos);
    }

    getId(manifest: ColorManifest, url: string) {
        return this.sanitizeId("id" in manifest ? manifest.id : url);
    }

    getCurrentManifest(): ColorManifest | null {
        if (!this.preferences.selected) return null;
        return this.getManifest(this.preferences.selected);
    }

    getManifest(id: string): ColorManifest {
        if (!this.infos[id]) throw new Error(`${id} is not installed`);
        return createStorage(`themes/colors/data/${id}.json`);
    }

    getDisplayInfo(id: string): BunnyPluginManifest["display"] & { id: string } {
        const manifest = createStorage<ColorManifest | null>(`themes/colors/data/${id}.json`, null);
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
    }

    async fetch(url: string) {
        let manifest: ColorManifest;

        try {
            manifest = await (await safeFetch(url, { cache: "no-store" })).json();
        } catch {
            throw new Error(`Failed to fetch theme at ${url}`);
        }

        const id = this.getId(manifest, url);
        await updateStorageAsync(`themes/colors/data/${id}.json`, manifest);

        return manifest;
    }

    async refresh(id: string) {
        id = this.sanitizeId(id);
        const { sourceUrl } = this.infos[id];
        await this.fetch(sourceUrl);

        if (this.preferences.selected === id) {
            updateBunnyColor(this.getCurrentManifest(), { update: true });
        }
    }

    async select(id: string | null) {
        id &&= this.sanitizeId(id);
        invariant(id ? this.infos[id] : true, "Tried to select non-existent theme");

        if (this.preferences.selected === id) return;
        this.preferences.selected = id;

        if (id) {
            let manifest = await createStorageAsync<ColorManifest | null>(`themes/colors/data/${id}.json`, null);
            manifest ??= await this.fetch(this.infos[id].sourceUrl);
            updateBunnyColor(manifest, { update: true });
        } else {
            updateBunnyColor(null, { update: true });
        }
    }

    async install(url: string): Promise<void> {
        if (this.getAllIds().some(id => this.infos[id].sourceUrl === url)) {
            throw new Error("Theme is already installed");
        }

        const manifest = await this.fetch(url);
        const id = this.getId(manifest, url);

        this.preferences.per[id] = { autoUpdate: true };
        this.infos[id] = { sourceUrl: url, timeInstalled: new Date().toISOString() };
    }

    async uninstall(id: string): Promise<void> {
        id = this.sanitizeId(id);

        if (this.preferences.selected === id) {
            await this.select(null);
        }

        delete this.infos[id];
        delete this.preferences.per[id];

        await removeFile(`themes/colors/data/${id}.json`);
    }

    async updateAll(): Promise<void> {
        const update = (id: string) => this.fetch(this.infos[id].sourceUrl);
        await Promise.allSettled(this.getAllIds().map(update));
    }
};
