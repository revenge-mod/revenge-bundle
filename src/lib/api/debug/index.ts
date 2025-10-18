import { getThemeFromLoader, selectTheme, themes } from "@lib/addons/themes";
import { getLoaderName, getLoaderVersion, isReactDevToolsPreloaded, isThemeSupported } from "@lib/api/native/loader";
import { BundleUpdaterManager, NativeClientInfoModule, NativeDeviceModule } from "@lib/api/native/modules";
import { settings } from "@lib/api/settings";
import { version } from "bunny-build-info";
import { Platform, type PlatformConstants } from "react-native";
import { connectDt, dtConnected } from "./devtools";
import { connectRdt, rdtConnected } from "./react";
import { logger } from "@lib/utils/logger";

export interface RNConstants extends PlatformConstants {
    // Android
    Version: number;
    Release: string;
    Serial: string;
    Fingerprint: string;
    Model: string;
    Brand: string;
    Manufacturer: string;
    ServerHost?: string;

    // iOS
    forceTouchAvailable: boolean;
    interfaceIdiom: string;
    osVersion: string;
    systemName: string;
}

/**
 * @internal
 */
export async function toggleSafeMode() {
    settings.safeMode = { ...settings.safeMode, enabled: !settings.safeMode?.enabled };
    if (isThemeSupported()) {
        if (getThemeFromLoader()?.id) settings.safeMode!.currentThemeId = getThemeFromLoader()!.id;
        if (settings.safeMode?.enabled) {
            await selectTheme(null);
        } else if (settings.safeMode?.currentThemeId) {
            await selectTheme(themes[settings.safeMode?.currentThemeId]);
        }
    }
    setTimeout(BundleUpdaterManager.reload, 400);
}

export function connectToDebugger(url: string, quiet?: boolean) {
    if (dtConnected) return;

    connectDt(url, quiet);
}

export function connectToReactDevTools(url: string, quiet?: boolean) {
    if (!isReactDevToolsPreloaded() || rdtConnected) return;

    connectRdt(url, quiet);
}

/** @internal */
export const versionHash = version;

export function getDebugInfo() {
    // Hermes
    const hermesProps = window.HermesInternal.getRuntimeProperties();
    const hermesVer = hermesProps["OSS Release Version"];
    const padding = "for RN ";

    // RN
    const PlatformConstants = Platform.constants as RNConstants;
    const rnVer = PlatformConstants.reactNativeVersion;

    return {
        /**
         * @deprecated use `bunny` field
         * */
        vendetta: {
            version: versionHash.split("-")[0],
            loader: getLoaderName(),
        },
        bunny: {
            version: versionHash,
            loader: {
                name: getLoaderName(),
                version: getLoaderVersion()
            }
        },
        discord: {
            version: NativeClientInfoModule.getConstants().Version,
            build: NativeClientInfoModule.getConstants().Build,
        },
        react: {
            version: React.version,
            nativeVersion: hermesVer.startsWith(padding) ? hermesVer.substring(padding.length) : `${rnVer.major}.${rnVer.minor}.${rnVer.patch}`,
        },
        hermes: {
            version: hermesVer,
            buildType: hermesProps.Build,
            bytecodeVersion: hermesProps["Bytecode Version"],
        },
        ...Platform.select(
            {
                android: {
                    os: {
                        name: "Android",
                        version: PlatformConstants.Release,
                        sdk: PlatformConstants.Version
                    },
                },
                ios: {
                    os: {
                        name: PlatformConstants.systemName,
                        version: PlatformConstants.osVersion
                    },
                }
            }
        )!,
        ...Platform.select(
            {
                android: {
                    device: {
                        manufacturer: PlatformConstants.Manufacturer,
                        brand: PlatformConstants.Brand,
                        model: PlatformConstants.Model,
                        codename: NativeDeviceModule.device
                    }
                },
                ios: {
                    device: {
                        manufacturer: NativeDeviceModule.deviceManufacturer,
                        brand: NativeDeviceModule.deviceBrand,
                        model: NativeDeviceModule.deviceModel,
                        codename: NativeDeviceModule.device
                    }
                }
            }
        )!
    };
}

/**
 * @internal
 */
export function initDebugger() {
    if (!settings.enableAutoDebugger || !settings.debuggerUrl) return;

    try {
        connectToDebugger(settings.debuggerUrl, true);
        connectToReactDevTools(settings.debuggerUrl, true);
    } catch (e) {
        logger.error("Failed to connect to DevTools during startup:", e);
    }
}