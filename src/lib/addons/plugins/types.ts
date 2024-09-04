import { BunnyManifest } from "@lib/addons/types";
import { createStorage } from "@lib/api/storage";
import { Logger } from "@core/logger";

export interface PluginRepo {
    [id: string]: {
        version: string;

        // For plugin developing convenience, plugins with this on will always get fetched
        alwaysFetch?: boolean;
    };
}

export interface PluginRepoStorage {
    [repoUrl: string]: PluginRepo;
}

export interface PluginSettingsStorage {
    [pluginId: string]: {
        enabled: boolean;
        autoUpdate: boolean;
    };
}

export interface PluginInformationStorage {
    [pluginId: string]: {
        sourceUrl: string;
        installTime: string | null;
        isVendetta?: boolean;
    }
}

export interface BunnyPluginManifest extends BunnyManifest {
    main: string;
    hash: string;
}

export interface BunnyPluginManifestInternal extends BunnyPluginManifest {
    readonly parentRepository: string;
    readonly jsPath?: string;
}

export interface PluginInstance {
    start?(): void;
    stop?(): void;
    SettingsComponent?(): JSX.Element;
}

export interface PluginInstanceInternal extends PluginInstance {
    readonly manifest: BunnyPluginManifest;
}

export interface BunnyPluginProperty {
    readonly logger: Logger;
    readonly manifest: BunnyPluginManifestInternal;
    createStorage<T>(): ReturnType<typeof createStorage<T>>;
}

export type BunnyPluginObject = typeof window.bunny & {
    plugin: BunnyPluginProperty;
};
