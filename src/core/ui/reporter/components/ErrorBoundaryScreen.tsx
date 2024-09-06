import { toggleSafeMode } from "@core/debug/safeMode";
import { hasStack, isComponentStack } from "@core/ui/reporter/utils/isStack";
import { getDebugInfo } from "@lib/api/debug";
import { RTNBundleUpdaterManager } from "@lib/api/native/rn-modules";
import { Codeblock } from "@lib/ui/components";
import { Button, Card, SafeAreaView, Text } from "@metro/common/components";
import { ScrollView, View } from "react-native";

import ErrorComponentStackCard from "./ErrorComponentStackCard";
import ErrorStackCard from "./ErrorStackCard";

export default function ErrorBoundaryScreen(props: {
    error: Error;
    rerender: () => void;
}) {
    const debugInfo = getDebugInfo();

    return <SafeAreaView>
        <View style={{ height: "100%", padding: 8, gap: 12 }} >
            <View style={{ gap: 4 }}>
                <Text variant="display-lg">Uh oh.</Text>
                <Text variant="text-md/normal">A crash occured while rendering a component. This could be caused by a plugin, Bunny or Discord itself</Text>
                <Text variant="text-sm/normal" color="text-muted">{debugInfo.os.name}; {debugInfo.discord.build} ({debugInfo.discord.version}); {debugInfo.bunny.version}</Text>
            </View>
            <ScrollView fadingEdgeLength={64} contentContainerStyle={{ gap: 12 }}>
                <Codeblock selectable={true}>{props.error.message}</Codeblock>
                {hasStack(props.error) && <ErrorStackCard error={props.error} />}
                {isComponentStack(props.error) ? <ErrorComponentStackCard componentStack={props.error.componentStack} /> : null}
            </ScrollView>
            <Card style={{ gap: 6 }}>
                <Button text="Reload Discord" onPress={() => RTNBundleUpdaterManager.reload()} />
                <Button text="Reload in Safe Mode" onPress={() => toggleSafeMode({ to: true })} />
                <Button variant ="destructive" text="Retry Render" onPress={() => props.rerender()} />
            </Card>
        </View>
    </SafeAreaView>;
}
