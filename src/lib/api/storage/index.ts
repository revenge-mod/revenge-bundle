// New iteration of storage API, mostly yoinked from unreleased pyoncord (and sunrise?)
import { Emitter } from "@core/vendetta/Emitter";
import { Observable } from "@gullerya/object-observer";
import { fileExists, readFile, removeFile, writeFile } from "@lib/api/native/fs";
import { RTNMMKVManager } from "@lib/api/native/rn-modules";

const storageInitErrorSymbol = Symbol.for("bunny.storage.initError");
const storagePromiseSymbol = Symbol.for("bunny.storage.promise");

const _loadedPath = {} as Record<string, any>;

function createFileBackend<T extends object>(filePath: string) {
    return {
        get: async () => {
            try {
                return JSON.parse(await readFile(filePath)) as T;
            } catch (e) {
                throw new Error(`Failed to parse storage from '${filePath}'`, { cause: e });
            }
        },
        set: async (data: T) => {
            if (!data || typeof data !== "object") {
                throw new Error("data needs to be an object");
            }
            await writeFile(filePath, JSON.stringify(data));
        },
        exists: async () => {
            return await fileExists(filePath);
        }
    };
}

/**
 * @internal
 */
export async function migrateToNewStorage(
    oldKey: string,
    callback: (data: any) => void | Promise<void>
): Promise<void> {
    const promise = new Promise<void>(r => resolvePromise = r);
    let resolvePromise: () => void;

    // @ts-expect-error - assigning to migrateToNewStorage._migrated
    const migratedKeys = migrateToNewStorage._migrated ??= await createStorageAsync<string[]>(".storage-v1-migrated", { dflt: [] });

    if (migratedKeys.includes(oldKey)) return;

    let fromMmkv: string | null;
    const sanitizedOldKey = oldKey.replace(/[<>:"/\\|?*]/g, "-").replace(/-+/g, "-");
    if (await fileExists(`../vd_mmkv/${sanitizedOldKey}`)) {
        createStorageAndCallback(`../vd_mmkv/${sanitizedOldKey}`, proxy => {
            Promise.resolve(callback(proxy)).then(() => resolvePromise());
        });
    // eslint-disable-next-line no-cond-assign
    } else if (fromMmkv = await RTNMMKVManager.getItem(oldKey)) {
        await callback(JSON.parse(fromMmkv));
        migratedKeys.push(oldKey);
        return Promise.resolve();
    }

    return promise.then(v => {
        migratedKeys.push(oldKey);
        return v;
    });
}

export function useObservable(...observables: Observable[]) {
    if (observables.some((o: any) => o?.[storageInitErrorSymbol])) throw new Error(
        "An error occured while initializing the storage",
    );

    if (observables.some(o => !Observable.isObservable(o))) {
        throw new Error("Argument passed isn't an Observable");
    }

    const [, forceUpdate] = React.useReducer(n => ~n, 0);

    React.useEffect(() => {
        const listener = () => forceUpdate();

        observables.forEach(o => Observable.observe(o, listener));

        return () => {
            observables.forEach(o => Observable.unobserve(o, listener));
        };
    }, []);
}

export async function updateStorageAsync<T extends object = {}>(path: string, value: T): Promise<void> {
    _loadedPath[path] = value;
    await createFileBackend<T>(path).set(value);
}

export function createStorageAndCallback<T extends object = {}>(
    path: string,
    cb: (proxy: T) => void,
    {
        dflt = {} as T,
        nullIfEmpty = false
    } = {}
) {
    let emitter: Emitter;

    const callback = (data: any) => {
        const proxy = new Proxy(Observable.from(data), {
            get(target, prop, receiver) {
                if (prop === Symbol.for("vendetta.storage.emitter")) {
                    if (emitter) return emitter;
                    emitter = new Emitter();

                    Observable.observe(target, changes => {
                        for (const change of changes) {
                            emitter.emit(change.type !== "delete" ? "SET" : "DEL", {
                                path: change.path,
                                value: change.value
                            });
                        }
                    });

                    return emitter;
                }

                return Reflect.get(target, prop, receiver);
            },
        });

        const handler = () => backend.set(proxy);
        Observable.observe(proxy, handler);

        cb(proxy);
    };

    const backend = createFileBackend<T>(path);
    if (_loadedPath[path]) callback(_loadedPath[path]);
    else {
        backend.exists().then(async exists => {
            if (!exists) {
                if (nullIfEmpty) {
                    callback(null);
                } else {
                    await backend.set(dflt);
                    callback(dflt);
                }
            } else {
                callback(await backend.get());
            }
        });
    }
}

type StorageOptions<T extends object> = Parameters<typeof createStorageAndCallback<T>>[2];

export async function createStorageAsync<T extends object = {}>(
    path: string,
    opts: StorageOptions<T> = {}
): Promise<T> {
    return new Promise(r => createStorageAndCallback(path, r, opts));
}

export const createStorage = <T extends object = {}>(
    path: string,
    opts: StorageOptions<T> = {}
): T => {
    const promise = new Promise(r => resolvePromise = r);
    let awaited: any, resolved: boolean, error: any, resolvePromise: (val?: unknown) => void;

    createStorageAndCallback(path, proxy => {
        awaited = proxy;
        resolved = true;
        resolvePromise();
    }, opts);

    const check = () => {
        if (resolved) return true;
        throw new Error(`Attempted to access storage without initializing: ${path}`);
    };

    return new Proxy({} as any, {
        ...Object.fromEntries(
            Object.getOwnPropertyNames(Reflect)
                .map(k => [k, (t: T, ...a: any[]) => {
                    // @ts-expect-error
                    return check() && Reflect[k](awaited, ...a);
                }])
        ),
        get(target, prop, recv) {
            if (prop === storageInitErrorSymbol) return error;
            if (prop === storagePromiseSymbol) return promise;
            return check() && Reflect.get(awaited ?? target, prop, recv);
        },
    });
};

export async function preloadStorageIfExists(path: string): Promise<boolean> {
    if (_loadedPath[path]) return true;

    const backend = createFileBackend(path);
    if (await backend.exists()) {
        _loadedPath[path] = await backend.get();
        return false;
    }

    return true;
}

export async function purgeStorage(path: string) {
    await removeFile(path);
    delete _loadedPath[path];
}

export function awaitStorage(...proxies: any[]) {
    return Promise.all(proxies.map(proxy => proxy[storagePromiseSymbol]));
}
