import { proxyLazy } from "@lib/utils/lazy";

import { getMetroCache } from "./caches";
import { findExports } from "./finders";
import { metroModules, subscribeModule } from "./modules";
import type { FilterFn } from "./types";

const proxyInfoMap = new WeakMap<{}, FindProxyInfo<any[]>>();

interface FindProxyInfo<A extends unknown[]> {
    filter: FilterFn<A>;
    indexed: boolean;
    moduleId: number | undefined;
    getExports(cb: (exports: any) => void): () => void;
    subscribe(cb: (exports: any) => void): () => void;
    unproxy(): any;
    get cache(): any;
}

function getIndexedSingleFind<A extends unknown[]>(filter: FilterFn<A>) {
    const modulesMap = getMetroCache().findIndex[filter.uniq];
    if (!modulesMap) return;
    const id = Object.keys(modulesMap).filter(k => k !== "_")[0];
    return id ? Number(id) : void 0;
}

function subscribeModuleForFind(proxy: any, callback: (exports: any) => void) {
    const info = getFindProxyInfo(proxy);
    if (!info) throw new Error("Subscribing a module for non-proxy-find");
    if (!info.indexed) throw new Error("Attempting to subscribe to a non-indexed find");

    return subscribeModule(info.moduleId!, () => {
        callback(findExports(info.filter));
    });
}

export function getFindProxyInfo<A extends unknown[]>(proxy: any): FindProxyInfo<A> | void {
    return proxyInfoMap.get(proxy) as unknown as FindProxyInfo<A>;
}

export function createFindProxy<A extends unknown[]>(filter: FilterFn<A>) {
    let cache: any = undefined;

    const moduleId = getIndexedSingleFind(filter);
    const info: FindProxyInfo<A> = {
        filter,
        indexed: !!moduleId,
        moduleId,
        getExports(cb: (exports: any) => void) {
            if (!moduleId || metroModules[moduleId]?.isInitialized) {
                return cb(findExports(filter)), () => { };
            }
            return this.subscribe(cb);
        },
        subscribe(cb: (exports: any) => void) {
            return subscribeModuleForFind(proxy, cb);
        },
        get cache() {
            return cache;
        },
        unproxy() {
            return cache ??= findExports(filter);
        }
    };

    const proxy = proxyLazy(() => cache ??= findExports(filter));
    proxyInfoMap.set(proxy, info as FindProxyInfo<any>);

    return proxy;
}
