import AddonManager from "@lib/addons/AddonManager";
import { removeFile } from "@lib/api/native/fs";
import { awaitStorage, createStorage, createStorageAsync, migrateToNewStorage, updateStorageAsync } from "@lib/api/storage/new";
import { invariant } from "@lib/utils";
import { safeFetch } from "@lib/utils/safeFetch";

import initColors from ".";
import { ColorManifest } from "./types";
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

        if (this.preferences.selected) {
            initColors(await createStorageAsync<ColorManifest | null>(
                `themes/colors/data/${this.preferences.selected}.json`,
                null
            ));
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

    getAllIds(): string[] {
        return Object.keys(this.infos);
    }

    getId(manifest: ColorManifest, url: string) {
        return this.sanitizeId("id" in manifest ? manifest.id : url);
    }

    getCurrentManifest(): ColorManifest {
        return createStorage(`themes/colors/data/${this.preferences.selected}.json`);
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

    async select(id: string | null) {
        invariant(id ? this.infos[id] : true, "Tried to select non-existent theme");
        id &&= this.sanitizeId(id);

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
