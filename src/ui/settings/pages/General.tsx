import {
  TableGroup,
  TableRow,
  TableSwitchRow,
  useRedesignStyle
} from "@/ui/components/Table";
import { DISCORD_SERVER, GITHUB } from "@lib/constants";
import { getDebugInfo, toggleSafeMode } from "@lib/debug";
import { BundleUpdaterManager } from "@lib/native";
import settings from "@lib/settings";
import { removeMMKVBackend, useProxy } from "@lib/storage";
import { url, ReactNative as RN } from "@metro/common";
import { ButtonColors } from "@types";
import { showConfirmationAlert } from "@ui/alerts";
import { getAssetIDByName } from "@ui/assets";
import { ErrorBoundary, Summary } from "@ui/components";
import Version from "@ui/settings/components/Version";

const debugInfo = getDebugInfo();

export default function General() {
  useProxy(settings);

  const versions = [
    {
      label: "Revenge",
      version: debugInfo.vendetta.version,
      icon: "WrenchIcon"
    },
    {
      label: "Discord",
      version: `${debugInfo.discord.version} (${debugInfo.discord.build})`,
      icon: "Discord"
    },
    {
      label: "React",
      version: debugInfo.react.version,
      icon: "ThreadIcon"
    },
    {
      label: "React Native",
      version: debugInfo.react.nativeVersion,
      icon: "MobilePhoneIcon"
    },
    {
      label: "Bytecode",
      version: debugInfo.hermes.bytecodeVersion,
      icon: "HomeIcon"
    }
  ];

  const platformInfo = [
    {
      label: "Loader",
      version: debugInfo.vendetta.loader,
      icon: "DownloadIcon"
    },
    {
      label: "Operating System",
      version: `${debugInfo.os.name} ${debugInfo.os.version}`,
      icon: "SettingsIcon"
    },
    ...(debugInfo.os.sdk
      ? [
          {
            label: "SDK",
            version: debugInfo.os.sdk,
            icon: "PaperIcon"
          }
        ]
      : []),
    {
      label: "Manufacturer",
      version: debugInfo.device.manufacturer,
      icon: "StaffBadgeIcon"
    },
    {
      label: "Brand",
      version: debugInfo.device.brand,
      icon: "BoostTier2Icon"
    },
    {
      label: "Model",
      version: debugInfo.device.model,
      icon: "LaptopPhoneIcon"
    },
    {
      label: RN.Platform.select({ android: "Codename", ios: "Machine ID" })!,
      version: debugInfo.device.codename,
      icon: "WindowLaunchIcon"
    }
  ];

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
        <TableGroup title="Links">
          <TableRow
            label="Discord Server"
            icon={getAssetIDByName("ClydeIcon")}
            arrow={true}
            onPress={() => url.openDeeplink(DISCORD_SERVER)}
          />
          <TableRow
            label="GitHub"
            icon={getAssetIDByName("img_account_sync_github_white")}
            arrow={true}
            onPress={() => url.openURL(GITHUB)}
          />
        </TableGroup>
        <TableGroup title="Actions">
          <TableRow
            label="Reload Discord"
            icon={getAssetIDByName("RetryIcon")}
            onPress={() => BundleUpdaterManager.reload()}
          />
          <TableRow
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
            icon={getAssetIDByName("ShieldIcon")}
            onPress={toggleSafeMode}
          />
          <TableSwitchRow
            label="Developer Settings"
            icon={getAssetIDByName("WrenchIcon")}
            value={settings.developerSettings}
            onValueChange={(v) => (settings.developerSettings = v)}
          />
        </TableGroup>
        <TableGroup title="Info">
          <Summary label="Versions" icon="CircleInformationIcon">
            {versions.map((v) => (
              <Version label={v.label} version={v.version} icon={v.icon} />
            ))}
          </Summary>
          <Summary label="Platform" icon="MobilePhoneIcon">
            {platformInfo.map((p) => (
              <Version label={p.label} version={p.version} icon={p.icon} />
            ))}
          </Summary>
        </TableGroup>
        <TableGroup title="Advanced">
          <TableRow
            label="Clear plugin storage"
            icon={getAssetIDByName("TrashIcon")}
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
                }
              })
            }
          />
          <TableRow
            label="Clear theme storage"
            icon={getAssetIDByName("TrashIcon")}
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
                }
              })
            }
          />
        </TableGroup>
      </RN.ScrollView>
    </ErrorBoundary>
  );
}
