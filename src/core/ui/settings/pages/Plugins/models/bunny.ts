import { PyoncordIcon } from "@core/ui/settings";
import { disablePlugin, enablePlugin, getPluginSettingsComponent, isPluginEnabled, pluginSettings } from "@lib/addons/plugins";
import { BunnyPluginManifest } from "@lib/addons/plugins/types";
import { useObservable } from "@lib/api/storage";

import { UnifiedPluginModel } from ".";
import { findAssetId } from "@lib/api/assets";
import { showToast } from "@lib/ui/toasts";

export default function unifyBunnyPlugin(manifest: BunnyPluginManifest): UnifiedPluginModel {
    return {
        id: manifest.id,
        name: manifest.display.name,
        description: manifest.display.description,
        authors: manifest.display.authors,

        getBadges() {
            return [
                { source: { uri: PyoncordIcon } },
                // { source: findAssetId("CheckmarkLargeBoldIcon")! }
            ];
        },
        isEnabled: () => isPluginEnabled(manifest.id),
        isInstalled: () => manifest.id in pluginSettings,
        usePluginState() {
            useObservable([pluginSettings]);
        },
        async toggle(start: boolean) {
            try {
							start
									? await enablePlugin(manifest.id, true)
									: disablePlugin(manifest.id);
            } catch (e: any) {
                console.error(`Failed to toggle (${start?"enable":"disable"}) plugin`, e);
                showToast(`Failed to toggle (${start?"enable":"disable"}) plugin: ${e?.message ?? e}`, findAssetId("XSmallIcon"));
            }
        },
        resolveSheetComponent() {
            return import("../sheets/PluginInfoActionSheet");
        },
        getPluginSettingsComponent() {
            return getPluginSettingsComponent(manifest.id);
        },
    };
}
