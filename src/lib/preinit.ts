import { instead } from "@lib/patcher";
import { initThemes } from "@lib/themes";

// Hoist required modules
// This used to be in filters.ts, but things became convoluted

const basicFind = (filter: (m: any) => any | string) => {
  for (const key in window.modules) {
    const exp = window.modules[key]?.publicModule.exports;
    if (exp && filter(exp)) return exp;
  }
};

const requireNativeComponent = basicFind(
  (m) => m?.default?.name === "requireNativeComponent"
);

if (requireNativeComponent) {
  // > "Tried to register two views with the same name DCDVisualEffectView"
  // This serves as a workaround for the crashing You tab on Android starting from version 192.x
  // How? We simply ignore it.
  instead("default", requireNativeComponent, (args, orig) => {
    try {
      return orig(...args);
    } catch {
      return args[0];
    }
  });
}

// Hoist React on window
window.React = basicFind((m) => m.createElement) as typeof import("react");

// Export ReactNative
export const ReactNative = basicFind(
  (m) => m.AppRegistry
) as typeof import("react-native");

// Export chroma.js
export const chroma = basicFind((m) => m.brewer) as typeof import("chroma-js");

// Themes
if (window.__vendetta_loader?.features.themes) {
  try {
    initThemes();
  } catch (e) {
    console.error("[Revenge] Failed to initialize themes...", e);
  }
}
