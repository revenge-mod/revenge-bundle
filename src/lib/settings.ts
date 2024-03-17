import {
  createFileBackend,
  createMMKVBackend,
  createStorage,
  wrapSync
} from "@lib/storage";
import type { ExtendedVeryPrivateSoonToBeMovedLoaderConfig, ExtendedVeryPrivateSoonToBeMovedSettings } from "@types";

export default wrapSync(
  createStorage<ExtendedVeryPrivateSoonToBeMovedSettings>(createMMKVBackend("VENDETTA_SETTINGS"))
);
export const loaderConfig = wrapSync(
  createStorage<ExtendedVeryPrivateSoonToBeMovedLoaderConfig>(createFileBackend("vendetta_loader.json"))
);
