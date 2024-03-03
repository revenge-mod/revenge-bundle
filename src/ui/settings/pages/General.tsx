import { DISCORD_SERVER, GITHUB } from "@lib/constants";
import { getDebugInfo, toggleSafeMode } from "@lib/debug";
import { BundleUpdaterManager } from "@lib/native";
import settings from "@lib/settings";
import { removeMMKVBackend, useProxy } from "@lib/storage";
import { ReactNative as RN, url } from "@metro/common";
import { ButtonColors } from "@types";
import { showConfirmationAlert } from "@ui/alerts";
import { getAssetIDByName } from "@ui/assets";
import { ErrorBoundary, Forms, Summary } from "@ui/components";
import Version from "@ui/settings/components/Version";

const { FormRow, FormSwitchRow, FormSection, FormDivider } = Forms;
const debugInfo = getDebugInfo();

export default function General() {
  useProxy(settings);

  const versions = [
    {
      label: "Revenge",
      version: debugInfo.vendetta.version,
      icon: "ic_progress_wrench_24px",
    },
    {
      label: "Discord",
      version: `${debugInfo.discord.version} (${debugInfo.discord.build})`,
      icon: "Discord",
    },
    {
      label: "React",
      version: debugInfo.react.version,
      icon: "ic_category_16px",
    },
    {
      label: "React Native",
      version: debugInfo.react.nativeVersion,
      icon: "mobile",
    },
    {
      label: "Bytecode",
      version: debugInfo.hermes.bytecodeVersion,
      icon: "ic_server_security_24px",
    },
  ];

  const platformInfo = [
    {
      label: "Loader",
      version: debugInfo.vendetta.loader,
      icon: "ic_download_24px",
    },
    {
      label: "Operating System",
      version: `${debugInfo.os.name} ${debugInfo.os.version}`,
      icon: "ic_cog_24px",
    },
    ...(debugInfo.os.sdk
      ? [
          {
            label: "SDK",
            version: debugInfo.os.sdk,
            icon: "ic_profile_badge_verified_developer_color",
          },
        ]
      : []),
    {
      label: "Manufacturer",
      version: debugInfo.device.manufacturer,
      icon: "ic_badge_staff",
    },
    {
      label: "Brand",
      version: debugInfo.device.brand,
      icon: "ic_settings_boost_24px",
    },
    {
      label: "Model",
      version: debugInfo.device.model,
      icon: "ic_phonelink_24px",
    },
    {
      label: RN.Platform.select({ android: "Codename", ios: "Machine ID" })!,
      version: debugInfo.device.codename,
      icon: "ic_compose_24px",
    },
  ];

  return (
    <ErrorBoundary>
      <RN.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 38 }}
      >
        <FormSection title="Links" titleStyleType="no_border">
          <FormRow
            label="Discord Server"
            leading={<FormRow.Icon source={getAssetIDByName("Discord")} />}
            trailing={FormRow.Arrow}
            onPress={() => url.openDeeplink(DISCORD_SERVER)}
          />
          <FormDivider />
          <FormRow
            label="GitHub"
            leading={
              <FormRow.Icon
                source={getAssetIDByName("img_account_sync_github_white")}
              />
            }
            trailing={FormRow.Arrow}
            onPress={() => url.openURL(GITHUB)}
          />
        </FormSection>
        <FormSection title="Actions">
          <FormRow
            label="Reload Discord"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_message_retry")} />
            }
            onPress={() => BundleUpdaterManager.reload()}
          />
          <FormDivider />
          <FormRow
            label={
              settings.safeMode?.enabled
                ? "Return to Normal Mode"
                : "Reload in Safe Mode"
            }
            subLabel={`This will reload Discord ${
              settings.safeMode?.enabled
                ? "normally."
                : "without loading plugins."
            }`}
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_privacy_24px")} />
            }
            onPress={toggleSafeMode}
          />
          <FormDivider />
          <FormSwitchRow
            label="Developer Settings"
            leading={
              <FormRow.Icon
                source={getAssetIDByName("ic_progress_wrench_24px")}
              />
            }
            value={settings.developerSettings}
            onValueChange={(v: boolean) => {
              settings.developerSettings = v;
            }}
          />
        </FormSection>
        <FormSection title="Info">
          <Summary label="Versions" icon="ic_information_filled_24px">
            {versions.map((v, i) => (
              <>
                <Version label={v.label} version={v.version} icon={v.icon} />
                {i !== versions.length - 1 && <FormDivider />}
              </>
            ))}
          </Summary>
          <FormDivider />
          <Summary label="Platform" icon="ic_mobile_device">
            {platformInfo.map((p, i) => (
              <>
                <Version label={p.label} version={p.version} icon={p.icon} />
                {i !== platformInfo.length - 1 && <FormDivider />}
              </>
            ))}
          </Summary>
        </FormSection>
        <FormSection title="Advanced">
          <FormRow
            label="Clear plugin storage"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_message_delete")} />
            }
            onPress={() =>
              showConfirmationAlert({
                title: "Clear plugin storage?",
                content:
                  "All installed plugins will be removed and the app will be reloaded. Plugin settings will still be retained. This is only neccessary if you have a corrupted storage.",
                confirmText: "Yes, I have a corrupted storage",
                cancelText: "Cancel",
                confirmColor: ButtonColors.RED,
                onConfirm: () => {
                  removeMMKVBackend("VENDETTA_PLUGINS");
                  BundleUpdaterManager.reload();
                },
              })
            }
          />
          <FormDivider />
          <FormRow
            label="Clear theme storage"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_message_delete")} />
            }
            onPress={() =>
              showConfirmationAlert({
                title: "Clear theme storage?",
                content:
                  "All installed themes will be removed and the app will be reloaded. This is only neccessary if you have a corrupted storage.",
                confirmText: "Yes, I have a corrupted storage",
                cancelText: "Cancel",
                confirmColor: ButtonColors.RED,
                onConfirm: () => {
                  removeMMKVBackend("VENDETTA_THEMES");
                  BundleUpdaterManager.reload();
                },
              })
            }
          />
        </FormSection>
      </RN.ScrollView>
    </ErrorBoundary>
  );
}
