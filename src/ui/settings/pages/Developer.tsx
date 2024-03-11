import {
  TableGroup,
  TableInput,
  TableRow,
  TableSwitchRow,
  useRedesign,
  useRedesignStyle
} from "@/ui/components/Table";
import { connectToDebugger } from "@lib/debug";
import settings, { loaderConfig } from "@lib/settings";
import { useProxy } from "@lib/storage";
import { NavigationNative, ReactNative as RN } from "@metro/common";
import { findByProps } from "@metro/filters";
import { getAssetIDByName } from "@ui/assets";
import { ErrorBoundary } from "@ui/components";
import AssetBrowser from "@ui/settings/pages/AssetBrowser";

const { hideActionSheet } = findByProps("openLazy", "hideActionSheet");
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");

export default function Developer() {
  const navigation = NavigationNative.useNavigation();

  useProxy(settings);
  useProxy(loaderConfig);

  return (
    <ErrorBoundary>
      <RN.ScrollView
        style={[
          { flex: 1 },
          useRedesignStyle() && {
            minWidth: 1,
            minHeight: 1,
            paddingHorizontal: 16
          }
        ]}
        contentContainerStyle={{ paddingBottom: 38 }}
      >
        <TableInput
          value={settings.debuggerUrl}
          onChange={(v) => (settings.debuggerUrl = v)}
          placeholder="127.0.0.1:9090"
          leadingIcon={() => <TableRow.TrailingText text="ws://" />}
          label="Debugger URL"
        />
        <TableGroup title="Debug">
          <TableRow
            label="Connect to debug websocket"
            icon={getAssetIDByName("HubIcon")}
            onPress={() => connectToDebugger(settings.debuggerUrl)}
          />
          {window.__vendetta_rdc && (
            <>
              <TableRow
                label="Connect to React DevTools"
                icon={getAssetIDByName("SoundboardIcon")}
                onPress={() =>
                  window.__vendetta_rdc?.connectToDevTools({
                    host: settings.debuggerUrl.split(":")?.[0],
                    resolveRNStyle: RN.StyleSheet.flatten
                  })
                }
              />
            </>
          )}
        </TableGroup>
        {window.__vendetta_loader?.features.loaderConfig && (
          <TableGroup title="Loader config">
            <TableSwitchRow
              label="Load from custom url"
              subLabel={"Load Revenge from a custom endpoint."}
              icon={getAssetIDByName("CopyIcon")}
              value={loaderConfig.customLoadUrl.enabled}
              onValueChange={(v: boolean) => {
                loaderConfig.customLoadUrl.enabled = v;
              }}
            />
            {loaderConfig.customLoadUrl.enabled && (
              <>
                <TableInput
                  value={loaderConfig.customLoadUrl.url}
                  onChange={(v) => (loaderConfig.customLoadUrl.url = v)}
                  placeholder="http://localhost:4040/revenge.js"
                  label="Revenge URL"
                  inRow
                />
              </>
            )}
            {window.__vendetta_loader.features.devtools && (
              <TableSwitchRow
                label="Load React DevTools"
                subLabel={`Version: ${window.__vendetta_loader.features.devtools.version}`}
                icon={getAssetIDByName("SoundboardIcon")}
                value={loaderConfig.loadReactDevTools}
                onValueChange={(v: boolean) => {
                  loaderConfig.loadReactDevTools = v;
                }}
              />
            )}
          </TableGroup>
        )}
        <TableGroup title="Other">
          <TableRow
            label="Asset Browser"
            icon={getAssetIDByName("ImageIcon")}
            arrow={true}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Asset Browser",
                render: AssetBrowser
              })
            }
          />
          <TableRow
            label="ErrorBoundary Tools"
            icon={getAssetIDByName("WarningIcon")}
            arrow={true}
            onPress={() =>
              showSimpleActionSheet({
                key: "ErrorBoundaryTools",
                header: {
                  title: "Which ErrorBoundary do you want to trip?",
                  icon: (
                    <TableRow.Icon
                      source={getAssetIDByName("ic_warning_24px")}
                    />
                  ),
                  onClose: () => hideActionSheet()
                },
                options: [
                  {
                    label: "Revenge",
                    onPress: () =>
                      navigation.push("VendettaCustomPage", {
                        // @ts-expect-error Of course, to trigger an error, we need to do something incorrectly. The below will do!
                        render: () => <undefined />
                      })
                  },
                  {
                    label: "Discord",
                    isDestructive: true,
                    onPress: () =>
                      navigation.push("VendettaCustomPage", {
                        noErrorBoundary: true
                      })
                  }
                ]
              })
            }
          />
        </TableGroup>
      </RN.ScrollView>
    </ErrorBoundary>
  );
}
