

export namespace RNModules {
    /**
     * A key-value storage based upon `SharedPreferences` on Android.
     *
     * These types are based on Android though everything should be the same between
     * platforms.
     */
    export interface MMKVManager {
        /**
         * Get the value for the given `key`, or null
         * @param key The key to fetch
         */
        getItem: (key: string) => Promise<string | null>;
        /**
         * Deletes the value for the given `key`
         * @param key The key to delete
        */
        removeItem: (key: string) => void;
        /**
         * Sets the value of `key` to `value`
         */
        setItem: (key: string, value: string) => void;
        /**
         * Goes through every item in storage and returns it, excluding the
         * keys specified in `exclude`.
         * @param exclude A list of items to exclude from result
         */
        refresh: (exclude: string[]) => Promise<Record<string, string>>;
        /**
         * You will be murdered if you use this function.
         * Clears ALL of Discord's settings.
         */
        clear: () => void;
    }

    export interface FileManager {
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
        saveFileToGallery?(uri: string, fileName: string, fileType: "PNG" | "JPEG"): Promise<string>;
        /**
         * @param storageDir Either `cache` or `documents`.
         * @param path Path in `storageDir`, parents are recursively created.
         * @param data The data to write to the file
         * @param encoding Set to `base64` if `data` is base64 encoded.
         * @returns Promise that resolves to path of the file once it got written
         */
        writeFile(storageDir: "cache" | "documents", path: string, data: string, encoding: "base64" | "utf8"): Promise<string>;
        /**
         * Removes a file from the path given.
         * (!) On Android, this always returns false, regardless if it fails or not!
         * @param storageDir Either `cache` or `documents`
         * @param path Path to the file to be removed
         */
        removeFile(storageDir: "cache" | "documents", path: string): Promise<unknown>;
        /**
         * Clear the folder from the path given
         * (!) On Android, this only clears all *files* and not subdirectories!
         * @param storageDir Either `cache` or `documents`
         * @param path Path to the folder to be cleared
         * @returns Whether the clearance succeeded
         */
        clearFolder(storageDir: "cache" | "documents", path: string): Promise<boolean>;
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
    }

    export interface ClientInfoModule {
        getConstants(): {
            /**
             * Sentry ingestion DSN URL for alpha/beta builds
             */
            SentryAlphaBetaDsn: string
            /**
             * Sentry ingestion DSN URL for staff builds (?)
             */
            SentryStaffDsn: string
            /**
             * Sentry ingestion DSN URL for stable builds
             */
            SentryDsn: string
            DeviceVendorID: string
            Manifest: string
            /**
             * Version code
             *
             * Follows the format of `{MINOR}{CHANNEL}{PATCH}` for `{MINOR}.{PATCH} ({CHANNEL})`
             * - `248200` for `248.0 (alpha)`
             * - `247105` for `247.5 (beta)`
             * - `246011` for `246.11 (stable)`
             */
            Build: string
            /**
             * Version string
             *
             * Eg. `248.0`
             */
            Version: string
            /**
             * Release channel
             */
            ReleaseChannel: string
            /**
             * Matches `Version`
             */
            OTABuild: string
            /**
             * Identifier for the installed client
             *
             * - **Android**: Package name
             * - **iOS**: Bundle ID
             */
            Identifier: string
        }
    }
}
