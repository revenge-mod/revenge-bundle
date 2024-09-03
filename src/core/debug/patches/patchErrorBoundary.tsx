import { toggleSafeMode } from "@core/debug/safeMode";
import { Strings } from "@core/i18n";
import BunnySettings from "@core/storage/BunnySettings";
import { RTNBundleUpdaterManager, RTNDeviceManager } from "@lib/api/native/rn-modules";
import { after } from "@lib/api/patcher";
import { lazyDestructure } from "@lib/utils/lazy";
import { tokens } from "@metro/common";
import { Button, CompatButton, SafeAreaView } from "@metro/common/components";
import { _lazyContextSymbol } from "@metro/lazy";
import { LazyModuleContext } from "@metro/types";
import { findByNameLazy, findByProps } from "@metro/wrappers";
import { Codeblock, ErrorBoundary as _ErrorBoundary } from "@ui/components";
import { createStyles, TextStyleSheet } from "@ui/styles";
import { useState } from "react";
import { Text, View } from "react-native";

// Let's just pray they have this.
const { BadgableTabBar } = lazyDestructure(() => findByProps("BadgableTabBar"));

const useStyles = createStyles({
    container: {
        flex: 1,
        backgroundColor: tokens.colors.BACKGROUND_PRIMARY,
        paddingHorizontal: 16,
    },
    header: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 8,
    },
    headerTitle: {
        ...TextStyleSheet["heading-md/semibold"],
        textAlign: "center",
        textTransform: "uppercase",
        color: tokens.colors.HEADER_PRIMARY,
    },
    headerDescription: {
        ...TextStyleSheet["text-sm/medium"],
        textAlign: "center",
        color: tokens.colors.TEXT_MUTED,
    },
    footer: {
        flexDirection: RTNDeviceManager.isTablet ? "row" : "column",
        justifyContent: "flex-end",
        marginVertical: 8,
    },
});

interface Tab {
    id: string;
    title: () => string;
    trimWhitespace?: boolean;
}

interface Button {
    text: string;
    // TODO: Proper types for the below
    color?: string;
    size?: string;
    onPress: () => void;
}

const tabs: Tab[] = [
    { id: "message", title: () => Strings.MESSAGE },
    { id: "stack", title: () => Strings.STACK_TRACE },
    { id: "componentStack", title: () => Strings.COMPONENT, trimWhitespace: true },
];

function getErrorBoundaryContext() {
    const ctxt: LazyModuleContext = findByNameLazy("ErrorBoundary")[_lazyContextSymbol];
    return new Promise(resolve => {
        ctxt.getExports(exp => {
            resolve(exp.prototype);
        });
    });
}

function ErrorScreen({ ret, error, rerender }: any) {
    const styles = useStyles();
    const [activeTab, setActiveTab] = useState("message");

    const tabData = tabs.find(t => t.id === activeTab);
    const errorText: string = error[activeTab];

    // This is in the patch and not outside of it so that we can use `this`, e.g. for setting state
    const buttons: Button[] = [
        { text: Strings.RELOAD_DISCORD, onPress: () => RTNBundleUpdaterManager.reload() },
        ...!BunnySettings.isSafeMode() ? [{ text: Strings.RELOAD_IN_SAFE_MODE, onPress: toggleSafeMode }] : [],
        { text: Strings.RETRY_RENDER, color: "red", onPress: rerender },
    ];

    return <_ErrorBoundary>
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <ret.props.Illustration style={{ transform: [{ scale: 0.6 }], marginLeft: -40, marginRight: -80 }} />
                <View style={{ flex: 2, paddingLeft: 24 }}>
                    <Text style={styles.headerTitle}>{ret.props.title}</Text>
                    <Text style={styles.headerDescription}>{ret.props.body}</Text>
                </View>
            </View>
            <View style={{ flex: 6 }}>
                <View style={{ paddingBottom: 8 }}>
                    {/* Are errors caught by ErrorBoundary guaranteed to have the component stack? */}
                    <BadgableTabBar
                        tabs={tabs.map(t => ({ ...t, title: t.title() }))}
                        activeTab={activeTab}
                        onTabSelected={(tab: string) => { setActiveTab(tab); }}
                    />
                </View>
                <Codeblock
                    selectable
                    style={{ flex: 1, textAlignVertical: "top" }}
                >
                    {/*
                    TODO: I tried to get this working as intended using regex and failed.
                    When trimWhitespace is true, each line should have it's whitespace removed but with it's spaces kept.
                */}
                    {tabData?.trimWhitespace ? errorText.split("\n").filter(i => i.length !== 0).map(i => i.trim()).join("\n") : errorText}
                </Codeblock>
            </View>
            <View style={styles.footer}>
                {buttons.map(button => {
                    const buttonIndex = buttons.indexOf(button) !== 0 ? 8 : 0;

                    return <CompatButton
                        text={button.text}
                        color={button.color ?? "brand"}
                        size={button.size ?? "small"}
                        onPress={button.onPress}
                        style={{
                            ...(RTNDeviceManager.isTablet ? {
                                flex: `0.${buttons.length}`,
                                marginLeft: buttonIndex
                            } : {
                                marginTop: buttonIndex
                            }),

                            borderRadius: 16
                        }}
                    />;
                })}
            </View>
        </SafeAreaView>
    </_ErrorBoundary>;
}

export default function patchErrorBoundary() {
    return after.await("render", getErrorBoundaryContext(), function (this: any, _, ret) {
        if (!this.state.error) return;

        return <ErrorScreen ret={ret} error={this.state.error} rerender={() => this.setState({ info: null, error: null })} />;
    });
}
