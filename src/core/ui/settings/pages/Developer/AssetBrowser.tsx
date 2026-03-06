import AssetDisplay from "@core/ui/settings/pages/Developer/AssetDisplay";
import { iterateAssets } from "@lib/api/assets";
import { Text } from "@metro/common/components";
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
                <View style={{ flex: 1, borderRadius: 16, paddingHorizontal: 12, overflow: 'hidden', backgroundColor: 'transparent' }}>
                    <Text variant='text-sm/medium' color='text-feedback-critical' style={{ marginBottom: 16 }}>Some assets types cannot be displayed and will be marked in red.</Text>
                    <FlatList
                        data={all.filter(a => a.name.includes(search) || a.id.toString() === search)}
                        renderItem={({ item }: any) => <AssetDisplay asset={item} />}
                        contentContainerStyle={{ overflow: 'hidden', backgroundColor: 'transparent', borderRadius: 16 }}
                        keyExtractor={a => a.name}
                    />
                </View>
            </View>
        </ErrorBoundary>
    );
}
