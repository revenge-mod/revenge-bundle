import { connectToDebugger, setDevelopmentBuildEnabled } from "@lib/debug";
import { BundleUpdaterManager } from "@lib/native";
import settings, { loaderConfig } from "@lib/settings";
import { useProxy } from "@lib/storage";
import { NavigationNative, ReactNative as RN } from "@metro/common";
import { findByProps } from "@metro/filters";
import { ButtonColors } from "@types";
import { showConfirmationAlert } from "@ui/alerts";
import { getAssetIDByName } from "@ui/assets";
import { ErrorBoundary, Forms } from "@ui/components";
import AssetBrowser from "@ui/settings/pages/AssetBrowser";

const { FormSection, FormRow, FormSwitchRow, FormInput, FormDivider } = Forms;
const { hideActionSheet } = findByProps("openLazy", "hideActionSheet");
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const { TextStyleSheet } = findByProps("TextStyleSheet");

export default function Developer() {
  const navigation = NavigationNative.useNavigation();

  useProxy(settings);
  useProxy(loaderConfig);

  return (
    <ErrorBoundary>
      <RN.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 38 }}
      >
        <FormSection title="Debug" titleStyleType="no_border">
          <FormInput
            value={settings.debuggerUrl}
            onChange={(v: string) => (settings.debuggerUrl = v)}
            placeholder="127.0.0.1:9090"
            title="DEBUGGER URL"
          />
          <FormDivider />
          <FormRow
            label="Connect to debug websocket"
            leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
            onPress={() => connectToDebugger(settings.debuggerUrl)}
          />
          {window.__vendetta_rdc && (
            <>
              <FormDivider />
              <FormRow
                label="Connect to React DevTools"
                leading={
                  <FormRow.Icon source={getAssetIDByName("ic_badge_staff")} />
                }
                onPress={() =>
                  window.__vendetta_rdc?.connectToDevTools({
                    host: settings.debuggerUrl.split(":")?.[0],
                    resolveRNStyle: RN.StyleSheet.flatten
                  })
                }
              />
            </>
          )}
        </FormSection>
        {window.__vendetta_loader?.features.loaderConfig && (
          <FormSection title="Loader config">
            {settings.developmentBuildEnabled ? (
              <FormRow
                label="Load from custom URL"
                subLabel="Using development builds overrides this setting, tap to disable."
                leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
                onPress={() =>
                  showConfirmationAlert({
                    title: "Stop using development builds?",
                    content: [
                      "To use the ",
                      <RN.Text style={TextStyleSheet["text-md/semibold"]}>
                        Load from custom URL
                      </RN.Text>,
                      " option, you will have to stop using development builds as it overrides this setting."
                    ],
                    confirmText: "Revert",
                    cancelText: "Cancel",
                    confirmColor: ButtonColors.PRIMARY,
                    onConfirm: () => setDevelopmentBuildEnabled(false)
                  })
                }
              />
            ) : (
              <>
                <FormSwitchRow
                  label="Load from custom URL"
                  subLabel="Load Revenge from a custom endpoint."
                  leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
                  value={loaderConfig.customLoadUrl.enabled}
                  onValueChange={(v: boolean) => {
                    loaderConfig.customLoadUrl.enabled = v;
                  }}
                />
                <FormDivider />
                {loaderConfig.customLoadUrl.enabled && (
                  <>
                    <FormInput
                      value={loaderConfig.customLoadUrl.url}
                      onChange={(v: string) =>
                        (loaderConfig.customLoadUrl.url = v)
                      }
                      placeholder="http://localhost:4040/revenge.js"
                      title="REVENGE URL"
                    />
                    <FormDivider />
                  </>
                )}
              </>
            )}
            {window.__vendetta_loader.features.devtools && (
              <FormSwitchRow
                label="Load React DevTools"
                subLabel={`Version: ${window.__vendetta_loader.features.devtools.version}`}
                leading={
                  <FormRow.Icon source={getAssetIDByName("ic_badge_staff")} />
                }
                value={loaderConfig.loadReactDevTools}
                onValueChange={(v: boolean) => {
                  loaderConfig.loadReactDevTools = v;
                }}
              />
            )}
          </FormSection>
        )}
        <FormSection title="Other">
          <FormRow
            label="Asset Browser"
            leading={<FormRow.Icon source={getAssetIDByName("ic_image")} />}
            trailing={FormRow.Arrow}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Asset Browser",
                render: AssetBrowser
              })
            }
          />
          <FormDivider />
          <FormRow
            label="ErrorBoundary Tools"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_warning_24px")} />
            }
            trailing={FormRow.Arrow}
            onPress={() =>
              showSimpleActionSheet({
                key: "ErrorBoundaryTools",
                header: {
                  title: "Which ErrorBoundary do you want to trip?",
                  icon: (
                    <FormRow.Icon
                      style={{ marginRight: 8 }}
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
        </FormSection>
      </RN.ScrollView>
    </ErrorBoundary>
  );
}
