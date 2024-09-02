import { formatString, Strings } from "@core/i18n";
import PluginManager from "@lib/addons/plugins/manager";
import { findAssetId } from "@lib/api/assets";
import { purgeStorage } from "@lib/api/storage";
import { clipboard } from "@metro/common";
import { ActionSheet, ActionSheetRow, Button, Stack, TableRow, Text } from "@metro/common/components";
import { showConfirmationAlert } from "@ui/alerts";
import { hideSheet } from "@ui/sheets";
import { showToast } from "@ui/toasts";
import { ScrollView, View } from "react-native";

import { PluginInfoActionSheetProps } from "./common";

export default function PluginInfoActionSheet({ plugin, navigation }: PluginInfoActionSheetProps) {
    plugin.usePluginState();

    const pluginSettings = PluginManager.settings[plugin.id];
    const SettingsComponent = plugin.getPluginSettingsComponent();

    return <ActionSheet>
        <ScrollView style={{ paddingVertical: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 24 }}>
                <Text variant="heading-xl/semibold">
                    {plugin.name}
                </Text>
                <View style={{ marginLeft: "auto" }}>
                    {SettingsComponent && <Button
                        size="md"
                        text="Configure"
                        variant="secondary"
                        icon={findAssetId("WrenchIcon")}
                        onPress={() => {
                            hideSheet("PluginInfoActionSheet");
                            navigation.push("BUNNY_CUSTOM_PAGE", {
                                title: plugin.name,
                                render: SettingsComponent,
                            });
                        }}
                    />}
                </View>
            </View>
            <Stack spacing={12}>
                <ActionSheetRow.Group>
                    <ActionSheetRow
                        label={Strings.REFETCH}
                        icon={<TableRow.Icon source={findAssetId("RetryIcon")} />}
                        onPress={async () => {
                            const isEnabled = pluginSettings.enabled;
                            if (isEnabled) PluginManager.stop(plugin.id);

                            try {
                                await PluginManager.fetch(plugin.id);
                                showToast(Strings.PLUGIN_REFETCH_SUCCESSFUL, findAssetId("toast_image_saved"));
                            } catch {
                                showToast(Strings.PLUGIN_REFETCH_FAILED, findAssetId("Small"));
                            }

                            if (isEnabled) await PluginManager.start(plugin.id);
                            hideSheet("PluginInfoActionSheet");
                        }}
                    />
                    <ActionSheetRow
                        label={Strings.COPY_URL}
                        icon={<TableRow.Icon source={findAssetId("LinkIcon")} />}
                        onPress={() => {
                            clipboard.setString(PluginManager.infos[plugin.id].sourceUrl);
                            showToast.showCopyToClipboard();
                        }}
                    />
                    <ActionSheetRow
                        label={pluginSettings.autoUpdate ? Strings.DISABLE_UPDATES : Strings.ENABLE_UPDATES}
                        icon={<TableRow.Icon source={findAssetId("DownloadIcon")} />}
                        onPress={() => {
                            pluginSettings.autoUpdate = !pluginSettings.autoUpdate;
                            showToast(formatString("TOASTS_PLUGIN_UPDATE", {
                                update: pluginSettings.autoUpdate,
                                name: plugin.name
                            }), findAssetId("toast_image_saved"));
                        }}
                    />
                </ActionSheetRow.Group>
                <ActionSheetRow.Group>
                    <ActionSheetRow
                        label={Strings.CLEAR_DATA}
                        icon={<TableRow.Icon variant="danger" source={findAssetId("CopyIcon")} />}
                        variant="danger"
                        onPress={() => showConfirmationAlert({
                            title: Strings.HOLD_UP,
                            content: formatString("ARE_YOU_SURE_TO_CLEAR_DATA", { name: plugin.name }),
                            confirmText: Strings.CLEAR,
                            cancelText: Strings.CANCEL,
                            confirmColor: "red",
                            onConfirm: async () => {
                                if (pluginSettings.enabled) PluginManager.stop(plugin.id);

                                try {
                                    await PluginManager.fetch(plugin.id);
                                    showToast(Strings.PLUGIN_REFETCH_SUCCESSFUL, findAssetId("toast_image_saved"));
                                } catch {
                                    showToast(Strings.PLUGIN_REFETCH_FAILED, findAssetId("Small"));
                                }

                                let message: any[];
                                try {
                                    purgeStorage(plugin.id);
                                    message = ["CLEAR_DATA_SUCCESSFUL", "trash"];
                                } catch {
                                    message = ["CLEAR_DATA_FAILED", "Small"];
                                }

                                showToast(
                                    formatString(message[0], { name: plugin.name }),
                                    findAssetId(message[1])
                                );

                                if (pluginSettings.enabled) await PluginManager.start(plugin.id);
                                hideSheet("PluginInfoActionSheet");
                            }
                        })}
                    />
                    <ActionSheetRow
                        label={Strings.DELETE}
                        variant="danger"
                        icon={<TableRow.Icon variant="danger" source={findAssetId("TrashIcon")} />}
                        onPress={() => showConfirmationAlert({
                            title: Strings.HOLD_UP,
                            content: formatString("ARE_YOU_SURE_TO_DELETE_PLUGIN", { name: plugin.name }),
                            confirmText: Strings.DELETE,
                            cancelText: Strings.CANCEL,
                            confirmColor: "red",
                            onConfirm: async () => {
                                try {
                                    await PluginManager.uninstall(plugin.id);
                                } catch (e) {
                                    showToast(String(e), findAssetId("Small"));
                                }
                                hideSheet("PluginInfoActionSheet");
                            }
                        })}
                    />
                </ActionSheetRow.Group>
            </Stack>
        </ScrollView>
    </ActionSheet>;
}
