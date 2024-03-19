import {
  createFileBackend,
  createMMKVBackend,
  createStorage,
  wrapSync
} from "@lib/storage";
import type {
  ExtendedVeryPrivateSoonToBeMovedSettings,
  LoaderConfig
} from "@types";

export default wrapSync(
  createStorage<ExtendedVeryPrivateSoonToBeMovedSettings>(
    createMMKVBackend("VENDETTA_SETTINGS")
  )
);
export const loaderConfig = wrapSync(
  createStorage<LoaderConfig>(createFileBackend("vendetta_loader.json"))
);
