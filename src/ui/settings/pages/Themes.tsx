import { Theme, ButtonColors } from "@types";
import { useProxy } from "@lib/storage";
import { themes } from "@lib/themes";
import { Button } from "@ui/components";
import settings from "@lib/settings";
import AddonPage from "@ui/settings/components/AddonPage";
import ThemeCard from "@ui/settings/components/ThemeCard";
import { lang } from "..";

export default function Themes() {
    useProxy(settings);

    return (
        <AddonPage<Theme>
            items={themes}
            safeModeMessage={`${lang.format("theme.safemode", {})}${settings.safeMode?.currentThemeId ? lang.format("theme.safemode.disable", {}) : ""}`}
            safeModeExtras={settings.safeMode?.currentThemeId ? <Button
                text={lang.format("theme.disable", {})}
                color={ButtonColors.BRAND}
                size="small"
                onPress={() => {
                    delete settings.safeMode?.currentThemeId;
                }}
                style={{ marginTop: 8 }}
            /> : undefined}
            card={ThemeCard}
            keyGetter={(i) =>
                [
                    i.id,
                    i.data.name,
                    i.data.description,
                    i.data.authors?.map((x) => x.name),
                ].flat()
            }
        />
    )
}