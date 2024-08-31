import { convertToInternalDef, setThemeRef } from "./internalRef";
import patchChatBackground from "./patches/background";
import patchDefinitionAndResolver from "./patches/resolver";
import patchStorage from "./patches/storage";
import { BunnyColorManifest } from "./types";

function generateRandomBunnyTheme(): BunnyColorManifest {
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

    const int = convertToInternalDef(generateRandomBunnyTheme());
    setThemeRef(int, { update: false });

    return () => patches.forEach(p => p?.());
}
