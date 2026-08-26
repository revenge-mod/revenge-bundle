import { React, NavigationNative, tokens } from "@metro/common";
import { CardWrapper } from "@core/ui/components/AddonCard";
import { UnifiedPluginModel } from "@core/ui/settings/pages/Plugins/models";
import { usePluginCardStyles } from "@core/ui/settings/pages/Plugins/usePluginCardStyles";
import { findAssetId } from "@lib/api/assets";
import {
  Card,
  IconButton,
  Stack,
  TableSwitch,
  Text,
} from "@metro/common/components";
import { showSheet } from "@ui/sheets";
import { createContext, useContext, useMemo } from "react";
import { Image, View } from "react-native";

const getChroma = () => require("chroma-js") as typeof import("chroma-js").default;

const CardContext = createContext<{
  plugin: UnifiedPluginModel;
  result: Fuzzysort.KeysResult<UnifiedPluginModel>;
}>(null!);
const useCardContext = () => useContext(CardContext);

function getHighlightColor(): import("react-native").ColorValue {
  return getChroma()(tokens.unsafe_rawColors.YELLOW_300).alpha(0.3).hex();
}

function Title() {
  const styles = usePluginCardStyles();
  const { plugin, result } = useCardContext();

  // Guard the fuzzysort key result — it may be absent for some items
  const titleResult = result?.[0];
  const highlightedNode = titleResult
    ? titleResult.highlight((m, i) => (
        <Text key={i} style={{ backgroundColor: getHighlightColor() }}>
          {m}
        </Text>
      ))
    : [];

  const icon = plugin.icon && findAssetId(plugin.icon);

  const textNode = (
    <Text numberOfLines={1} variant="heading-lg/semibold">
      {highlightedNode.length ? highlightedNode : plugin.name}
    </Text>
  );

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {icon && <Image style={styles.smallIcon} source={icon} />}
      {textNode}
    </View>
  );
}

function Authors() {
  const { plugin, result } = useCardContext();
  const styles = usePluginCardStyles();

  if (!plugin.authors) return null;

  // Guard the fuzzysort key result for authors
  const authorResult = result?.[2];
  const highlightedNode = authorResult
    ? authorResult.highlight((m, i) => (
        <Text key={i} style={{ backgroundColor: getHighlightColor() }}>
          {m}
        </Text>
      ))
    : [];

  const badges = plugin.getBadges();
  const authorText =
    highlightedNode.length > 0
      ? highlightedNode
      : plugin.authors.map((a) => a.name).join(", ");

  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", flexShrink: 1, gap: 4 }}
    >
      <Text variant="text-sm/semibold" color="text-muted">
        by {authorText}
      </Text>
      {badges.length > 0 && (
        <View style={styles.badgesContainer}>
          {badges.map((b, i) => (
            <Image key={i} source={b.source} style={styles.badgeIcon} />
          ))}
        </View>
      )}
    </View>
  );
}

function Description() {
  const { plugin, result } = useCardContext();

  // Guard the fuzzysort key result for description
  const descResult = result?.[1];
  const highlightedNode = descResult
    ? descResult.highlight((m, i) => (
        <Text key={i} style={{ backgroundColor: getHighlightColor() }}>
          {m}
        </Text>
      ))
    : [];

  return (
    <Text variant="text-md/medium">
      {highlightedNode.length ? highlightedNode : plugin.description}
    </Text>
  );
}

const Actions = () => {
  const { plugin } = useCardContext();
  const navigation = NavigationNative.useNavigation();

  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      <IconButton
        size="sm"
        variant="secondary"
        icon={findAssetId("SettingsIcon")}
        disabled={!plugin.getPluginSettingsComponent()}
        onPress={() => {
          const SettingsComponent = plugin.getPluginSettingsComponent();
          if (!SettingsComponent) return;
          navigation.push("SHIGGYCORD_CUSTOM_PAGE", {
            title: plugin.name,
            render: () => <SettingsComponent />,
          });
        }}
      />
      <IconButton
        size="sm"
        variant="secondary"
        icon={findAssetId("CircleInformationIcon-primary")}
        onPress={() =>
          void showSheet(
            "PluginInfoActionSheet",
            plugin.resolveSheetComponent(),
            { plugin, navigation },
          )
        }
      />
    </View>
  );
};

export default function PluginCard({
  result,
  item: plugin,
}: CardWrapper<UnifiedPluginModel>) {
  plugin.usePluginState();

  const [, forceUpdate] = React.useReducer(() => ({}), 0);
  const cardContextValue = useMemo(
    () => ({ plugin, result }),
    [plugin, result],
  );

  // Protect specific core plugins from being toggled
  const idLower = ((plugin.id || "") as string).toLowerCase();
  const isProtectedCore = idLower.includes("quickinstall");

  return (
    <CardContext.Provider value={cardContextValue}>
      <Card>
        <Stack spacing={16}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flexShrink: 1 }}>
              <Title />
              <Authors />
            </View>
            <View>
              <Stack spacing={12} direction="horizontal">
                <Actions />
                {/* Dim and disable the switch for protected core plugins */}
                <View style={{ opacity: isProtectedCore ? 0.45 : 1 }}>
                  <TableSwitch
                    value={plugin.isEnabled()}
                    disabled={isProtectedCore}
                    onValueChange={(v: boolean) => {
                      if (isProtectedCore) return;
                      plugin.toggle(v);
                      forceUpdate();
                    }}
                  />
                </View>
              </Stack>
            </View>
          </View>
          <Description />
        </Stack>
      </Card>
    </CardContext.Provider>
  );
}
