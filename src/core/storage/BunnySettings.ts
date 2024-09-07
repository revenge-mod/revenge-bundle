import { awaitStorage, createStorage, migrateToNewStorage, useObservable } from "@lib/api/storage";

interface VendettaSettings {
    debuggerUrl: string;
    developerSettings: boolean;
    enableDiscordDeveloperSettings: boolean;
    safeMode?: {
        enabled: boolean;
        currentThemeId?: string;
    };
    enableEvalCommand?: boolean;
}

interface GeneralSettings {
    patchIsStaff: boolean;
    safeModeEnabled: boolean;
}

interface DeveloperSettings {
    enabled: boolean
    debuggerUrl: string;
    evalCommandEnabled: boolean;
}

interface LoaderSettings {
    customLoadUrl: {
        enabled: boolean;
        url: string;
    };
}

export default {
    general: createStorage<GeneralSettings>("settings/general.json"),
    developer: createStorage<DeveloperSettings>("settings/developer.json"),
    loader: createStorage<LoaderSettings>("loader.json", {
        dflt: {
            customLoadUrl: {
                enabled: false,
                url: "http://localhost:4040/bunny.js"
            }
        }
    }),

    async prepare() {
        awaitStorage(this.general, this.developer, this.loader);
        await migrateToNewStorage("VENDETTA_SETTINGS", (vdSettings: VendettaSettings) => {
            this.general.patchIsStaff = vdSettings.enableDiscordDeveloperSettings;
            this.general.safeModeEnabled = vdSettings.safeMode?.enabled ?? false;
            this.developer.enabled = vdSettings.developerSettings;
            this.developer.debuggerUrl = vdSettings.debuggerUrl;
            this.developer.evalCommandEnabled = vdSettings.enableEvalCommand ?? false;
        });
    },

    useSettings() {
        useObservable(this.general, this.developer, this.loader);
    },

    isSafeMode() {
        return this.general.safeModeEnabled ?? false;
    },
};
