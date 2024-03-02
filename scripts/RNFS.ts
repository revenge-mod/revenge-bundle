// this is a basic rewrite for the RNFS js wrapper, with support for DCDFileManager for backwards compability

import { RNFileManager, RNFSManager } from "../deps";

type Encoding = "utf8" | "ascii" | "base64";
type EncodingOrOptions =
  | Encoding
  | {
      encoding: Encoding;
    };

const normalizeFilePath = (path: string) =>
  path.startsWith("file://") ? path.slice(7) : path;

const getOptions = (encoding?: EncodingOrOptions): { encoding: Encoding } => {
  if (typeof encoding === "string") {
    if (["utf8", "ascii", "base64"].includes(encoding)) return { encoding };
    else throw new Error(`Invalid encoding type "${String(encoding)}"`);
  } else if (!encoding)
    return {
      encoding: "utf8",
    };
  else return encoding;
};

const readFileGeneric = (
  filepath: string,
  encoding: EncodingOrOptions | undefined,
  command: (...args: any[]) => any,
) => {
  const options = getOptions(encoding);

  return command(normalizeFilePath(filepath)).then((b64: string) => {
    let contents: string;

    if (options.encoding === "utf8") {
      contents = Buffer.from(b64, "base64").toString("utf8");
    } else if (options.encoding === "ascii") {
      contents = Buffer.from(b64, "base64").toString("ascii");
    } else if (options.encoding === "base64") {
      contents = b64;
    }

    return contents;
  });
};

const resolveWrite = (filepath: string) => {
  //REVIEW DOES THE FILE PATH END WITH A /
  //it does not
  let write = {
    style: null as "cache" | "documents" | null,
    path: null as string | null,
  };

  const constants = RNFileManager.getConstants();
  if (filepath.startsWith(constants.DocumentsDirPath))
    write = {
      style: "documents",
      path: filepath.slice(constants.DocumentsDirPath.length + 1),
    };
  else if (filepath.startsWith(constants.CacheDirPath))
    write = {
      style: "cache",
      path: filepath.slice(constants.CacheDirPath.length + 1),
    };
  else
    throw new Error(
      `File path "${String(
        filepath,
      )}" is unsupported on versions <211.6 (not a caches/documents path, missing RNFS)`,
    );
  return write;
};

const RNFS = {
  unlink(filepath: string): Promise<void> {
    if (RNFSManager)
      return RNFSManager.unlink(normalizeFilePath(filepath)).then(() => void 0);

    const write = resolveWrite(filepath);
    return RNFileManager.removeFile(write.style, write.path).then(() => void 0);
  },
  exists(filepath: string): Promise<boolean> {
    if (RNFSManager) return RNFSManager.exists(normalizeFilePath(filepath));
    else return RNFileManager.fileExists(normalizeFilePath(filepath));
  },
  readFile(filepath: string, encoding?: EncodingOrOptions): Promise<string> {
    if (RNFSManager)
      return readFileGeneric(filepath, encoding, RNFSManager.readFile);
    else {
      const options = getOptions(encoding);
      if (options.encoding === "ascii")
        throw new Error(
          `Encoding type "ascii" is unsupported on versions <211.6 (missing RNFS)`,
        );
      else return RNFileManager.readFile(filepath, options.encoding);
    }
  },
  writeFile(
    filepath: string,
    contents: string,
    encoding?: EncodingOrOptions,
  ): Promise<void> {
    const options = getOptions(encoding);
    if (!RNFSManager) {
      if (options.encoding === "ascii")
        throw new Error(
          `Encoding type "ascii" is unsupported on versions <211.6 (missing RNFS)`,
        );

      const write = resolveWrite(filepath);
      return RNFileManager.writeFile(
        write.style,
        write.path,
        contents,
        options.encoding,
      ).then(() => void 0);
    }

    let b64: string;
    if (options.encoding === "utf8") {
      b64 = Buffer.from(contents, "utf8").toString("base64");
    } else if (options.encoding === "ascii") {
      b64 = Buffer.from(contents, "ascii").toString("base64");
    } else if (options.encoding === "base64") {
      b64 = contents;
    }

    return RNFSManager.writeFile(normalizeFilePath(filepath), b64, options);
  },
  mkdir(filepath: string): Promise<void> {
    if (!RNFSManager)
      throw new Error(
        `Function 'mkdir' is unsupported on versions <211.6 (missing RNFS)`,
      );
    return RNFSManager.mkdir(normalizeFilePath(filepath), {}).then(
      () => void 0,
    );
  },

  MainBundlePath: RNFSManager?.RNFSMainBundlePath,
  get CachesDirectoryPath() {
    return (
      RNFSManager?.RNFSCachesDirectoryPath ??
      RNFileManager.getConstants().CacheDirPath
    );
  },
  ExternalCachesDirectoryPath: RNFSManager?.RNFSExternalCachesDirectoryPath,
  get DocumentDirectoryPath() {
    return (
      RNFSManager?.RNFSDocumentDirectoryPath ??
      RNFileManager.getConstants().DocumentsDirPath
    );
  },
  DownloadDirectoryPath: RNFSManager?.RNFSDownloadDirectoryPath,
  ExternalDirectoryPath: RNFSManager?.RNFSExternalDirectoryPath,
  ExternalStorageDirectoryPath: RNFSManager?.RNFSExternalStorageDirectoryPath,
  TemporaryDirectoryPath: RNFSManager?.RNFSTemporaryDirectoryPath,
  LibraryDirectoryPath: RNFSManager?.RNFSLibraryDirectoryPath,
  PicturesDirectoryPath: RNFSManager?.RNFSPicturesDirectoryPath, // For Windows
  FileProtectionKeys: RNFSManager?.RNFSFileProtectionKeys,
  RoamingDirectoryPath: RNFSManager?.RNFSRoamingDirectoryPath, // For Windows

  hasRNFS: !!RNFSManager,
};
export default RNFS;