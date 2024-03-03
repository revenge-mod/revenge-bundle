import logger from "@lib/logger";
import { FluxDispatcher, moment } from "@metro/common";
import { findByProps, findByStoreName } from "@metro/filters";

const ThemeManager = findByProps("updateTheme", "overrideTheme");
const AMOLEDThemeManager = findByProps("setAMOLEDThemeEnabled");
const ThemeStore = findByStoreName("ThemeStore");
const UnsyncedUserSettingsStore = findByStoreName("UnsyncedUserSettingsStore");

function onDispatch({ locale }: { locale: string }) {
  // Theming
  // Based on https://github.com/Aliucord/AliucordRN/blob/main/src/ui/patchTheme.ts
  try {
    if (ThemeManager) {
      ThemeManager.overrideTheme(ThemeStore?.theme ?? "dark");
      if (AMOLEDThemeManager && UnsyncedUserSettingsStore.useAMOLEDTheme === 2)
        AMOLEDThemeManager.setAMOLEDThemeEnabled(true);
    }
  } catch (e) {
    logger.error("Failed to fix theme...", e);
  }

  // Timestamps
  try {
    // TODO: Test if this works with all locales
    moment.locale(locale.toLowerCase());
  } catch (e) {
    logger.error("Failed to fix timestamps...", e);
  }

  // We're done here!
  FluxDispatcher.unsubscribe("I18N_LOAD_SUCCESS", onDispatch);
}

export default () => FluxDispatcher.subscribe("I18N_LOAD_SUCCESS", onDispatch);
