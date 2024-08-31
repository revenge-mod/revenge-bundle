import { _themeRef } from "@lib/addons/themes/colors/internalRef";
import { after } from "@lib/api/patcher";
import { findInReactTree } from "@lib/utils";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByNameLazy, findByProps } from "@metro";
import chroma from "chroma-js";
import React from "react";
import { ImageBackground } from "react-native";

const MessagesWrapperConnected = findByNameLazy("MessagesWrapperConnected", false);
const { MessagesWrapper } = lazyDestructure(() => findByProps("MessagesWrapper"));

export default function patchChatBackground() {
    const patches = [
        after("default", MessagesWrapperConnected, (_, ret) => _themeRef.context
            ? <ImageBackground
                style={{ flex: 1, height: "100%" }}
                source={_themeRef.context.background?.url && { uri: _themeRef.context.background.url } || 0}
                blurRadius={typeof _themeRef.context.background?.blur === "number" ? _themeRef.context.background?.blur : 0}
            >
                {ret}
            </ImageBackground>
            : ret
        ),
        after("render", MessagesWrapper.prototype, (_, ret) => {
            if (!_themeRef.context || !_themeRef.context.background?.url) return;

            const Messages = findInReactTree(
                ret,
                x => x && "HACK_fixModalInteraction" in x.props && x?.props?.style
            );

            if (Messages) {
                Messages.props.style = [
                    Messages.props.style,
                    {
                        backgroundColor: chroma(Messages.props.style.backgroundColor || "black")
                            .alpha(1 - (_themeRef.context.background?.opacity ?? 1)).hex()
                    },
                ];
            } else {
                console.error("Didn't find Messages when patching MessagesWrapper!");
            }
        })
    ];

    return () => patches.forEach(x => x());
}
