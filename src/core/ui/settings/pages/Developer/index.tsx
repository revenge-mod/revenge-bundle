import { Strings } from "@core/i18n";
import { CheckState, useFileExists } from "@core/ui/hooks/useFS";
import AssetBrowser from "@core/ui/settings/pages/Developer/AssetBrowser";
import { useProxy } from "@core/vendetta/storage";
import { findAssetId } from "@lib/api/assets";
import {
  connectToDebugger,
  disconnectFromDebugger,
  isConnectedToDebugger,
  connectRdt,
  disconnectRdt,
  useIsRdtConnected,
} from "@lib/api/debug";
import {
  getReactDevToolsProp,
  getReactDevToolsVersion,
  isLoaderConfigSupported,
  isReactDevToolsPreloaded,
  isVendettaLoader,
} from "@lib/api/native/loader";
import { loaderConfig, settings } from "@lib/api/settings";
import { lazyDestructure } from "@lib/utils/lazy";
import { NavigationNative } from "@metro/common";
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
import { semanticColors } from "@ui/color";
import { ErrorBoundary } from "@ui/components";
import ErrorBoundaryScreen from "@core/ui/reporter/components/ErrorBoundaryScreen";
import { createStyles, TextStyleSheet } from "@ui/styles";
import { NativeModules } from "react-native";
import { ScrollView } from "react-native";
import { showToast } from "@ui/toasts";
import { useState, useEffect } from "react";

const { hideActionSheet } = lazyDestructure(() =>
  findByProps("openLazy", "hideActionSheet"),
);
const { showSimpleActionSheet } = lazyDestructure(() =>
  findByProps("showSimpleActionSheet"),
);
const { openAlert } = lazyDestructure(() =>
  findByProps("openAlert", "dismissAlert"),
);
const { AlertModal, AlertActionButton } = lazyDestructure(() =>
  findByProps("AlertModal", "AlertActions"),
);

const RDT_EMBED_LINK =
  "https://codeberg.org/raincord/raindevtools/raw/branch/dev/dist/index.bundle";

const useStyles = createStyles({
  leadingText: {
    ...TextStyleSheet["heading-md/semibold"],
    color: semanticColors.TEXT_MUTED,
    marginRight: -4,
  },
  inputGroup: {
    marginTop: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
});

export default function Developer() {
  const [rdtFileExists, fs] = useFileExists("preloads/reactDevtools.js");
  const [isDebuggerConnected, setIsDebuggerConnected] = useState(
    isConnectedToDebugger(),
  );
  const isRdtConnected = useIsRdtConnected();

  const styles = useStyles();
  const navigation = NavigationNative.useNavigation();

  useProxy(settings);
  useProxy(loaderConfig);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDebuggerConnected(isConnectedToDebugger());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDebuggerConnect = () => {
    if (isDebuggerConnected) {
      disconnectFromDebugger();
      setIsDebuggerConnected(false);
    } else {
      connectToDebugger(settings.debuggerUrl);
      setTimeout(() => setIsDebuggerConnected(isConnectedToDebugger()), 100);
    }
  };

  const handleReactDevToolsConnect = () => {
    if (isRdtConnected) {
      disconnectRdt();
    } else {
      if (!settings.devToolsUrl?.trim()) {
        showToast("Invalid devTools URL!", findAssetId("Small"));
        return;
      }
      connectRdt(settings.devToolsUrl);
    }
  };

  return (
    <ErrorBoundary>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 38 }}
      >
        <Stack
          style={{ paddingVertical: 24, paddingHorizontal: 12 }}
          spacing={24}
        >
          <Stack spacing={4}>
            <TableRowGroup title={Strings.DEBUGGER_URL}>
              <Stack spacing={4}>
                <TextInput
                  placeholder="127.0.0.1:9090"
                  size="md"
                  leadingIcon={() => (
                    <LegacyFormText style={styles.leadingText}>
                      ws://
                    </LegacyFormText>
                  )}
                  defaultValue={settings.debuggerUrl}
                  onChange={(v: string) => (settings.debuggerUrl = v)}
                />
              </Stack>
            </TableRowGroup>

            <TableRowGroup>
              <TableSwitchRow
                label={Strings.AUTO_DEBUGGER}
                icon={<TableRow.Icon source={findAssetId("copy")} />}
                value={settings.autoDebugger}
                onValueChange={(v: boolean) => {
                  settings.autoDebugger = v;
                }}
              />
              <TableRow
                label={Strings.CONNECT_TO_DEBUG_WEBSOCKET}
                subLabel="Connect DevTools for debugging"
                icon={<TableRow.Icon source={findAssetId("WrenchIcon")} />}
                onPress={handleDebuggerConnect}
              />
            </TableRowGroup>
          </Stack>

          {isReactDevToolsPreloaded() && (
            <Stack spacing={4}>
              <TableRowGroup title="React Development">
                <Stack spacing={4}>
                  <TextInput
                    placeholder="127.0.0.1:8097"
                    size="md"
                    leadingIcon={() => (
                      <LegacyFormText style={styles.leadingText}>
                        ws://
                      </LegacyFormText>
                    )}
                    defaultValue={settings.devToolsUrl}
                    onChange={(v: string) => (settings.devToolsUrl = v)}
                  />
                </Stack>
              </TableRowGroup>

              <TableRowGroup>
                <TableSwitchRow
                  label={Strings.AUTO_DEVTOOLS}
                  icon={<TableRow.Icon source={findAssetId("ic_badge_staff")} />}
                  value={settings.autoDevTools}
                  onValueChange={(v: boolean) => {
                    settings.autoDevTools = v;
                  }}
                />
                <TableRow
                  label={Strings.CONNECT_TO_REACT_DEVTOOLS}
                  subLabel="Connect React DevTools for component debugging"
                  icon={<TableRow.Icon source={findAssetId("ic_badge_staff")} />}
                  onPress={handleReactDevToolsConnect}
                />

                {isLoaderConfigSupported() && isVendettaLoader() && (
                  <TableSwitchRow
                    label={Strings.LOAD_REACT_DEVTOOLS}
                    subLabel={`${Strings.VERSION}: ${getReactDevToolsVersion()}`}
                    icon={
                      <TableRow.Icon source={findAssetId("ic_badge_staff")} />
                    }
                    value={loaderConfig.loadReactDevTools}
                    onValueChange={(v: boolean) => {
                      loaderConfig.loadReactDevTools = v;
                    }}
                  />
                )}
              </TableRowGroup>
            </Stack>
          )}

          {isLoaderConfigSupported() && (
            <TableRowGroup title="Loader Configuration">
              <TableSwitchRow
                label={Strings.LOAD_FROM_CUSTOM_URL}
                subLabel={Strings.LOAD_FROM_CUSTOM_URL_DEC}
                icon={<TableRow.Icon source={findAssetId("LinkIcon")} />}
                value={loaderConfig.customLoadUrl.enabled}
                onValueChange={(v: boolean) => {
                  loaderConfig.customLoadUrl.enabled = v;
                }}
              />
              {loaderConfig.customLoadUrl.enabled && (
                <TableRow
                  label={
                    <TextInput
                      defaultValue={loaderConfig.customLoadUrl.url}
                      size="md"
                      onChange={(v: string) =>
                        (loaderConfig.customLoadUrl.url = v)
                      }
                      placeholder="http://localhost:4040/shiggycord.js"
                      label={Strings.SHIGGYCORD_URL}
                    />
                  }
                />
              )}
            </TableRowGroup>
          )}

          <TableRowGroup title="Inspection & Testing">
            <TableRow
              arrow
              label={Strings.ASSET_BROWSER}
              subLabel="Browse and inspect Discord's assets"
              icon={<TableRow.Icon source={findAssetId("ic_image")} />}
              trailing={TableRow.Arrow}
              onPress={() =>
                navigation.push("SHIGGYCORD_CUSTOM_PAGE", {
                  title: Strings.ASSET_BROWSER,
                  render: AssetBrowser,
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
                  variant={
                    rdtFileExists === CheckState.TRUE ? "secondary" : "primary"
                  }
                  text={
                    rdtFileExists === CheckState.TRUE
                      ? Strings.UNINSTALL
                      : Strings.INSTALL
                  }
                  onPress={async () => {
                    if (rdtFileExists === CheckState.FALSE) {
                      fs.downloadFile(
                        RDT_EMBED_LINK,
                        "preloads/reactDevtools.js",
                      ).then(() =>
                        showToast(
                          "Successfully installed! A reload is required",
                          findAssetId("DownloadIcon"),
                        ),
                      );
                    } else if (rdtFileExists === CheckState.TRUE) {
                      fs.removeFile("preloads/reactDevtools.js");
                    }
                  }}
                  icon={findAssetId(
                    rdtFileExists === CheckState.TRUE
                      ? "TrashIcon"
                      : "DownloadIcon",
                  )}
                  style={{ marginLeft: 8 }}
                />
              }
            />
            <TableRow
              arrow
              label={Strings.ERROR_BOUNDARY_TOOLS_LABEL}
              subLabel="Test error boundaries and crash handling"
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
                  },
                  options: [
                    {
                      label: Strings.SHIGGYCORD,
                      onPress: () =>
                        navigation.push("SHIGGYCORD_CUSTOM_PAGE", {
                          render: () => (
                            <ErrorBoundaryScreen
                              error={new Error("ShiggyCord test crash")}
                              rerender={() => {}}
                            />
                          ),
                        }),
                    },
                    {
                      label: "Discord",
                      isDestructive: true,
                      onPress: () =>
                        navigation.push("SHIGGYCORD_CUSTOM_PAGE", {
                          noErrorBoundary: true,
                        }),
                    },
                  ],
                })
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

          <TableRowGroup title="Dangerous Actions">
            <TableRow
              label={Strings.CLEAR_BUNDLE}
              subLabel="Clear cached bundle and force reload"
              icon={<TableRow.Icon source={findAssetId("TrashIcon")} />}
              onPress={() => {
                openAlert(
                  "shiggycord-clear-bundle-reload-confirmation",
                  <AlertModal
                    title={Strings.MODAL_RELOAD_REQUIRED}
                    content={Strings.MODAL_RELOAD_REQUIRED_DESC}
                    actions={
                      <Stack>
                        <AlertActionButton
                          text={Strings.RELOAD}
                          variant="destructive"
                          onPress={() =>
                            NativeModules.BundleUpdaterManager.reload()
                          }
                        />
                        <AlertActionButton
                          text={Strings.CANCEL}
                          variant="secondary"
                        />
                      </Stack>
                    }
                  />,
                );
              }}
            />
          </TableRowGroup>
        </Stack>
      </ScrollView>
    </ErrorBoundary>
  );
}
