import { VdPluginManager, VendettaPlugin } from "@core/vendetta/plugins";
import { useProxy } from "@core/vendetta/storage";
import { UnifiedPluginModel } from ".";
import { showToast } from "@lib/ui/toasts";
import { findAssetId } from "@lib/api/assets";

export default function unifyVdPlugin(vdPlugin: VendettaPlugin): UnifiedPluginModel {
    return {
        id: vdPlugin.id,
        name: vdPlugin.manifest.name,
        description: vdPlugin.manifest.description,
        authors: vdPlugin.manifest.authors,
        icon: vdPlugin.manifest.vendetta?.icon,

        getBadges() {
            return [];
        },
        isEnabled: () => vdPlugin.enabled,
        isInstalled: () => Boolean(vdPlugin && VdPluginManager.plugins[vdPlugin.id]),
        usePluginState() {
            useProxy(VdPluginManager.plugins[vdPlugin.id]);
        },
        async toggle(start: boolean) {
            console.log(`[Toggle] Target state: ${start ? 'Enabled' : 'Disabled'} for ${vdPlugin.id}`);
            try {
                if (start) {
                    await VdPluginManager.startPlugin(vdPlugin.id);
                } else {
                    VdPluginManager.stopPlugin(vdPlugin.id);
                }
                console.log(`[Toggle] Success for ${vdPlugin.id}`);
            } catch (e: any) {
                console.error(`[Toggle] Failed for ${vdPlugin.id}`, e);
                showToast(`Failed to toggle: ${e?.message ?? e}`, findAssetId("XSmallIcon"));
                throw e; // rethrow so the card knows it failed
            }
        },
        resolveSheetComponent() {
            return import("../sheets/VdPluginInfoActionSheet");
        },
        getPluginSettingsComponent() {
            return VdPluginManager.getSettings(vdPlugin.id);
        },
    };
}
