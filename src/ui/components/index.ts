import type { ReactNative as RN } from "@metro/common";
import { findByDisplayName, findByName, findByProps } from "@metro/filters";
import type { RedesignObj } from "@types";

// Discord
export const Forms = findByProps("Form", "FormSection");
export const General = findByProps("Button", "Text", "View");
export const Alert = findByDisplayName("FluxContainer(Alert)");
export const Button = findByProps(
  "Looks",
  "Colors",
  "Sizes"
) as React.ComponentType<any> & { Looks: any; Colors: any; Sizes: any };
export const HelpMessage = findByName("HelpMessage");
// React Native's included SafeAreaView only adds padding on iOS.
export const SafeAreaView = findByProps("useSafeAreaInsets")
  .SafeAreaView as typeof RN.SafeAreaView;
export const Redesign = (findByProps("TextInput", "TableRow") ??
  {}) as RedesignObj;

// Vendetta
export { default as Codeblock } from "@ui/components/Codeblock";
export { default as ErrorBoundary } from "@ui/components/ErrorBoundary";
export { default as Search } from "@ui/components/Search";
export { default as Summary } from "@ui/components/Summary";
