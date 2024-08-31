import patchChatBackground from "./patches/background";
import patchDefinitionAndResolver from "./patches/resolver";
import patchStorage from "./patches/storage";
import { BunnyColorManifest } from "./types";
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

export default function initColors() {
    const patches = [
        patchStorage(),
        patchDefinitionAndResolver(),
        patchChatBackground()
    ];

    updateBunnyColor(generateRandomBunnyColors(), { update: false });

    return () => patches.forEach(p => p?.());
}
