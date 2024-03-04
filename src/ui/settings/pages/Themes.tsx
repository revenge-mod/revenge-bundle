import settings from "@lib/settings";
import { useProxy } from "@lib/storage";
import { themes } from "@lib/themes";
import { ButtonColors, Theme } from "@types";
import { Button } from "@ui/components";
import AddonPage from "@ui/settings/components/AddonPage";
import ThemeCard from "@ui/settings/components/ThemeCard";

export default function Themes() {
  useProxy(settings);

  return (
    <AddonPage<Theme>
      items={themes}
      safeModeMessage={`You are in Safe Mode, meaning themes have been temporarily disabled.${
        settings.safeMode?.currentThemeId
          ? " If a theme appears to be causing the issue, you can press below to disable it persistently."
          : ""
      }`}
      safeModeExtras={
        settings.safeMode?.currentThemeId ? (
          <Button
            text="Disable Theme"
            color={ButtonColors.BRAND}
            size="small"
            onPress={() => {
              delete settings.safeMode?.currentThemeId;
            }}
            style={{ marginTop: 8 }}
          />
        ) : undefined
      }
      card={ThemeCard}
      keyGetter={(i) =>
        [
          i.id,
          i.data.name,
          i.data.description,
          i.data.authors?.map((x) => x.name)
        ].flat()
      }
    />
  );
}
