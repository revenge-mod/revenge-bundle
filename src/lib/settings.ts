import {
  createFileBackend,
  createMMKVBackend,
  createStorage,
  wrapSync
} from "@lib/storage";
import type { LoaderConfig, ExtendedVeryPrivateSoonToBeMovedSettings } from "@types";

export default wrapSync(
  createStorage<ExtendedVeryPrivateSoonToBeMovedSettings>(createMMKVBackend("VENDETTA_SETTINGS"))
);
export const loaderConfig = wrapSync(
  createStorage<LoaderConfig>(createFileBackend("vendetta_loader.json"))
);
