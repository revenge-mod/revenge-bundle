import { Strings } from "@core/i18n";
import { connectToDebugger } from "@core/logger/debugger";
import BunnySettings from "@core/storage/BunnySettings";
import { CheckState, useFileExists } from "@core/ui/hooks/useFS";
import AssetBrowser from "@core/ui/settings/pages/Developer/AssetBrowser";
import { findAssetId } from "@lib/api/assets";
import { LOADER_IDENTITY } from "@lib/api/native/loader";
import { lazyDestructure } from "@lib/utils/lazy";
import { NavigationNative, tokens } from "@metro/common";
import {
    Button,
    LegacyFormText,
    Stack,
    TableRow,
    TableRowGroup,
    TableSwitchRow,
    TextInput,
} from "@metro/common/components";
import { findByProps } from "@metro/wrappers";
import { ErrorBoundary } from "@ui/components";
import { TextStyleSheet, createStyles } from "@ui/styles";
import { ScrollView, StyleSheet } from "react-native";

const { hideActionSheet } = lazyDestructure(() => findByProps("openLazy", "hideActionSheet"));
const { showSimpleActionSheet } = lazyDestructure(() => findByProps("showSimpleActionSheet"));

const RDT_EMBED_LINK = "https://raw.githubusercontent.com/amsyarasyiq/rdt-embedder/main/dist.js";

const useStyles = createStyles({
    leadingText: {
        ...TextStyleSheet["heading-md/semibold"],
        color: tokens.colors.TEXT_MUTED,
        marginRight: -4,
    },
});

export default function Developer() {
    const [rdtFileExists, fs] = useFileExists("preloads/reactDevtools.js");

    const styles = useStyles();
    const navigation = NavigationNative.useNavigation();

    BunnySettings.useSettings();

    return (
        <ErrorBoundary>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
                <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                    <TextInput
                        label={Strings.DEBUGGER_URL}
                        placeholder="127.0.0.1:9090"
                        size="md"
                        leadingIcon={() => <LegacyFormText style={styles.leadingText}>ws://</LegacyFormText>}
                        defaultValue={BunnySettings.developer.debuggerUrl}
                        onChange={(v: string) => (BunnySettings.developer.debuggerUrl = v)}
                    />
                    <TableRowGroup title={Strings.DEBUG}>
                        <TableRow
                            label={Strings.CONNECT_TO_DEBUG_WEBSOCKET}
                            icon={<TableRow.Icon source={findAssetId("copy")} />}
                            onPress={() => connectToDebugger(BunnySettings.developer.debuggerUrl)}
                        />
                        {LOADER_IDENTITY.features.rdt && (
                            <TableRow
                                label={Strings.CONNECT_TO_REACT_DEVTOOLS}
                                icon={<TableRow.Icon source={findAssetId("ic_badge_staff")} />}
                                onPress={() =>
                                    LOADER_IDENTITY.features.rdt?.exports?.connectToDevTools({
                                        host: BunnySettings.developer.debuggerUrl.split(":")?.[0],
                                        resolveRNStyle: StyleSheet.flatten,
                                    })
                                }
                            />
                        )}
                    </TableRowGroup>
                    {LOADER_IDENTITY.features.loaderConfig && (
                        <TableRowGroup title="Loader config">
                            <TableSwitchRow
                                label={Strings.LOAD_FROM_CUSTOM_URL}
                                subLabel={Strings.LOAD_FROM_CUSTOM_URL_DEC}
                                icon={<TableRow.Icon source={findAssetId("copy")} />}
                                value={BunnySettings.loader.customLoadUrl.enabled}
                                onValueChange={(v: boolean) => {
                                    BunnySettings.loader.customLoadUrl.enabled = v;
                                }}
                            />
                            {BunnySettings.loader.customLoadUrl.enabled && (
                                <TableRow
                                    label={
                                        <TextInput
                                            defaultValue={BunnySettings.loader.customLoadUrl.url}
                                            size="md"
                                            onChange={(v: string) => (BunnySettings.loader.customLoadUrl.url = v)}
                                            placeholder="http://localhost:4040/vendetta.js"
                                            label={Strings.BUNNY_URL}
                                        />
                                    }
                                />
                            )}
                        </TableRowGroup>
                    )}
                    <TableRowGroup title="Other">
                        <TableRow
                            arrow
                            label={Strings.ASSET_BROWSER}
                            icon={<TableRow.Icon source={findAssetId("ic_image")} />}
                            trailing={TableRow.Arrow}
                            onPress={() =>
                                navigation.push("BUNNY_CUSTOM_PAGE", {
                                    title: Strings.ASSET_BROWSER,
                                    render: AssetBrowser,
                                })
                            }
                        />
                        <TableRow
                            arrow
                            label={Strings.ERROR_BOUNDARY_TOOLS_LABEL}
                            icon={<TableRow.Icon source={findAssetId("ic_warning_24px")} />}
                            onPress={() =>
                                showSimpleActionSheet({
                                    key: "ErrorBoundaryTools",
                                    header: {
                                        title: "Which ErrorBoundary do you want to trip?",
                                        icon: (
                                            <TableRow.Icon
                                                style={{ marginRight: 8 }}
                                                source={findAssetId("ic_warning_24px")}
                                            />
                                        ),
                                        onClose: () => hideActionSheet(),
                                    },
                                    options: [
                                        // @ts-expect-error
                                        // Of course, to trigger an error, we need to do something incorrectly. The below will do!
                                        {
                                            label: Strings.BUNNY,
                                            onPress: () =>
                                                navigation.push("BUNNY_CUSTOM_PAGE", { render: () => <undefined /> }),
                                        },
                                        {
                                            label: "Discord",
                                            isDestructive: true,
                                            onPress: () =>
                                                navigation.push("BUNNY_CUSTOM_PAGE", { noErrorBoundary: true }),
                                        },
                                    ],
                                })
                            }
                        />
                        <TableRow
                            label={Strings.INSTALL_REACT_DEVTOOLS}
                            subLabel={Strings.RESTART_REQUIRED_TO_TAKE_EFFECT}
                            icon={<TableRow.Icon source={findAssetId("DownloadIcon")} />}
                            trailing={
                                <Button
                                    size="sm"
                                    loading={rdtFileExists === CheckState.LOADING}
                                    disabled={rdtFileExists === CheckState.LOADING}
                                    variant={rdtFileExists === CheckState.TRUE ? "secondary" : "primary"}
                                    text={rdtFileExists === CheckState.TRUE ? Strings.UNINSTALL : Strings.INSTALL}
                                    onPress={async () => {
                                        if (rdtFileExists === CheckState.FALSE) {
                                            fs.downloadFile(RDT_EMBED_LINK, "preloads/reactDevtools.js");
                                        } else if (rdtFileExists === CheckState.TRUE) {
                                            fs.removeFile("preloads/reactDevtools.js");
                                        }
                                    }}
                                    icon={findAssetId(
                                        rdtFileExists === CheckState.TRUE ? "ic_message_delete" : "DownloadIcon",
                                    )}
                                    style={{ marginLeft: 8 }}
                                />
                            }
                        />
                        <TableSwitchRow
                            label={Strings.ENABLE_EVAL_COMMAND}
                            subLabel={Strings.ENABLE_EVAL_COMMAND_DESC}
                            icon={<TableRow.Icon source={findAssetId("PencilIcon")} />}
                            value={BunnySettings.developer.evalCommandEnabled}
                            onValueChange={(v: boolean) => {
                                BunnySettings.developer.evalCommandEnabled = v;
                            }}
                        />
                    </TableRowGroup>
                </Stack>
            </ScrollView>
        </ErrorBoundary>
    );
}
