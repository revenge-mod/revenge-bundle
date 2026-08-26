import AssetDisplay from "@core/ui/settings/pages/Developer/AssetDisplay";
import { iterateAssets } from "@lib/api/assets";
import { findAssetId } from "@lib/api/assets";
import { Strings } from "@core/i18n";
import { IconButton, TableCheckboxRow, TableRowGroup, ActionSheet, BottomSheetTitleHeader } from "@metro/common/components";
import { ErrorBoundary, Search } from "@ui/components";
import { showSheet } from "@lib/ui/sheets";
import { useProxy, createProxy } from "@core/vendetta/storage";
import { useState, useMemo, useCallback } from "react";
import { FlatList, View } from "react-native";

const IMAGE_FILES = [
  { id: "png", label: "PNG", defaultEnabled: true },
  { id: "jpg", label: "JPG", defaultEnabled: true },
  { id: "jpeg", label: "JPEG", defaultEnabled: true },
  { id: "svg", label: "SVG", defaultEnabled: true },
  { id: "gif", label: "GIF", defaultEnabled: true },
];

const TEXT_FILES = [
  { id: "jsona", label: "JSONA", defaultEnabled: false },
  { id: "json", label: "JSON", defaultEnabled: false },
  { id: "lottie", label: "Lottie", defaultEnabled: false },
];

const ALL_FILE_TYPES = [...IMAGE_FILES, ...TEXT_FILES];

// Create initial enabled filters state
const createInitialFilters = () => {
  const filters: Record<string, boolean> = {};
  ALL_FILE_TYPES.forEach(type => {
    filters[type.id] = type.defaultEnabled;
  });
  return filters;
};

const { proxy: assetBrowserStorage } = createProxy({
  enabledFilters: createInitialFilters()
});

export default function AssetBrowser() {
  const [search, setSearch] = useState("");
  const [updateTick, setUpdateTick] = useState(0);

  // Use useProxy to make the state reactive
  useProxy(assetBrowserStorage);

  const getFilteredAssets = useCallback(() => {
    return Array.from(iterateAssets()).filter((asset) => {
      const type = String(asset.type ?? "").toLowerCase();
      return assetBrowserStorage.enabledFilters[type] === true;
    });
  }, [updateTick]);

  const all = useMemo(() => getFilteredAssets(), [getFilteredAssets]);

  const toggleFilter = (filterId: string) => {
    assetBrowserStorage.enabledFilters[filterId] = !assetBrowserStorage.enabledFilters[filterId];
    setUpdateTick(prev => prev + 1);
  };

  const handleFilterPress = () => {
    showSheet("AssetBrowserFilter", () => {
      useProxy(assetBrowserStorage);

      return (
        <ActionSheet>
          <BottomSheetTitleHeader title={Strings.ASSET_TYPES} />
            <TableRowGroup title={Strings.IMAGE_FILES}>
              {IMAGE_FILES.map(fileType => (
                <TableCheckboxRow
                  key={fileType.id}
                  label={fileType.label}
                  checked={assetBrowserStorage.enabledFilters[fileType.id] === true}
                  onPress={() => toggleFilter(fileType.id)}
                />
              ))}
            </TableRowGroup>
            <TableRowGroup title={Strings.TEXT_FILES}>
              {TEXT_FILES.map(fileType => (
                <TableCheckboxRow
                  key={fileType.id}
                  label={fileType.label}
                  checked={assetBrowserStorage.enabledFilters[fileType.id] === true}
                  onPress={() => toggleFilter(fileType.id)}
                />
              ))}
            </TableRowGroup>
        </ActionSheet>
      );
    });
  };

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", margin: 10, gap: 8, alignItems: "center" }}>
          <Search
            style={{ flex: 1 }}
            isRound
            onChangeText={(v: string) => setSearch(v)}
          />
          <IconButton
            icon={findAssetId("FileIcon")}
            variant="tertiary"
            onPress={handleFilterPress}
          />
        </View>
        <View
          style={{
            flex: 1,
            borderRadius: 16,
            paddingHorizontal: 12,
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        >
          <FlatList
            data={all.filter(
              (a) => (a.name.includes(search) || a.id.toString() === search),
            )}
            renderItem={({ item }: any) => <AssetDisplay asset={item} />}
            contentContainerStyle={{
              overflow: "hidden",
              backgroundColor: "transparent",
              borderRadius: 16,
            }}
            keyExtractor={(a) => a.name}
          />
        </View>
      </View>
    </ErrorBoundary>
  );
}
