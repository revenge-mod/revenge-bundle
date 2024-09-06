import AssetDisplay from "@core/ui/settings/pages/Developer/AssetDisplay";
import { iterateAssets } from "@lib/api/assets";
import { LegacyFormDivider } from "@metro/common/components";
import { ErrorBoundary, Search } from "@ui/components";
import { useMemo } from "react";
import { FlatList, View } from "react-native";

export default function AssetBrowser() {
    const [search, setSearch] = React.useState("");
    const all = useMemo(() => Array.from(iterateAssets()), []);

    return (
        <ErrorBoundary>
            <View style={{ flex: 1 }}>
                <Search
                    style={{ margin: 10 }}
                    onChangeText={(v: string) => setSearch(v)}
                />
                <FlatList
                    data={all.filter(a => a.name.includes(search) || a.id.toString() === search)}
                    renderItem={({ item }) => <AssetDisplay asset={item} />}
                    ItemSeparatorComponent={LegacyFormDivider}
                    keyExtractor={item => item.name}
                />
            </View>
        </ErrorBoundary>
    );
}
