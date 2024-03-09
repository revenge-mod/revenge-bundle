import {
  createFileBackend,
  createMMKVBackend,
  createStorage,
  wrapSync
} from "@lib/storage";
import type { LoaderConfig, Settings } from "@types";

export default wrapSync(
  createStorage<Settings>(createMMKVBackend("VENDETTA_SETTINGS"))
);
export const loaderConfig = wrapSync(
  createStorage<LoaderConfig>(createFileBackend("vendetta_loader.json"))
);
