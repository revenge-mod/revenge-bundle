import { colorsPref } from "@lib/addons/themes/colors/preferences";
import { _colorRef } from "@lib/addons/themes/colors/updater";
import { after } from "@lib/api/patcher";
import { useObservable } from "@lib/api/storage";
import { findInReactTree } from "@lib/utils";
import { findByDisplayNameLazy } from "@metro";
import chroma from "chroma-js";
import { ImageBackground, StyleSheet } from "react-native";
import { logger } from "@lib/utils/logger";

const Messages = findByDisplayNameLazy("MessagesConnected");

function ThemeBackground({ children }: { children: React.ReactNode; }) {
    useObservable([colorsPref]);

    if (!_colorRef.current
        || colorsPref.customBackground === "hidden"
        || !_colorRef.current.background?.url
        || _colorRef.current.background?.blur && (typeof _colorRef.current.background?.blur !== "number")
    ) {
        return children;
    }

    return <ImageBackground
        style={{ flex: 1, height: "100%" }}
        source={{ uri: _colorRef.current.background?.url }}
        blurRadius={_colorRef.current.background?.blur}
    >
        {children}
    </ImageBackground>;
}

export default function patchChatBackground() {
    try {
        const patches = [
            after("render", Messages, (_, ret) => {
                if (!_colorRef.current || !_colorRef.current.background?.url) return;

                const messagesComponent = findInReactTree(
                    ret,
                    x => x && "HACK_fixModalInteraction" in x.props && x?.props?.style
                );

                if (messagesComponent) {
                    const flattened = StyleSheet.flatten(messagesComponent.props.style);
                    const backgroundColor = chroma(
                        flattened.backgroundColor || "black"
                    ).alpha(
                        1 - (_colorRef.current.background?.opacity ?? 1)
                    ).hex();

                    messagesComponent.props.style = StyleSheet.flatten([
                        messagesComponent.props.style,
                        { backgroundColor }
                    ]);
                }

                return <ThemeBackground>{ret}</ThemeBackground>;
            })
        ];

        return () => patches.forEach(x => x());
    } catch (e) {
        logger.error("Failed to patch chat background.", e);
        return () => { };
    }
}