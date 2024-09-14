import { Strings, formatString } from "@core/i18n";
import PluginReporter from "@core/reporter/PluginReporter";
import usePluginStatusColor from "@core/ui/settings/pages/Plugins/usePluginStatusColor";
import { showConfirmationAlert } from "@core/vendetta/ui/alerts";
import PluginManager from "@lib/addons/plugins/PluginManager";
import { findAssetId } from "@lib/api/assets";
import { purgeStorage } from "@lib/api/storage";
import { Codeblock } from "@lib/ui/components";
import { createStyles } from "@lib/ui/styles";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps, findByStoreName } from "@metro";
import { clipboard, tokens } from "@metro/common";
import { ActionSheet, ActionSheetRow, AvatarPile, Button, Card, Stack, TableRow, Text } from "@metro/common/components";
import { hideSheet } from "@ui/sheets";
import { showToast } from "@ui/toasts";
import { ScrollView, View } from "react-native";

import type { PluginInfoActionSheetProps } from "./common";

const { default: Avatar } = lazyDestructure(() => findByProps("AvatarSizes", "getStatusSize"));

const useStyles = createStyles({
    badge: {
        backgroundColor: tokens.colors.CARD_PRIMARY_BG,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        textAlignVertical: "center",
    },
});

function Badges(props: { id: string }) {
    PluginReporter.useReporter();

    const styles = useStyles();
    const stageColor = usePluginStatusColor(props.id);

    const stage = PluginReporter.stages[props.id];
    const isProxied = PluginManager.isProxied(props.id);

    return (
        <View style={{ gap: 8, flexDirection: "row" }}>
            {[{ text: stage, bg: stageColor }, isProxied && { text: "proxied" }]
                .filter((x) => x && typeof x === "object")
                .map((badge) => (
                    <Text
                        variant="eyebrow"
                        color={badge.bg ? "white" : "text-normal"}
                        style={[styles.badge, badge.bg ? { backgroundColor: badge.bg } : null]}
                    >
                        {badge.text}
                    </Text>
                ))}
        </View>
    );
}

export default function PluginInfoActionSheet({ plugin, navigation }: PluginInfoActionSheetProps) {
    plugin.usePluginState();

    const pluginSettings = PluginManager.settings[plugin.id];
    const SettingsComponent = plugin.getPluginSettingsComponent();

    return (
        <ActionSheet>
            <ScrollView style={{ paddingVertical: 8 }} contentContainerStyle={{ gap: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 24 }}>
                    <View style={{ gap: 8 }}>
                        <Text variant="heading-xl/semibold">{plugin.name}</Text>
                        {/* BEHOLD */}
                        {plugin.authors && (
                            <View style={{ flexDirection: "row", gap: 8, marginTop: -4, alignItems: "center" }}>
                                <AvatarPile
                                    size="xxsmall"
                                    names={[plugin.authors?.map((a) => (typeof a !== "string" ? a.name : a))]}
                                    totalCount={plugin.authors?.length}
                                >
                                    {plugin.authors
                                        .filter((a) => typeof a === "object")
                                        .map((a) => (
                                            <Avatar size="xxsmall" user={findByStoreName("UserStore").getUser(a.id)} />
                                        ))}
                                </AvatarPile>
                                <Text variant="text-md/medium" color="text-muted">
                                    {plugin.authors.map((a) => (typeof a === "string" ? a : a.name)).join(", ")}
                                </Text>
                            </View>
                        )}
                        <Badges id={plugin.id} />
                    </View>
                    <View style={{ marginLeft: "auto" }}>
                        {SettingsComponent && (
                            <Button
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
                            />
                        )}
                    </View>
                </View>
                {PluginReporter.errors[plugin.id] && (
                    <Card style={{ gap: 8 }}>
                        <Text color="text-danger" variant="eyebrow">
                            Error
                        </Text>
                        <Text variant="heading-md/normal">An error occured while starting the plugin.</Text>
                        <Codeblock selectable={true}>{String(PluginReporter.getError(plugin.id))}</Codeblock>
                        {/* <Button style={{ marginTop: 4 }} text="See more" onPress={() => {}} /> */}
                    </Card>
                )}
                <Stack spacing={12}>
                    <ActionSheetRow.Group>
                        <ActionSheetRow
                            label={Strings.REFETCH}
                            icon={<TableRow.Icon source={findAssetId("RetryIcon")} />}
                            onPress={async () => {
                                const isEnabled = pluginSettings.enabled;
                                if (isEnabled) PluginManager.stop(plugin.id);

                                try {
                                    await PluginManager.refetch(plugin.id);
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
                                clipboard.setString(PluginManager.traces[plugin.id].sourceUrl);
                                showToast.showCopyToClipboard();
                            }}
                        />
                        <ActionSheetRow
                            label={pluginSettings.autoUpdate ? Strings.DISABLE_UPDATES : Strings.ENABLE_UPDATES}
                            icon={<TableRow.Icon source={findAssetId("DownloadIcon")} />}
                            onPress={() => {
                                pluginSettings.autoUpdate = !pluginSettings.autoUpdate;
                                showToast(
                                    formatString("TOASTS_PLUGIN_UPDATE", {
                                        update: pluginSettings.autoUpdate,
                                        name: plugin.name,
                                    }),
                                    findAssetId("toast_image_saved"),
                                );
                            }}
                        />
                    </ActionSheetRow.Group>
                    <ActionSheetRow.Group>
                        <ActionSheetRow
                            label={Strings.CLEAR_DATA}
                            icon={<TableRow.Icon variant="danger" source={findAssetId("CopyIcon")} />}
                            variant="danger"
                            onPress={() =>
                                showConfirmationAlert({
                                    title: Strings.HOLD_UP,
                                    content: formatString("ARE_YOU_SURE_TO_CLEAR_DATA", { name: plugin.name }),
                                    confirmText: Strings.CLEAR,
                                    cancelText: Strings.CANCEL,
                                    confirmColor: "red",
                                    onConfirm: async () => {
                                        if (pluginSettings.enabled) PluginManager.stop(plugin.id);

                                        try {
                                            await PluginManager.fetch(plugin.id);
                                            showToast(
                                                Strings.PLUGIN_REFETCH_SUCCESSFUL,
                                                findAssetId("toast_image_saved"),
                                            );
                                        } catch {
                                            showToast(Strings.PLUGIN_REFETCH_FAILED, findAssetId("Small"));
                                        }

                                        let message: any[];
                                        try {
                                            purgeStorage(`plugins/storage/${PluginManager.sanitizeId(plugin.id)}.json`);
                                            message = ["CLEAR_DATA_SUCCESSFUL", "trash"];
                                        } catch {
                                            message = ["CLEAR_DATA_FAILED", "Small"];
                                        }

                                        showToast(
                                            formatString(message[0], { name: plugin.name }),
                                            findAssetId(message[1]),
                                        );

                                        if (pluginSettings.enabled) await PluginManager.start(plugin.id);
                                        hideSheet("PluginInfoActionSheet");
                                    },
                                })
                            }
                        />
                        <ActionSheetRow
                            label={Strings.DELETE}
                            variant="danger"
                            icon={<TableRow.Icon variant="danger" source={findAssetId("TrashIcon")} />}
                            onPress={() =>
                                showConfirmationAlert({
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
                                    },
                                })
                            }
                        />
                    </ActionSheetRow.Group>
                </Stack>
            </ScrollView>
        </ActionSheet>
    );
}
