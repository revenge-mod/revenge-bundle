import { useRedesignStyle } from "@/ui/components/Table";
import { ReactNative as RN } from "@metro/common";
import { all } from "@ui/assets";
import { ErrorBoundary, Search } from "@ui/components";
import AssetDisplay from "@ui/settings/components/AssetDisplay";

export default function AssetBrowser() {
  const [search, setSearch] = React.useState("");

  const data = Object.values(all).filter(
    (a) => a.name.includes(search) || a.id.toString() === search
  );

  return (
    <ErrorBoundary>
      <RN.View
        style={[
          { flex: 1 },
          useRedesignStyle() && {
            minWidth: 1,
            minHeight: 1,
            paddingHorizontal: 16
          }
        ]}
      >
        <Search
          style={{ margin: 10 }}
          onChangeText={(v: string) => setSearch(v)}
          placeholder="Search"
        />
        <RN.FlatList
          data={data}
          renderItem={({ item, index }) => (
            <AssetDisplay
              start={index === 0}
              end={index === data.length - 1}
              asset={item}
            />
          )}
          keyExtractor={(item) => item.name}
          style={useRedesignStyle() && { paddingTop: 12, marginBottom: 24 }}
        />
      </RN.View>
    </ErrorBoundary>
  );
}
