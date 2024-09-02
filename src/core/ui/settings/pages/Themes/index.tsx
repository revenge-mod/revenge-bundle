import { formatString, Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import ThemeCard from "@core/ui/settings/pages/Themes/ThemeCard";
import ColorManager from "@lib/addons/themes/colors/manager";
import { Author } from "@lib/addons/types";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { useProxy as useNewProxy } from "@lib/api/storage/new";
import { Button } from "@metro/common/components";


export default function Themes() {
    useProxy(settings);
    useNewProxy(ColorManager.infos);
    useNewProxy(ColorManager.preferences);

    return (
        <AddonPage<ReturnType<typeof ColorManager.getDisplayInfo>>
            title={Strings.THEMES}
            searchKeywords={[
                "name",
                "description",
                p => p.authors?.map((a: Author) => a.name).join(", ") ?? "unknown"
            ]}
            sortOptions={{
                "Name (A-Z)": (a, b) => a.name.localeCompare(b.name),
                "Name (Z-A)": (a, b) => b.name.localeCompare(a.name)
            }}
            installAction={{
                label: "Install a theme",
                fetchFn: (url: string) => ColorManager.install(url)
            }}
            items={ColorManager.getAllIds()}
            resolveItem={id => ColorManager.getDisplayInfo(id)}
            safeModeHint={{
                message: formatString("SAFE_MODE_NOTICE_THEMES", { enabled: Boolean(settings.safeMode?.currentThemeId) }),
                footer: settings.safeMode?.currentThemeId && <Button
                    size="small"
                    text={Strings.DISABLE_THEME}
                    onPress={() => delete settings.safeMode?.currentThemeId}
                    style={{ marginTop: 8 }}
                />
            }}
            CardComponent={ThemeCard}
        />
    );
}
