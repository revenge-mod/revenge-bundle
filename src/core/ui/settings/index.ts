import PyoncordIcon from "@assets/icons/revenge.png";
import { Strings } from "@core/i18n";
import BunnySettings from "@core/storage/BunnySettings";
import { findAssetId } from "@lib/api/assets";
import { LOADER_IDENTITY } from "@lib/api/native/loader";
import { registerSection } from "@ui/settings";
import { version } from "bunny-build-info";

export { PyoncordIcon };

export default function initSettings() {
    registerSection({
        name: "Bunny",
        items: [
            {
                key: "BUNNY",
                title: () => Strings.BUNNY,
                icon: { uri: PyoncordIcon },
                render: () => import("@core/ui/settings/pages/General"),
                rawTabsConfig: {
                    useTrailing: () => `(${version})`,
                },
            },
            {
                key: "BUNNY_PLUGINS",
                title: () => Strings.PLUGINS,
                icon: findAssetId("ActivitiesIcon"),
                render: () => import("@core/ui/settings/pages/Plugins"),
            },
            {
                key: "BUNNY_THEMES",
                title: () => Strings.THEMES,
                icon: findAssetId("PaintPaletteIcon"),
                render: () => import("@core/ui/settings/pages/Themes"),
                usePredicate: () => LOADER_IDENTITY.features.themes != null,
            },
            {
                key: "BUNNY_FONTS",
                title: () => Strings.FONTS,
                icon: findAssetId("ic_add_text"),
                render: () => import("@core/ui/settings/pages/Fonts"),
                usePredicate: () => LOADER_IDENTITY.features.fonts != null,
            },
            {
                key: "BUNNY_DEVELOPER",
                title: () => Strings.DEVELOPER,
                icon: findAssetId("WrenchIcon"),
                render: () => import("@core/ui/settings/pages/Developer"),
                usePredicate: () => {
                    BunnySettings.useSettings();
                    return BunnySettings.developer.enabled ?? false;
                },
            },
        ],
    });

    // Compat for plugins which injects into the settings
    // Flaw: in the old UI, this will be displayed anyway with no items
    registerSection({
        name: "Vendetta",
        items: [],
    });
}
