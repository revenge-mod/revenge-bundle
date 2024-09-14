import type * as t from "./types";

const nmp = window.nativeModuleProxy;

export const RTNMMKVManager = nmp.MMKVManager as t.RTNMMKVManager;
//! 173.10 renamed this to RTNFileManager.
export const RTNFileManager = (nmp.DCDFileManager ?? nmp.RTNFileManager) as t.RTNFileManager;
//! 173.13 renamed this to RTNClientInfoManager.
export const RTNClientInfoManager = nmp.InfoDictionaryManager ?? nmp.RTNClientInfoManager;
//! 173.14 renamed this to RTNDeviceManager.
export const RTNDeviceManager = nmp.DCDDeviceManager ?? nmp.RTNDeviceManager;
export const { BundleUpdaterManager: RTNBundleUpdaterManager } = nmp;
export const RTNThemeManager = nmp.RTNThemeManager ?? nmp.DCDTheme;
