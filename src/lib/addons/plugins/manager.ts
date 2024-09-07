import { logger } from "@core/logger";
import PluginReporter, { PluginDisableReason, PluginStage } from "@core/ui/reporter/PluginReporter";
import { Observable } from "@gullerya/object-observer";
import AddonManager from "@lib/addons/AddonManager";
import { readFile, removeFile, writeFile } from "@lib/api/native/fs";
import { awaitStorage, createStorage, createStorageAsync, migrateToNewStorage, preloadStorageIfExists, purgeStorage, updateStorageAsync, useObservable } from "@lib/api/storage";
import { BUNNY_PROXY_PREFIX,VD_PROXY_PREFIX } from "@lib/constants";
import isValidHttpUrl from "@lib/utils/isValidHttpUrl";
import safeFetch from "@lib/utils/safeFetch";
import { omit } from "lodash";

import { createBunnyPluginAPI } from "./api";
import { BunnyPluginManifest, BunnyPluginObject, PluginInstance, PluginInstanceInternal, PluginSettingsStorage,PluginTracesStorage } from "./types";

type VendettaPlugin = any;

const _fetch = (repoUrl: string, path: string) => safeFetch(new URL(path, repoUrl), { cache: "no-store" });
const fetchJS = (repoUrl: string, path: string) => _fetch(repoUrl, path).then(r => r.text());
const fetchJSON = (repoUrl: string, path: string) => _fetch(repoUrl, path).then(r => r.json());

function assert<T>(condition: T, id: string, attempt: string): asserts condition {
    if (!condition) throw new Error(`[${id}] Attempted to ${attempt}`);
}

export default new class PluginManager extends AddonManager<BunnyPluginManifest> {
    settings = createStorage<PluginSettingsStorage>("plugins/settings.json");
    traces = createStorage<PluginTracesStorage>("plugins/infos.json");

    #instances = Observable.from({}) as Record<string, PluginInstance | undefined>;
    #bunnyApiObjects = new Map<string, ReturnType<typeof createBunnyPluginAPI>>();
    #updateAllPromise: Promise<void> = null!;

    async initialize() {
        await this.#updateAllPromise;

        for (const id of this.getAllIds()) {
            if (this.settings[id].enabled) {
                this.start(id, { throwOnPluginError: true });
            }
        }
    }

    async prepare(): Promise<void> {
        await awaitStorage(this.settings, this.traces);
        await this.migrate("VENDETTA_PLUGINS");
        await Promise.all(this.getAllIds().map(id => preloadStorageIfExists(`plugins/manifests/${id}.json`)));
        this.#updateAllPromise = this.updateAll();
    }

    migrate(oldKey: string): Promise<void> {
        return migrateToNewStorage(oldKey, async storage => {
            for (const plugin of Object.values<VendettaPlugin>(storage)) {
                const sanitizedId = this.sanitizeId(plugin.id);
                const pluginStorage = await createStorageAsync(`../vd_mmkv/${sanitizedId}`, { nullIfEmpty: true });

                await updateStorageAsync(
                    `plugins/manifests/${sanitizedId}.json`,
                    this.convertToBn(plugin.id, plugin.manifest)
                );

                await writeFile(`plugins/scripts/${sanitizedId}.js`, plugin.js);
                if (pluginStorage) {
                    await updateStorageAsync(`plugins/storage/${sanitizedId}.json`, pluginStorage);
                }

                this.settings[sanitizedId] ??= {
                    enabled: plugin.enabled,
                    autoUpdate: plugin.update
                };

                this.traces[sanitizedId] ??= {
                    sourceUrl: plugin.id,
                    installTime: null,
                    isVendetta: true
                };
            }
        });
    }

    usePlugins() {
        useObservable(this.settings, this.traces, this.#instances);
    }

    convertToBn(source: string, vdManifest: VendettaPlugin["manifest"]): BunnyPluginManifest {
        return {
            id: this.sanitizeId(source),
            display: {
                name: vdManifest.name,
                description: vdManifest.description,
                authors: vdManifest.authors
            },
            main: vdManifest.main,
            hash: vdManifest.hash,
            extras: {
                ...omit(vdManifest, ["name", "description", "authors", "main", "hash"])
            }
        };
    }

    convertToVd(manifest: BunnyPluginManifest) {
        return {
            name: manifest.display.name,
            description: manifest.display.description,
            authors: manifest.display.authors,
            main: manifest.main,
            hash: manifest.hash,
            ...manifest.extras
        };
    }

    sanitizeId(id: string) {
        if (isValidHttpUrl(id) && !id.endsWith("/")) id += "/";
        return id.replace(/[<>:"/\\|?*]/g, "-").replace(/-+/g, "-");
    }

    getManifest(id: string): BunnyPluginManifest {
        id = this.sanitizeId(id);
        return createStorage(`plugins/manifests/${id}.json`);
    }

    getAllIds(): string[] {
        return Object.keys(this.traces);
    }

    getType(manifest: BunnyPluginManifest | VendettaPlugin["manifest"]) {
        if ("display" in manifest) return "bunny";
        if (["name", "main"].every(p => p in manifest)) return "vendetta";
        throw new Error("Invalid plugin manifest");
    }

    isProxied(id: string) {
        const { sourceUrl } = this.traces[this.sanitizeId(id)];
        return sourceUrl.startsWith(VD_PROXY_PREFIX) || sourceUrl.startsWith(BUNNY_PROXY_PREFIX);
    }

    getUnproxiedPlugins() {
        return this.getAllIds().filter(p => !this.isProxied(p));
    }

    getSettingsComponent(id: string): (() => JSX.Element) | undefined {
        return this.#instances[id]?.SettingsComponent;
    }

    async refetch(id: string) {
        id = this.sanitizeId(id);
        const { sourceUrl } = this.traces[id];
        await this.fetch(sourceUrl, { id });
    }

    async fetch(url: string, { id = "" } = {}): Promise<BunnyPluginManifest> {
        if (!url.endsWith("/")) url += "/";

        const existingId = id || Object.entries(this.traces).find(([, v]) => v.sourceUrl === url)?.[0];
        const existingManifest = existingId ? this.getManifest(existingId) : null;

        if (existingId) PluginReporter.updateStage(id, PluginStage.FETCHING);
        let pluginManifest: BunnyPluginManifest;

        try {
            pluginManifest = await fetchJSON(url, "manifest.json");
            if (this.getType(pluginManifest) === "vendetta") {
                pluginManifest = this.convertToBn(url, pluginManifest as unknown as VendettaPlugin["manifest"]);
            }
        } catch (err) {
            throw new Error(`Failed to fetch manifest for ${url}`, { cause: err });
        }

        assert(
            this.traces[pluginManifest.id] ? this.traces[pluginManifest.id].sourceUrl === url : true,
            pluginManifest.id ?? url,
            "fetching a plugin already installed with another source"
        );

        let pluginJs: string | undefined;

        if (existingManifest?.hash !== pluginManifest.hash) {
            try {
                pluginJs = await fetchJS(url, pluginManifest.main);
            } catch { } // Empty catch, checked below

            if (pluginJs) {
                try {
                    await writeFile(`plugins/scripts/${pluginManifest.id}.js`, pluginJs);
                    await updateStorageAsync(`plugins/manifests/${pluginManifest.id}.json`, pluginManifest);
                } catch (err) {
                    throw new Error(`Unable to update file for plugin ${id}`);
                }
            }
        }

        if (!pluginJs && !existingManifest) throw new Error(`Failed to fetch JS for ${url}`);

        PluginReporter.updateStage(pluginManifest.id, PluginStage.FETCHED);
        return pluginManifest;
    }

    async start(id: string, { throwOnPluginError = false, awaitPlugin = true } = {}): Promise<void> {
        id = this.sanitizeId(id);
        const manifest = this.getManifest(id);

        assert(manifest, id, "start a non-registered plugin");
        assert(id in this.settings, id, "start a non-installed plugin");
        assert(this.settings[id]?.enabled, id, "start a disabled plugin");
        assert(!this.#instances[id], id, "start an already started plugin");

        await preloadStorageIfExists(`plugins/storage/${id}.json`);

        let pluginInstance: PluginInstance;

        if (!this.traces[id].isVendetta) {
            let instantiator: (
                    bunny: BunnyPluginObject,
                    definePlugin?: (p: PluginInstance) => PluginInstanceInternal
                ) => PluginInstanceInternal;

            try {
                PluginReporter.updateStage(id, PluginStage.PARSING);
                const iife = await readFile(`plugins/scripts/${id}.js`);
                instantiator = globalEvalWithSourceUrl(
                    `(bunny,definePlugin)=>{${iife};return plugin?.default ?? plugin;}`,
                    `bunny-plugin/${id}-${manifest.hash}`
                );
                PluginReporter.updateStage(id, PluginStage.PARSED);
            } catch (error) {
                PluginReporter.reportPluginError(id, error);
                throw new Error("An error occured while parsing plugin's code, possibly a syntax error?", { cause: error });
            }

            try {
                PluginReporter.updateStage(id, PluginStage.INSTANTIATING);
                const api = createBunnyPluginAPI(id);
                pluginInstance = instantiator(api.object, p => {
                    return Object.assign(p, { manifest }) as PluginInstanceInternal;
                });

                if (!pluginInstance) throw new Error(`Plugin '${id}' does not export a valid plugin instance`);

                this.#bunnyApiObjects.set(id, api);
                this.#instances[id] = pluginInstance;
                PluginReporter.updateStage(id, PluginStage.INSTANTIATED);
            } catch (error) {
                PluginReporter.reportPluginError(id, error);
                throw new Error("An error occured while instantiating plugin's code", { cause: error });
            }
        } else {
            let instantiator: any;

            try {
                PluginReporter.updateStage(id, PluginStage.PARSING);
                const iife = await readFile(`plugins/scripts/${id}.js`);

                instantiator = globalEvalWithSourceUrl(
                    `vendetta=>{return ${iife}}`,
                    `vd-plugin/${id}-${manifest.hash}`
                );
                PluginReporter.updateStage(id, PluginStage.PARSED);
            } catch (err) {
                PluginReporter.reportPluginError(id, err);

                if (throwOnPluginError) {
                    throw new Error("An error occured while parsing Vendetta plugin", { cause: err });
                } else {
                    return;
                }
            }

            try {
                PluginReporter.updateStage(id, PluginStage.INSTANTIATING);

                const vendettaForPlugins = {
                    ...window.vendetta,
                    plugin: {
                        id: manifest.id,
                        manifest: this.convertToVd(manifest),
                        storage: await createStorageAsync<Record<string, any>>(`plugins/storage/${this.sanitizeId(id)}.json`)
                    },
                    logger,
                };

                const raw = instantiator(vendettaForPlugins);
                const ret = typeof raw === "function" ? raw() : raw;
                const rawInstance = ret?.default ?? ret ?? {};
                pluginInstance = {
                    start: rawInstance.onLoad,
                    stop: rawInstance.onUnload,
                    SettingsComponent: rawInstance.settings
                };

                this.#instances[id] = pluginInstance;
                PluginReporter.updateStage(id, PluginStage.INSTANTIATED);
            } catch (err) {
                PluginReporter.reportPluginError(id, err);
                this.disable(id, { throwOnPluginError: false, reason: PluginDisableReason.ERROR });

                if (throwOnPluginError) {
                    throw new Error("An error occured while instantiating Vendetta plugin", { cause: err });
                } else {
                    return;
                }
            }
        }

        try {
            PluginReporter.updateStage(id, PluginStage.STARTING);
            const promise = pluginInstance.start?.();
            if (awaitPlugin) await promise;
            PluginReporter.updateStage(id, PluginStage.STARTED);
        } catch (error) {
            PluginReporter.reportPluginError(id, error);

            this.disable(id, { throwOnPluginError: false, reason: PluginDisableReason.ERROR });

            if (throwOnPluginError) {
                throw new Error("An error occured while starting the plugin", { cause: error });
            }
        }
    }

    async stop(id: string, { throwOnPluginError = false, awaitPlugin = false } = {}) {
        id = this.sanitizeId(id);
        const instance = this.#instances[id];
        assert(instance, id, "stop a non-started plugin");

        try {
            PluginReporter.updateStage(id, PluginStage.STOPPING);
            const promise = instance.stop?.();
            if (awaitPlugin) await promise;
            PluginReporter.updateStage(id, PluginStage.STOPPED);
        } catch (err) {
            if (throwOnPluginError) {
                throw new Error("instance.stop() threw an error", { cause: err });
            }
        } finally {
            const obj = this.#bunnyApiObjects.get(id);
            obj?.disposers.forEach((d: Function) => d());
            delete this.#instances[id];
        }
    }

    async enable(id: string, { start = true } = {}) {
        id = this.sanitizeId(id);
        assert(this.settings[id], id, "enable a non-installed plugin");

        this.settings[id].enabled = true;
        PluginReporter.clearPluginReports(id);
        if (start) await this.start(id);
    }

    async disable(id: string, { throwOnPluginError = false, reason = PluginDisableReason.REQUESTED } = {}) {
        id = this.sanitizeId(id);
        assert(this.settings[id], id, "disable a non-installed plugin");

        this.#instances[id] && this.stop(id, { throwOnPluginError });
        this.settings[id].enabled = false;
        PluginReporter.reportPluginDisable(id, reason);
    }

    async install(url: string, { start = true, enable = true } = {}) {
        if (!url.endsWith("/")) url += "/";
        if (!(start ? enable : true)) {
            throw new Error("Instant start is true but plugin is not pre-enabled");
        }

        const manifest = await this.fetch(url);

        this.traces[manifest.id] = {
            sourceUrl: url,
            installTime: new Date().toISOString(),
            isVendetta: manifest.id.startsWith("https-")
        };

        this.settings[manifest.id] = {
            enabled: enable,
            autoUpdate: true
        };

        if (start) await this.start(manifest.id, { awaitPlugin: true, throwOnPluginError: true });
    }

    async uninstall(id: string, { keepData = false } = {}) {
        id = this.sanitizeId(id);

        if (this.#instances[id]) {
            await this.stop(id);
        }

        delete this.traces[id];
        delete this.settings[id];

        PluginReporter.clearPluginReports(id);

        await removeFile(`plugins/scripts/${id}.js`);
        await purgeStorage(`plugins/manifests/${id}.json`);
        if (!keepData) await purgeStorage(`plugins/storage/${id}.json`);
    }

    async updateAll() {
        const pluginIds = this.getAllIds();
        const update = (id: string) => this.fetch(this.traces[id].sourceUrl, { id });
        await Promise.allSettled(pluginIds.map(update));
    }
};
