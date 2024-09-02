
import patchChatBackground from "./patches/background";
import patchDefinitionAndResolver from "./patches/resolver";
import patchStorage from "./patches/storage";
import { ColorManifest } from "./types";
import { updateBunnyColor } from "./updater";

export { default as ColorManager } from "./manager";

/** @internal */
export default function initColors(manifest: ColorManifest | null) {
    const patches = [
        patchStorage(),
        patchDefinitionAndResolver(),
        patchChatBackground()
    ];

    if (manifest) updateBunnyColor(manifest, { update: false });

    return () => patches.forEach(p => p());
}
