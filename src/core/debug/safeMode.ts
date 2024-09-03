import BunnySettings from "@core/storage/BunnySettings";
import { ColorManager } from "@lib/addons/themes/colors";
import { RTNBundleUpdaterManager } from "@lib/api/native/rn-modules";

export async function toggleSafeMode(to?: boolean) {
    const enabled = BunnySettings.general.safeModeEnabled = (to ?? !BunnySettings.general.safeModeEnabled);
    const currentColor = ColorManager.getCurrentManifest();
    await ColorManager.writeForNative(enabled ? null : currentColor);
    RTNBundleUpdaterManager.reload();
}
