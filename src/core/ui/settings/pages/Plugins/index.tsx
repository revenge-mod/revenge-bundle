import { Strings } from "@core/i18n";
import PluginReporter from "@core/reporter/PluginReporter";
import BunnySettings from "@core/storage/BunnySettings";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/components/PluginCard";
import PluginManager from "@lib/addons/plugins/PluginManager";
import type { Author } from "@lib/addons/types";
import { findAssetId } from "@lib/api/assets";
import { useObservable } from "@lib/api/storage";
import { BUNNY_PROXY_PREFIX, VD_PROXY_PREFIX } from "@lib/constants";
import { showToast } from "@lib/ui/toasts";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { NavigationNative } from "@metro/common";
import { Button, Card, FlashList, Text, TwinButtons } from "@metro/common/components";
import { type ComponentProps, useState } from "react";
import { View } from "react-native";

import unifyVdPlugin from "./models/vendetta";

export interface UnifiedPluginModel {
    id: string;
    name: string;
    description?: string;
    authors?: Array<Author | string>;
    icon?: string;

    isEnabled(): boolean;
    usePluginState(): void;
    isInstalled(): boolean;
    toggle(start: boolean): void;
    resolveSheetComponent(): Promise<{ default: React.ComponentType<any> }>;
    getPluginSettingsComponent(): React.ComponentType<any> | null | undefined;
}

const { openAlert } = lazyDestructure(() => findByProps("openAlert", "dismissAlert"));
const { AlertModal, AlertActions, AlertActionButton } = lazyDestructure(() =>
    findByProps("AlertModal", "AlertActions"),
);

interface PluginPageProps extends Partial<ComponentProps<typeof AddonPage<UnifiedPluginModel>>> {
    useItems: () => unknown[];
}

function PluginPage(props: PluginPageProps) {
    const items = props.useItems();

    return (
        <AddonPage<UnifiedPluginModel>
            CardComponent={PluginCard}
            title={Strings.PLUGINS}
            searchKeywords={[
                "name",
                "description",
                (p) => p.authors?.map((a: Author | string) => (typeof a === "string" ? a : a.name)).join() ?? "unknown",
            ]}
            sortOptions={{
                "Name (A-Z)": (a, b) => a.name.localeCompare(b.name),
                "Name (Z-A)": (a, b) => b.name.localeCompare(a.name),
            }}
            safeModeHint={{ message: Strings.SAFE_MODE_NOTICE_PLUGINS }}
            items={items}
            {...props}
        />
    );
}

export default function Plugins() {
    BunnySettings.useSettings();

    return (
        <PluginPage
            useItems={() => {
                useObservable([PluginManager.settings]);
                return PluginManager.getAllIds().map((id) => PluginManager.getManifest(id));
            }}
            resolveItem={unifyVdPlugin}
            ListHeaderComponent={() => <HeaderComponent />}
            installAction={{
                label: "Install a plugin",
                fetchFn: async (url: string) => {
                    if (
                        !url.startsWith(VD_PROXY_PREFIX) &&
                        !url.startsWith(BUNNY_PROXY_PREFIX) &&
                        !BunnySettings.developer.enabled
                    ) {
                        openAlert(
                            "bunny-plugin-unproxied-confirmation",
                            <AlertModal
                                title="Hold On!"
                                content="You're trying to install a plugin from an unproxied external source. This means you're trusting the creator to run their code in this app without your knowledge. Are you sure you want to continue?"
                                extraContent={
                                    <Card>
                                        <Text variant="text-md/bold">{url}</Text>
                                    </Card>
                                }
                                actions={
                                    <AlertActions>
                                        <AlertActionButton
                                            text="Continue"
                                            variant="primary"
                                            onPress={() => {
                                                PluginManager.install(url)
                                                    .then(() =>
                                                        showToast(
                                                            Strings.TOASTS_INSTALLED_PLUGIN,
                                                            findAssetId("Check"),
                                                        ),
                                                    )
                                                    .catch((e) =>
                                                        openAlert(
                                                            "bunny-plugin-install-failed",
                                                            <AlertModal
                                                                title="Install Failed"
                                                                content={`Unable to install plugin from '${url}':`}
                                                                extraContent={
                                                                    <Card>
                                                                        <Text variant="text-md/normal">
                                                                            {e instanceof Error ? e.message : String(e)}
                                                                        </Text>
                                                                    </Card>
                                                                }
                                                                actions={
                                                                    <AlertActionButton text="Okay" variant="primary" />
                                                                }
                                                            />,
                                                        ),
                                                    );
                                            }}
                                        />
                                        <AlertActionButton text="Cancel" variant="secondary" />
                                    </AlertActions>
                                }
                            />,
                        );
                    } else {
                        return await PluginManager.install(url);
                    }
                },
            }}
        />
    );
}
function HeaderComponent() {
    const [dismissUnproxied, setDismissUnproxied] = useState(false);
    const navigation = NavigationNative.useNavigation();
    const unproxiedPlugins = PluginManager.getUnproxiedPlugins();

    return (
        <View style={{ marginVertical: 8, gap: 8 }}>
            {PluginReporter.hasErrors() && (
                <Card border="strong" style={{ gap: 4 }}>
                    <Text color="text-danger" variant="eyebrow">
                        Error
                    </Text>
                    <Text variant="heading-lg/bold">Some plugins have been disabled</Text>
                    <Text variant="text-md/medium">These plugins were disabled due to an error during startup.</Text>
                    <Button
                        size="md"
                        text="Review"
                        style={{ marginTop: 8 }}
                        onPress={() => {
                            navigation.push("BUNNY_CUSTOM_PAGE", {
                                title: "Plugin Errors",
                                render: React.lazy(() => import("./pages/PluginErrors")),
                            });
                        }}
                    />
                </Card>
            )}
            {!!unproxiedPlugins.length && !dismissUnproxied && (
                <Card border="strong" style={{ gap: 4 }}>
                    <Text color="text-warning" variant="eyebrow">
                        Warning
                    </Text>
                    <Text variant="heading-lg/bold">Unproxied plugins detected</Text>
                    <Text variant="text-md/medium">
                        Plugins installed from unproxied sources may run unreviewed code in this app without your
                        awareness.
                    </Text>
                    <View style={{ height: 8 }} />
                    <TwinButtons>
                        <Button
                            size="md"
                            text="Dismiss"
                            variant="secondary"
                            onPress={() => setDismissUnproxied(true)}
                        />
                        <Button
                            size="md"
                            text="Review"
                            onPress={() => {
                                navigation.push("BUNNY_CUSTOM_PAGE", {
                                    title: "Unproxied Plugins",
                                    render: () => {
                                        return (
                                            <FlashList
                                                data={unproxiedPlugins}
                                                contentContainerStyle={{ padding: 8 }}
                                                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                                                renderItem={({ item: id }: any) => (
                                                    <Card>
                                                        <Text variant="heading-md/semibold">{id}</Text>
                                                    </Card>
                                                )}
                                            />
                                        );
                                    },
                                });
                            }}
                        />
                    </TwinButtons>
                </Card>
            )}
        </View>
    );
}
