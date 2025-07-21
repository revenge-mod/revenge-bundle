import { RNModules } from "./types";

const nmp = window.nativeModuleProxy;

function getNativeModule<T = any>(...names: string[]): T | undefined {
    for (const name of names) {
        if (globalThis.__turboModuleProxy) {
            const module = globalThis.__turboModuleProxy(name);
            if (module) return module as T;
        }

        if (nmp[name]) return nmp[name] as T;
    }

    return undefined;
}

export const NativeCacheModule = getNativeModule<RNModules.MMKVManager>(
    "NativeCacheModule", "MMKVManager"
)!;
export const NativeFileModule = getNativeModule<RNModules.FileManager>(
    "NativeFileModule", "RTNFileManager", "DCDFileManager"
)!;
export const NativeClientInfoModule = getNativeModule<RNModules.ClientInfoModule>(
    "NativeClientInfoModule", "RTNClientInfoManager", "InfoDictionaryManager"
)!;
export const NativeDeviceModule = getNativeModule(
    "NativeDeviceModule", "RTNDeviceManager", "DCDDeviceManager"
)!;
export const NativeThemeModule = getNativeModule(
    "NativeThemeModule", "RTNThemeManager", "DCDTheme"
)!;
export const BundleUpdaterManager = getNativeModule(
    "BundleUpdaterManager"
)!;
