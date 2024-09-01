import patchChatBackground from "./patches/background";
import patchDefinitionAndResolver from "./patches/resolver";
import patchStorage from "./patches/storage";
import { BunnyColorManifest, ColorManifest } from "./types";
import { updateBunnyColor } from "./updater";

function generateRandomBunnyColors(): BunnyColorManifest {
    return {
        "type": "dark",
        "id": `${Math.random()}`,
        "spec": 3,
        "display": {
            "name": `${Math.random()}`,
            "description": `${Math.random()}`,
            "authors": []
        },
        "semantic": {},
        "raw": {}
    };
}

export default function initColors(manifest: ColorManifest | null) {
    const patches = [
        patchStorage(),
        patchDefinitionAndResolver(),
        patchChatBackground()
    ];

    if (manifest) updateBunnyColor(manifest, { update: false });

    return () => patches.forEach(p => p());
}
