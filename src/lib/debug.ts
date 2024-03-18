import { DEVELOPMENT_DISTRIBUTION_URL } from "@lib/constants";
import logger from "@lib/logger";
import {
  BundleUpdaterManager,
  ClientInfoManager,
  DeviceManager
} from "@lib/native";
import { after } from "@lib/patcher";
import settings, { loaderConfig } from "@lib/settings";
import { getCurrentTheme, selectTheme } from "@lib/themes";
import { ReactNative as RN } from "@metro/common";
import { ButtonColors, type RNConstants } from "@types";
import { showConfirmationAlert } from "@ui/alerts";
import { getAssetIDByName } from "@ui/assets";
import { showToast } from "@ui/toasts";
import { removeCachedScript } from "./storage";

export let socket: WebSocket;

export async function toggleSafeMode() {
  settings.safeMode = {
    ...settings.safeMode,
    enabled: !settings.safeMode?.enabled
  };
  if (window.__vendetta_loader?.features.themes) {
    if (getCurrentTheme()?.id)
      settings.safeMode!.currentThemeId = getCurrentTheme()?.id;
    if (settings.safeMode?.enabled) {
      await selectTheme("default");
    } else if (settings.safeMode?.currentThemeId) {
      await selectTheme(settings.safeMode?.currentThemeId);
    }
  }
  setTimeout(BundleUpdaterManager.reload, 400);
}

export function connectToDebugger(url: string) {
  if (socket !== undefined && socket.readyState !== WebSocket.CLOSED)
    socket.close();

  if (!url) {
    showToast("Invalid debugger URL!", getAssetIDByName("Small"));
    return;
  }

  socket = new WebSocket(`ws://${url}`);

  socket.addEventListener("open", () =>
    showToast("Connected to debugger.", getAssetIDByName("Check"))
  );
  socket.addEventListener("message", (message: any) => {
    try {
      (0, eval)(message.data);
    } catch (e) {
      console.error(e);
    }
  });

  socket.addEventListener("error", (err: any) => {
    console.log(`Debugger error: ${err.message}`);
    showToast(
      "An error occurred with the debugger connection!",
      getAssetIDByName("Small")
    );
  });
}

export function patchLogHook() {
  const unpatch = after("nativeLoggingHook", globalThis, (args) => {
    if (socket?.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify({ message: args[0], level: args[1] }));
    logger.log(args[0]);
  });

  return () => {
    socket?.close();
    unpatch();
  };
}

export const versionHash: string = __revengeVersion;

export function getDebugInfo() {
  // Hermes
  const hermesProps = window.HermesInternal.getRuntimeProperties();
  const hermesVer = hermesProps["OSS Release Version"];
  const padding = "for RN ";

  // RN
  const PlatformConstants = RN.Platform.constants as RNConstants;
  const rnVer = PlatformConstants.reactNativeVersion;

  return {
    vendetta: {
      version: versionHash,
      loader: window.__vendetta_loader?.name ?? "Unknown"
    },
    discord: {
      version: ClientInfoManager.Version,
      build: ClientInfoManager.Build
    },
    react: {
      version: React.version,
      nativeVersion: hermesVer.startsWith(padding)
        ? hermesVer.substring(padding.length)
        : `${rnVer.major}.${rnVer.minor}.${rnVer.patch}`
    },
    hermes: {
      version: hermesVer,
      buildType: hermesProps.Build,
      bytecodeVersion: hermesProps["Bytecode Version"]
    },
    ...RN.Platform.select({
      android: {
        os: {
          name: "Android",
          version: PlatformConstants.Release,
          sdk: PlatformConstants.Version
        }
      },
      ios: {
        os: {
          name: PlatformConstants.systemName,
          version: PlatformConstants.osVersion
        }
      }
    })!,
    ...RN.Platform.select({
      android: {
        device: {
          manufacturer: PlatformConstants.Manufacturer,
          brand: PlatformConstants.Brand,
          model: PlatformConstants.Model,
          codename: DeviceManager.device
        }
      },
      ios: {
        device: {
          manufacturer: DeviceManager.deviceManufacturer,
          brand: DeviceManager.deviceBrand,
          model: DeviceManager.deviceModel,
          codename: DeviceManager.device
        }
      }
    })!
  };
}

export async function setDevelopmentBuildEnabled(enabled: boolean) {
  if (enabled) {
    loaderConfig.__previousCustomLoadUrlConfig = loaderConfig.customLoadUrl;
    loaderConfig.customLoadUrl = {
      enabled: true,
      url: DEVELOPMENT_DISTRIBUTION_URL
    };
  } else {
    const previousConfig = loaderConfig.__previousCustomLoadUrlConfig;
    if (previousConfig) loaderConfig.customLoadUrl = previousConfig;
    else
      loaderConfig.customLoadUrl = {
        enabled: false,
        url: "http://localhost:4040/revenge.js"
      };
    loaderConfig.__previousCustomLoadUrlConfig = undefined;
  }

  settings.developmentBuildEnabled = enabled;

  await removeCachedScript();

  showConfirmationAlert({
    title: "Reload required",
    content: "Changes will only apply next time the app launches or reloads.",
    confirmText: "Reload now",
    cancelText: "Later",
    confirmColor: ButtonColors.PRIMARY,
    onConfirm: BundleUpdaterManager.reload
  });
}
