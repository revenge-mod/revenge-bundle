import { Strings } from "@core/i18n";
import BunnySettings from "@core/storage/BunnySettings";
import AddonPage from "@core/ui/components/AddonPage";
import FontEditor from "@core/ui/settings/pages/Fonts/FontEditor";
import FontManager from "@lib/addons/fonts/FontManager";
import { FontManifest } from "@lib/addons/fonts/types";
import { useObservable } from "@lib/api/storage";
import { NavigationNative } from "@metro/common";

import FontCard from "./FontCard";

export default function Fonts() {
    BunnySettings.useSettings();
    useObservable([FontManager.preferences, FontManager.traces]);

    const navigation = NavigationNative.useNavigation();

    return (
        <AddonPage<FontManifest>
            title={Strings.FONTS}
            searchKeywords={["display.name"]}
            sortOptions={{
                "Name (A-Z)": (a, b) => a.display.name.localeCompare(b.display.name),
                "Name (Z-A)": (a, b) => b.display.name.localeCompare(a.display.name)
            }}
            items={FontManager.getAllIds()}
            resolveItem={id => FontManager.getManifest(id)}
            safeModeHint={{ message: Strings.SAFE_MODE_NOTICE_FONTS }}
            CardComponent={FontCard}
            installAction={{
                label: "Install a font",
                onPress: () => {
                    navigation.push("BUNNY_CUSTOM_PAGE", {
                        title: "Import Font",
                        render: () => <FontEditor />
                    });
                }
            }}
        />
    );
}
