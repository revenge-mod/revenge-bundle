import patchPanels from "@ui/settings/patches/panels";
import patchYou from "@ui/settings/patches/you";
import { Lang } from "scripts/lang";

export const lang = new Lang();

export default function initSettings() {
    const patches = [
        patchPanels(),
        patchYou(),
    ]

    return () => patches.forEach(p => p?.());
}
