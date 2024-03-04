import {
  createFileBackend,
  createMMKVBackend,
  createStorage,
  wrapSync
} from "@lib/storage";
import { LoaderConfig, Settings } from "@types";

export default wrapSync(
  createStorage<Settings>(createMMKVBackend("VENDETTA_SETTINGS"))
);
export const loaderConfig = wrapSync(
  createStorage<LoaderConfig>(createFileBackend("vendetta_loader.json"))
);
