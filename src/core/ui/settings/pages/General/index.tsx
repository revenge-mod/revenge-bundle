import { isSafeMode, toggleSafeMode } from "@core/debug/safeMode";
import { Strings } from "@core/i18n";
import { shiggycordIcon } from "@core/ui/settings";
import About from "@core/ui/settings/pages/General/About";
import { useProxy } from "@core/vendetta/storage";
import { findAssetId } from "@lib/api/assets";
import { getDebugInfo } from "@lib/api/debug";
import { BundleUpdaterManager } from "@lib/api/native/modules";
import { settings } from "@lib/api/settings";
import { openAlert } from "@lib/ui/alerts";
import { DISCORD_SERVER, GITHUB } from "@lib/utils/constants";
import { NavigationNative } from "@metro/common";
import {
  AlertActionButton,
  AlertActions,
  AlertModal,
  Card,
  Stack,
  TableRow,
  TableRowGroup,
  TableSwitchRow,
  Text,
} from "@metro/common/components";
import { Linking, ScrollView, View, TouchableOpacity } from "react-native";

import React from "react";

export default function General() {
  useProxy(settings);

  const debugInfo = getDebugInfo();
  const navigation = NavigationNative.useNavigation();

  // Custom Community Card Button
  const CommunityCardButton = ({
    icon,
    label,
    subLabel,
    color,
    onPress,
  }: {
    icon?: number | { uri: string };
    label: string;
    subLabel?: string | null;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress} activeOpacity={0.7}>
      <Card
        style={{
          backgroundColor: color,
          borderRadius: 16,
          padding: 16,
          height: 100, // Increased height to accommodate text
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TableRow.Icon
              source={icon as any}
              style={{
                tintColor: "#FFFFFF",
                width: 24,
                height: 24,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text
              variant="text-md/semibold"
              style={{
                color: "text-default",
                textAlign: "left",
              }}
            >
              {label}
            </Text>
            {subLabel && (
              <Text
                variant="text-sm/medium"
                style={{
                  color: "#FFFFFFCC",
                  textAlign: "left",
                }}
              >
                {subLabel}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 38 }}
    >
      <Stack
        style={{ paddingVertical: 24, paddingHorizontal: 12 }}
        spacing={24}
      >
        <TableRowGroup title="App Information">
          <TableRow
            label="💦GoonCord💦"
            icon={<TableRow.Icon source={{ uri: shiggycordIcon ?? "" }} />}
            trailing={<TableRow.TrailingText text={debugInfo.bunny.version} />}
          />
          <TableRow
            label="Discord"
            subLabel={`Version ${debugInfo.discord.version}`}
            icon={<TableRow.Icon source={findAssetId("Discord")} />}
            trailing={
              <TableRow.TrailingText
                text={`Build ${debugInfo.discord.build}`}
              />
            }
          />
          <TableRow
            label="Loader"
            subLabel={`${debugInfo.bunny.loader.name} loader`}
            icon={<TableRow.Icon source={findAssetId("DownloadIcon")} />}
            trailing={
              <TableRow.TrailingText text={debugInfo.bunny.loader.version ?? ""} />
            }
          />
        </TableRowGroup>
        <TableRowGroup title="Quick Actions">
          <TableRow
            label={Strings.RELOAD_DISCORD}
            subLabel="Restart the application"
            icon={<TableRow.Icon source={findAssetId("RetryIcon")} />}
            onPress={() => BundleUpdaterManager.reload()}
          />
          <TableSwitchRow
            label="Safe Mode"
            subLabel="Temporarily disable all add-ons"
            icon={<TableRow.Icon source={findAssetId("ShieldIcon")} />}
            value={isSafeMode()}
            onValueChange={(to: boolean) => {
              toggleSafeMode({ to, reload: false });
              openAlert(
                "bunny-reload-safe-mode",
                <AlertModal
                  title="Reload now?"
                  content={
                    !to
                      ? "All add-ons will load normally."
                      : "All add-ons will be temporarily disabled upon reload."
                  }
                  actions={
                    <AlertActions>
                      <AlertActionButton
                        text="Reload Now"
                        variant="destructive"
                        onPress={() => BundleUpdaterManager.reload()}
                      />
                      <AlertActionButton text="Later" variant="secondary" />
                    </AlertActions>
                  }
                />,
              );
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="Developer">
          <TableSwitchRow
            label={Strings.DEVELOPER_SETTINGS}
            subLabel="Enable developer tools and settings"
            icon={<TableRow.Icon source={findAssetId("WrenchIcon")} />}
            value={settings.developerSettings}
            onValueChange={(v: boolean) => {
              settings.developerSettings = v;
            }}
          />
          <TableSwitchRow
            label={Strings.SETTINGS_ACTIVATE_DISCORD_EXPERIMENTS}
            subLabel={Strings.SETTINGS_ACTIVATE_DISCORD_EXPERIMENTS_DESC}
            icon={<TableRow.Icon source={findAssetId("StaffBadgeIcon")} />}
            value={settings.enableDiscordDeveloperSettings}
            onValueChange={(v: boolean) => {
              settings.enableDiscordDeveloperSettings = v;
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="Community & Support">
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <CommunityCardButton
              icon={findAssetId("Discord")}
              label="Discord"
              subLabel="Join our support server"
              color="#5865F2"
              onPress={() => Linking.openURL(DISCORD_SERVER)}
            />
            <CommunityCardButton
              icon={findAssetId("img_account_sync_github_white")}
              label="GitHub"
              subLabel="View the source code"
              color="#24292E"
              onPress={() => Linking.openURL(GITHUB)}
            />
          </View>
        </TableRowGroup>

        <TableRowGroup title="System Information">
          <TableRow
            arrow
            label={Strings.ABOUT}
            subLabel="Detailed technical information"
            icon={
              <TableRow.Icon
                source={findAssetId("CircleInformationIcon-primary")}
              />
            }
            onPress={() =>
              navigation.push("SHIGGYCORD_CUSTOM_PAGE", {
                title: Strings.ABOUT,
                render: () => <About />,
              })
            }
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
