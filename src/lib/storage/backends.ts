import { FileManager, MMKVManager } from "@lib/native";
import { ReactNative as RN } from "@metro/common";
import { StorageBackend } from "@types";

const ILLEGAL_CHARS_REGEX = /[<>:"/\\|?*]/g;

const filePathFixer = (file: string): string =>
  RN.Platform.select({
    default: file,
    ios: FileManager.saveFileToGallery ? file : `Documents/${file}`,
  });

const getMMKVPath = (name: string): string => {
  if (ILLEGAL_CHARS_REGEX.test(name)) {
    // Replace forbidden characters with hyphens
    name = name.replace(ILLEGAL_CHARS_REGEX, "-").replace(/-+/g, "-");
  }

  return `vd_mmkv/${name}`;
};

export const purgeStorage = async (store: string) => {
  if (await MMKVManager.getItem(store)) {
    MMKVManager.removeItem(store);
  }

  const mmkvPath = getMMKVPath(store);
  if (
    await FileManager.fileExists(
      `${FileManager.getConstants().DocumentsDirPath}/${mmkvPath}`
    )
  ) {
    await FileManager.removeFile?.("documents", mmkvPath);
  }
};

export const createMMKVBackend = (store: string) => {
  const mmkvPath = getMMKVPath(store);
  return createFileBackend(
    mmkvPath,
    (async () => {
      try {
        const path = `${
          FileManager.getConstants().DocumentsDirPath
        }/${mmkvPath}`;
        if (await FileManager.fileExists(path)) return;

        let oldData = (await MMKVManager.getItem(store)) ?? "{}";

        // From the testing on Android, it seems to return this if the data is too large
        if (oldData === "!!LARGE_VALUE!!") {
          const cachePath = `${
            FileManager.getConstants().CacheDirPath
          }/mmkv/${store}`;
          if (await FileManager.fileExists(cachePath)) {
            oldData = await FileManager.readFile(cachePath, "utf8");
          } else {
            console.log(`${store}: Experienced data loss :(`);
            oldData = "{}";
          }
        }

        await FileManager.writeFile(
          "documents",
          filePathFixer(mmkvPath),
          oldData,
          "utf8"
        );
        if ((await MMKVManager.getItem(store)) !== null) {
          MMKVManager.removeItem(store);
          console.log(
            `Successfully migrated ${store} store from MMKV storage to fs`
          );
        }
      } catch (err) {
        console.error("Failed to migrate to fs from MMKVManager ", err);
      }
    })()
  );
};

export const removeMMKVBackend = (store: string) => {
  const mmkvPath = getMMKVPath(store);
  return FileManager.removeFile("documents", filePathFixer(mmkvPath));
};

export const createFileBackend = (
  file: string,
  migratePromise?: Promise<void>
): StorageBackend => {
  let created: boolean;
  return {
    get: async () => {
      await migratePromise;
      const path = `${FileManager.getConstants().DocumentsDirPath}/${file}`;
      if (!created && !(await FileManager.fileExists(path)))
        return (
          (created = true),
          FileManager.writeFile("documents", filePathFixer(file), "{}", "utf8")
        );
      return JSON.parse(await FileManager.readFile(path, "utf8"));
    },
    set: async (data) => {
      await migratePromise;
      await FileManager.writeFile(
        "documents",
        filePathFixer(file),
        JSON.stringify(data),
        "utf8"
      );
    },
  };
};
