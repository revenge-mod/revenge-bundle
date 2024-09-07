import { formatString, Strings } from "@core/i18n";
import BunnySettings from "@core/storage/BunnySettings";
import AddonPage from "@core/ui/components/AddonPage";
import ThemeCard from "@core/ui/settings/pages/Themes/ThemeCard";
import ColorManager from "@lib/addons/themes/colors/ColorManager";
import { updateBunnyColor } from "@lib/addons/themes/colors/updater";
import { Author } from "@lib/addons/types";
import { findAssetId } from "@lib/api/assets";
import { useObservable } from "@lib/api/storage";
import { ActionSheet, BottomSheetTitleHeader, Button, TableRadioGroup, TableRadioRow, TableRowIcon } from "@metro/common/components";
import { View } from "react-native";


export default function Themes() {
    BunnySettings.useSettings();
    useObservable([ColorManager.infos, ColorManager.preferences]);

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
                message: formatString("SAFE_MODE_NOTICE_THEMES", { enabled: Boolean(ColorManager.preferences.selected) }),
                footer: ColorManager.preferences.selected && <Button
                    size="small"
                    text={Strings.DISABLE_THEME}
                    onPress={() => ColorManager.select(null)}
                    style={{ marginTop: 8 }}
                />
            }}
            CardComponent={ThemeCard}
            OptionsActionSheetComponent={() => {
                useObservable([ColorManager.preferences]);

                return <ActionSheet>
                    <BottomSheetTitleHeader title="Options" />
                    <View style={{ paddingVertical: 20, gap: 12 }}>
                        <TableRadioGroup
                            title="Override Theme Type"
                            value={ColorManager.preferences.type ?? "auto"}
                            hasIcons={true}
                            onChange={(type: "auto" | "dark" | "light") => {
                                ColorManager.preferences.type = type !== "auto" ? type : undefined;
                                updateBunnyColor(ColorManager.getCurrentManifest(), { update: true });
                            }}
                        >
                            <TableRadioRow icon={<TableRowIcon source={findAssetId("RobotIcon")} />} label="Auto" value="auto" />
                            <TableRadioRow icon={<TableRowIcon source={findAssetId("ThemeDarkIcon")} />} label="Dark" value="dark" />
                            <TableRadioRow icon={<TableRowIcon source={findAssetId("ThemeLightIcon")} />} label="Light" value="light" />
                        </TableRadioGroup>
                        <TableRadioGroup
                            title="Chat Background"
                            value={ColorManager.preferences.customBackground ?? "shown"}
                            hasIcons={true}
                            onChange={(type: "shown" | "hidden") => {
                                ColorManager.preferences.customBackground = type !== "shown" ? type : null;
                            }}
                        >
                            <TableRadioRow icon={<TableRowIcon source={findAssetId("ImageIcon")} />} label="Show" value={"shown"} />
                            <TableRadioRow icon={<TableRowIcon source={findAssetId("DenyIcon")} />} label="Hide" value={"hidden"} />
                        </TableRadioGroup>
                    </View>
                </ActionSheet>;
            }}
        />
    );
}
