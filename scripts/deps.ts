import { ReactNative as RN } from "@vendetta/metro/common";

export const RNFileManager = (RN.NativeModules.DCDFileManager ??
  RN.NativeModules.RTNFileManager) as {
  /**
   * @param path **Full** path to file
   */
  fileExists: (path: string) => Promise<boolean>;
  /**
   * Allowed URI schemes on Android: `file://`, `content://` ([See here](https://developer.android.com/reference/android/content/ContentResolver#accepts-the-following-uri-schemes:_3))
   */
  getSize: (uri: string) => Promise<boolean>;
  /**
   * @param path **Full** path to file
   * @param encoding Set to `base64` in order to encode response
   */
  readFile(path: string, encoding: "base64" | "utf8"): Promise<string>;
  saveFileToGallery?(
    uri: string,
    fileName: string,
    fileType: "PNG" | "JPEG",
  ): Promise<string>;
  /**
   * Beware! This function has differing functionality on iOS and Android.
   * @param storageDir Either `cache` or `documents`.
   * @param path Path in `storageDir`, parents are recursively created.
   * @param data The data to write to the file
   * @param encoding Set to `base64` if `data` is base64 encoded.
   * @returns Promise that resolves to path of the file once it got written
   */
  writeFile(
    storageDir: "cache" | "documents",
    path: string,
    data: string,
    encoding: "base64" | "utf8",
  ): Promise<string>;
  removeFile(storageDir: "cache" | "documents", path: string): Promise<unknown>;
  getConstants: () => {
    /**
     * The path the `documents` storage dir (see {@link writeFile}) represents.
     */
    DocumentsDirPath: string;
    CacheDirPath: string;
  };
  /**
   * Will apparently cease to exist some time in the future so please use {@link getConstants} instead.
   * @deprecated
   */
  DocumentsDirPath: string;
};

export const RNFSManager = RN.NativeModules.RNFSManager;