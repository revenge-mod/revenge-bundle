import { RTNClientInfoManager, RTNDeviceManager } from "@lib/api/native/rn-modules";
import { version } from "bunny-build-info";
import { Platform, type PlatformConstants } from "react-native";

import { LOADER_IDENTITY } from "./native/loader";

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
            version: version.split("-")[0],
            loader: LOADER_IDENTITY.name,
        },
        bunny: {
            version: version,
            loader: {
                name: LOADER_IDENTITY.name,
                version: LOADER_IDENTITY.version
            }
        },
        discord: {
            version: RTNClientInfoManager.Version,
            build: RTNClientInfoManager.Build,
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
                        codename: RTNDeviceManager.device
                    }
                },
                ios: {
                    device: {
                        manufacturer: RTNDeviceManager.deviceManufacturer,
                        brand: RTNDeviceManager.deviceBrand,
                        model: RTNDeviceManager.deviceModel,
                        codename: RTNDeviceManager.device
                    }
                }
            }
        )!
    };
}
