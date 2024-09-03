import { lazyDestructure, proxyLazy } from "@lib/utils/lazy";
import { tokens } from "@metro/common";
import { findByProps, findByPropsLazy, findByStoreNameLazy } from "@metro/wrappers";
import { TextStyles } from "@ui/types";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

const Styles = findByPropsLazy("createStyles");

export const { ThemeContext } = lazyDestructure(() => findByProps("ThemeContext"), { hint: "object" });
export const { TextStyleSheet } = lazyDestructure(() => findByProps("TextStyleSheet")) as unknown as {
    TextStyleSheet: { [key in TextStyles]: TextStyle; };
};

const ThemeStore = findByStoreNameLazy("ThemeStore");
const colorResolver = tokens.meta ??= tokens.internal;

export function isSemanticColor(sym: any): boolean {
    return colorResolver.isSemanticColor(sym);
}

export function resolveSemanticColor(sym: any, theme = ThemeStore.theme): string {
    return colorResolver.resolveSemanticColor(theme, sym);
}

export function createStyles<T extends NamedStyles<T>>(sheet: T | ((props: any) => T)): () => T {
    return proxyLazy(() => Styles.createStyles(sheet));
}

export function createLegacyClassComponentStyles<T extends NamedStyles<T>>(sheet: T | ((props: any) => T)): (ctxt: typeof ThemeContext) => T {
    return proxyLazy(() => Styles.createLegacyClassComponentStyles(sheet));
}
