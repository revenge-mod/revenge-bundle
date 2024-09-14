import BunnySettings from "@core/storage/BunnySettings";
import { ColorManager } from "@lib/addons/themes/colors";
import { RTNBundleUpdaterManager } from "@lib/api/native/rn-modules";

export async function toggleSafeMode({ to = !BunnySettings.general.safeModeEnabled, reload = true } = {}) {
    const enabled = (BunnySettings.general.safeModeEnabled = to);
    const currentColor = ColorManager.getCurrentManifest();
    await ColorManager.writeForNative(enabled ? null : currentColor);
    if (reload) setTimeout(() => RTNBundleUpdaterManager.reload(), 500);
}
