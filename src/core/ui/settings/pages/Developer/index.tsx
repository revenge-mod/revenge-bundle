import { Strings } from "@core/i18n";
import { CheckState, useFileExists } from "@core/ui/hooks/useFS";
import AssetBrowser from "@core/ui/settings/pages/Developer/AssetBrowser";
import { useProxy } from "@core/vendetta/storage";
import { findAssetId } from "@lib/api/assets";
import { connectToDebugger, connectToReactDevTools } from "@lib/api/debug";
import { disconnectDt, useIsDtConnected } from "@lib/api/debug/devtools";
import { disconnectRdt, useIsRdtConnected } from "@lib/api/debug/react";
import { getReactDevToolsVersion, isLoaderConfigSupported, isReactDevToolsPreloaded, isVendettaLoader } from "@lib/api/native/loader";
import { loaderConfig, settings } from "@lib/api/settings";
import { showToast } from "@lib/ui/toasts";
import { lazyDestructure } from "@lib/utils/lazy";
import { NavigationNative } from "@metro/common";
import { Button, LegacyFormText, Stack, TableRow, TableRowGroup, TableSwitchRow, TextInput } from "@metro/common/components";
import { findByProps } from "@metro/wrappers";
import { DevToolsClient } from "@revenge-mod/devtools-client";
import { semanticColors } from "@ui/color";
import { ErrorBoundary } from "@ui/components";
import { createStyles, TextStyleSheet } from "@ui/styles";
import { NativeModules } from "react-native";
import { ScrollView } from "react-native";

const { hideActionSheet } = lazyDestructure(() => findByProps("openLazy", "hideActionSheet"));
const { showSimpleActionSheet } = lazyDestructure(() => findByProps("showSimpleActionSheet"));
const { openAlert } = lazyDestructure(() => findByProps("openAlert", "dismissAlert"));
const { AlertModal, AlertActionButton } = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

const RDT_EMBED_LINK = "https://github.com/revenge-mod/react-devtools-core/releases/latest/download/index.bundle";

const useStyles = createStyles({
    leadingText: {
        ...TextStyleSheet["heading-md/semibold"],
        color: semanticColors.TEXT_MUTED,
        marginRight: -4
    },
});

export default function Developer() {
    const [rdtFileExists, fs] = useFileExists("preloads/reactDevtools.js");
    const dtConnected = useIsDtConnected();
    const rdtConnected = useIsRdtConnected();

    const styles = useStyles();
    const navigation = NavigationNative.useNavigation();

    useProxy(settings);
    useProxy(loaderConfig);

    return (
        <ErrorBoundary>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
                <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                    <TextInput
                        label={Strings.DEBUGGER_URL}
                        placeholder="localhost:7864"
                        size="md"
                        leadingIcon={() => <LegacyFormText style={styles.leadingText}>ws://</LegacyFormText>}
                        defaultValue={settings.debuggerUrl}
                        onChange={(v: string) => settings.debuggerUrl = v}
                    />
                    <TableRowGroup title={Strings.DEBUG}>
                        <TableSwitchRow
                            label={Strings.DEBUGGER_AUTOCONNECT}
                            subLabel={Strings.DEBUGGER_AUTOCONNECT_DESC}
                            icon={<TableRow.Icon source={findAssetId("BookmarkIcon")} />}
                            value={!!settings.enableAutoDebugger}
                            onValueChange={(v: boolean) => {
                                settings.enableAutoDebugger = v;
                            }}
                        />
                        <TableRow
                            label={dtConnected ? Strings.DISCONNECT_FROM_DEBUG_WEBSOCKET : Strings.CONNECT_TO_DEBUG_WEBSOCKET}
                            subLabel={`Version ${DevToolsClient.version}`}
                            icon={<TableRow.Icon source={findAssetId(dtConnected ? "DenyIcon" : "LinkIcon")} />}
                            onPress={() => dtConnected ? disconnectDt() : connectToDebugger(settings.debuggerUrl)}
                        />
                        {isReactDevToolsPreloaded() && <>
                            <TableRow
                                label={rdtConnected ? Strings.DISCONNECT_FROM_REACT_DEVTOOLS : Strings.CONNECT_TO_REACT_DEVTOOLS}
                                subLabel={`Version ${getReactDevToolsVersion()}`}
                                icon={<TableRow.Icon source={findAssetId(rdtConnected ? "DenyIcon" : "StaffBadgeIcon")} />}
                                onPress={() => rdtConnected ? disconnectRdt() : connectToReactDevTools(settings.debuggerUrl)}
                            />
                        </>}
                    </TableRowGroup>
                    {isLoaderConfigSupported() && <>
                        <TableRowGroup title="Loader config">
                            <TableSwitchRow
                                label={Strings.LOAD_FROM_CUSTOM_URL}
                                subLabel={Strings.LOAD_FROM_CUSTOM_URL_DEC}
                                icon={<TableRow.Icon source={findAssetId("LinkIcon")} />}
                                value={loaderConfig.customLoadUrl.enabled}
                                onValueChange={(v: boolean) => {
                                    loaderConfig.customLoadUrl.enabled = v;
                                }}
                            />
                            {loaderConfig.customLoadUrl.enabled && <TableRow label={<TextInput
                                defaultValue={loaderConfig.customLoadUrl.url}
                                size="md"
                                onChange={(v: string) => loaderConfig.customLoadUrl.url = v}
                                placeholder="http://localhost:4040/revenge.js"
                                label={Strings.BUNNY_URL}
                            />} />}
                            {isReactDevToolsPreloaded() && isVendettaLoader() && <TableSwitchRow
                                label={Strings.LOAD_REACT_DEVTOOLS}
                                subLabel={`${Strings.VERSION}: ${getReactDevToolsVersion()}`}
                                icon={<TableRow.Icon source={findAssetId("StaffBadgeIcon")} />}
                                value={loaderConfig.loadReactDevTools}
                                onValueChange={(v: boolean) => {
                                    loaderConfig.loadReactDevTools = v;
                                }}
                            />}
                        </TableRowGroup>
                    </>}
                    <TableRowGroup title="Other">
                        <TableRow
                            label={Strings.CLEAR_BUNDLE}
                            subLabel={Strings.CLEAR_BUNDLE_DESC}
                            icon={<TableRow.Icon source={findAssetId("TrashIcon")} variant="danger" />}
                            onPress={() => {
                                openAlert("revenge-clear-bundle-reload-confirmation", <AlertModal
                                    title={Strings.MODAL_RELOAD_REQUIRED}
                                    content={Strings.MODAL_RELOAD_REQUIRED_DESC}
                                    actions={
                                        <Stack>
                                            <AlertActionButton text={Strings.RELOAD} variant="destructive" onPress={() => NativeModules.BundleUpdaterManager.reload()} />
                                            <AlertActionButton text={Strings.CANCEL} variant="secondary" />
                                        </Stack>
                                    }
                                />);
                            }}
                            variant="danger"
                        />
                        <TableRow
                            arrow
                            label={Strings.ASSET_BROWSER}
                            icon={<TableRow.Icon source={findAssetId("ImageIcon")} />}
                            trailing={TableRow.Arrow}
                            onPress={() => navigation.push("BUNNY_CUSTOM_PAGE", {
                                title: Strings.ASSET_BROWSER,
                                render: AssetBrowser,
                            })}
                        />
                        <TableRow
                            arrow
                            label={Strings.ERROR_BOUNDARY_TOOLS_LABEL}
                            icon={<TableRow.Icon source={findAssetId("WarningIcon")} />}
                            onPress={() => showSimpleActionSheet({
                                key: "ErrorBoundaryTools",
                                header: {
                                    title: "Which ErrorBoundary do you want to trip?",
                                    icon: <TableRow.Icon style={{ marginRight: 8 }} source={findAssetId("WarningIcon")} />,
                                    onClose: () => hideActionSheet(),
                                },
                                options: [
                                    // @ts-expect-error
                                    // Of course, to trigger an error, we need to do something incorrectly. The below will do!
                                    { label: Strings.BUNNY, onPress: () => navigation.push("BUNNY_CUSTOM_PAGE", { render: () => <undefined /> }) },
                                    { label: "Discord", isDestructive: true, onPress: () => navigation.push("BUNNY_CUSTOM_PAGE", { noErrorBoundary: true }) },
                                ],
                            })}
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
                                            fs.downloadFile(RDT_EMBED_LINK, "preloads/reactDevtools.js")
                                                .then(() => showToast("Successfully installed! A reload is required", findAssetId("DownloadIcon")));
                                        } else if (rdtFileExists === CheckState.TRUE) {
                                            fs.removeFile("preloads/reactDevtools.js");
                                        }
                                    }}
                                    icon={findAssetId(rdtFileExists === CheckState.TRUE ? "TrashIcon" : "DownloadIcon")}
                                    style={{ marginLeft: 8 }}
                                />
                            }
                        />
                        <TableSwitchRow
                            label={Strings.ENABLE_EVAL_COMMAND}
                            subLabel={Strings.ENABLE_EVAL_COMMAND_DESC}
                            icon={<TableRow.Icon source={findAssetId("PencilIcon")} />}
                            value={!!settings.enableEvalCommand}
                            onValueChange={(v: boolean) => {
                                settings.enableEvalCommand = v;
                            }}
                        />
                    </TableRowGroup>
                </Stack>
            </ScrollView>
        </ErrorBoundary>
    );
}
