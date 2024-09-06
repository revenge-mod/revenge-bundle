import PluginReporter from "@core/ui/reporter/PluginReporter";
import { FlatList, View } from "react-native";

import PluginErrorCard from "./PluginErrorCard";

export default function PluginErrors() {
    return <FlatList
        data={Object.keys(PluginReporter.errors)}
        contentContainerStyle={{ padding: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={(props: { item: string }) => {
            return <PluginErrorCard id={props.item} />;
        }}
    />;
}
