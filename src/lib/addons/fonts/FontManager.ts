import { downloadFile, fileExists, removeFile, writeFile } from "@lib/api/native/fs";
import {
    awaitStorage,
    createStorage,
    migrateToNewStorage,
    preloadStorageIfExists,
    updateStorageAsync,
} from "@lib/api/storage";
import { safeFetch } from "@lib/utils";
import isValidHttpUrl from "@lib/utils/isValidHttpUrl";
import { omit } from "es-toolkit";

import type { FontManifest, FontPreferences, FontTraces, OldFontDefinition } from "./types";

export default {
    preferences: createStorage<FontPreferences>("themes/fonts/preferences.json", {
        dflt: {
            selected: null,
            per: {},
        },
    }),
    traces: createStorage<FontTraces>("themes/fonts/traces.json"),

    async prepare() {
        await awaitStorage(this.preferences, this.traces);
        await migrateToNewStorage("BUNNY_FONTS", async (storage) => {
            this.preferences.selected = storage.__selected ?? null;

            for (const id in storage) {
                if (id.startsWith("__")) continue;
                const sanitizedId = this.sanitizeId(id);

                this.preferences.per[sanitizedId] = {};
                this.traces[sanitizedId] = {
                    sourceUrl: storage[id].__source ?? null,
                    timeInstalled: null,
                    lastEdited: null,
                };

                await updateStorageAsync(
                    `themes/fonts/manifests/${sanitizedId}.json`,
                    this.convertToNewFormat(storage[id], sanitizedId),
                );
            }
        });

        await Promise.allSettled(
            this.getAllIds().map((id) => preloadStorageIfExists(`themes/fonts/manifests/${id}.json`)),
        );
    },

    sanitizeId(id: string) {
        return id.replace(/[<>:"/\\|?*]/g, "-").replace(/-+/g, "-");
    },

    getAllIds() {
        return Object.keys(this.traces);
    },

    convertToNewFormat(font: OldFontDefinition, id: string): FontManifest {
        return {
            spec: 3,
            id: this.sanitizeId(id),
            display: {
                name: font.name,
                description: font.description,
            },
            main: font.main,
            extras: omit(font, ["name", "description", "main", "spec"]),
        };
    },

    getManifest(id: string): FontManifest {
        return createStorage(`themes/fonts/manifests/${id}.json`, { nullIfEmpty: true });
    },

    async writeToNative(manifest: FontManifest | null) {
        if (manifest) {
            const definition = {
                name: manifest.id, // name is used to reference files, so we just pass 'id' here
                description: manifest.display.description,
                main: manifest.main,
            };

            await writeFile("fonts.json", JSON.stringify(definition));
        } else {
            await removeFile("fonts.json");
        }
    },

    validate(font: FontManifest | OldFontDefinition, url: string | null) {
        if (!font || typeof font !== "object") throw new Error("URL returned a null/non-object JSON");
        if (typeof font.spec !== "number") throw new Error("Invalid font 'spec' number");
        if (font.spec !== 1 && font.spec !== 3) throw new Error("Only fonts which follows spec: 1 and 3 are supported");

        if (font.spec === 1) {
            const requiredFields = ["name", "main"] as const;
            if (requiredFields.some((f) => f && !font[f]))
                throw new Error(`Font is missing one of the fields: ${requiredFields}`);
            if (font.name.startsWith("__")) throw new Error("Font names cannot start with __");
            if (url && this.sanitizeId(url) in this.traces) throw new Error("Font was already installed");
        } else {
            const requiredFields = ["id", "main"] as const;
            if (requiredFields.some((f) => f && !font[f]))
                throw new Error(`Font is missing one of the fields: ${requiredFields}`);
            if (this.sanitizeId(font.id) in this.traces) throw new Error("Font was already installed");
            if (font.id !== this.sanitizeId(font.id)) throw new Error("Font id contains illegal characters");
        }
    },

    async initialize() {
        this.updateAll();
    },

    async fetch(url: string): Promise<FontManifest> {
        let fontManifest: FontManifest | OldFontDefinition;

        try {
            fontManifest = await (await safeFetch(url)).json();
        } catch (e) {
            throw new Error(`Failed to fetch fonts at ${url}`, { cause: e });
        }

        this.validate(fontManifest, url);
        if (fontManifest.spec === 1) {
            fontManifest = this.convertToNewFormat(fontManifest, url);
        }

        fontManifest.id = this.sanitizeId(fontManifest.id);

        try {
            await Promise.all(
                Object.entries(fontManifest.main).map(async ([font, url]) => {
                    let ext = url.split(".").pop();
                    if (ext !== "ttf" && ext !== "otf") ext = "ttf";
                    const path = `downloads/fonts/${fontManifest.id}/${font}.${ext}`;
                    if (!(await fileExists(path))) await downloadFile(url, path);
                }),
            );
        } catch (e) {
            throw new Error("Failed to download font assets", { cause: e });
        }

        return fontManifest;
    },

    async install(url: string) {
        if (!isValidHttpUrl(url) || Object.values(this.traces).some((f) => f.sourceUrl === url)) {
            throw new Error("Invalid source or font was already installed");
        }

        const font = await this.fetch(url);

        this.preferences.per[font.id] = {};
        this.traces[font.id] = {
            sourceUrl: url,
            timeInstalled: new Date().toISOString(),
            lastEdited: null,
        };
    },

    async saveLocally(manifest: FontManifest, { markAsEdited = false }) {
        this.validate(manifest, null);
        await updateStorageAsync(`themes/fonts/manifests/${manifest.id}.json`, manifest);

        if (manifest.id in this.traces) {
            Object.assign(this.traces[manifest.id], {
                lastEdited: markAsEdited ? new Date().toISOString() : null,
            });
        } else {
            this.preferences.per[manifest.id] = {};
            this.traces[manifest.id] = {
                sourceUrl: null,
                timeInstalled: new Date().toISOString(),
                lastEdited: markAsEdited ? new Date().toISOString() : null,
            };
        }
    },

    async select(id: string | null) {
        id &&= this.sanitizeId(id);
        if ((id && !this.traces[id]) || typeof id !== "string") throw new Error(`Unknown font '${id}'`);

        this.preferences.selected = id;

        await this.writeToNative(id != null ? this.getManifest(id) : null);
    },

    async uninstall(id: string): Promise<void> {
        id = this.sanitizeId(id);

        if (!this.traces[id]) throw new Error(`Unknown font '${id}'`);
        if (this.preferences.selected === id) {
            this.select(null);
        }

        delete this.traces[id];
        delete this.preferences.per[id];

        throw new Error("Method not implemented.");
    },

    async updateAll(): Promise<void> {
        // TODO: Parallelly fetch
        for (const id in this.traces) {
            const { sourceUrl, lastEdited } = this.traces[id];
            if (!sourceUrl || lastEdited) continue;

            this.fetch(sourceUrl);
        }
    },
};
