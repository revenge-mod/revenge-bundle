import type { Metro } from "@metro/types";
import { version } from "bunny-build-info";

// @ts-ignore - window is defined later in the bundle, so we assign it early
globalThis.window = globalThis;

async function initializeRevenge() {
    try {
        // Make 'freeze' and 'seal' do nothing
        Object.freeze = Object.seal = Object;

        await require("@metro/internals/caches").initMetroCache();
        await require(".").default();
    } catch (e) {
        const { ClientInfoManager } = require("@lib/api/native/modules");
        const stack = e instanceof Error ? e.stack : undefined;

        console.log(stack ?? e?.toString?.() ?? e);
        alert([
            "Failed to load Revenge!\n",
            `Build Number: ${ClientInfoManager.getConstants().Build}`,
            `Revenge: ${version}`,
            stack || e?.toString?.(),
        ].join("\n"));
    }
}

if (typeof window.__r === "undefined") {
    // Used for storing the current require function for the global.__r getter defined below
    var _requireFunc: any;

    // Calls from the native side are deferred until the index.ts(x) is loaded
    // Revenge delays the execution of index.ts(x) because Revenge's initialization is asynchronous
    interface DeferredQueue {
        object: any;
        original: any;
        method: string;
        args: any[];
    }

    const deferredCalls: Array<DeferredQueue> = [];

    const deferMethodExecution = (object: any, method: string, condition?: (...args: any[]) => boolean) => {
        const originalMethod = object[method];
        object[method] = (...args: any[]) => {
            if (condition && !condition(...args)) {
                originalMethod(...args);
                return;
            }

            deferredCalls.push({ object, original: originalMethod, method, args });
        };
    }

    const resumeDeferredAndRestore = () => {
        for (const { object, method, args, original } of deferredCalls) {
            object[method] = original;
            object[method](...args);
        }

        deferredCalls.length = 0;
    }

    const onceIndexRequired = (originalRequire: Metro.RequireFn) => {
        // We hold calls from the native side
        if (window.__fbBatchedBridge) {
            deferMethodExecution(window.__fbBatchedBridge, "callFunctionReturnFlushedQueue", args => {
                // If the call is to AppRegistry, we want to defer it because it is not yet registered (Revenge delays it)
                // Same goes to the non-callable modules, which are not registered yet, so we ensure that only registered ones can get through
                return args[0] !== "AppRegistry" && window.__fbBatchedBridge.getCallableModule(args[0]);
            });
        }

        // Introduced since RN New Architecture
        if (window.RN$AppRegistry) {
            deferMethodExecution(window.RN$AppRegistry, "runApplication");
        }

        const startDiscord = async () => {
            await initializeRevenge();
            originalRequire(0);

            resumeDeferredAndRestore();
        };

        startDiscord();
    }

    Object.defineProperties(globalThis, {
        __r: {
            configurable: true,
            get: () => _requireFunc,
            set(v) {
                // _requireFunc is required here, because using 'this' here errors for some unknown reason
                _requireFunc = function patchedRequire(a: number) {
                    // Initializing index.ts(x)
                    if (a === 0) {
                        if (window.modules instanceof Map) window.modules = Object.fromEntries(window.modules);
                        onceIndexRequired(v);
                        _requireFunc = v;
                    } else return v(a);
                };
            }
        },
        __d: {
            configurable: true,
            get() {
                // @ts-ignore - I got an error where 'Object' is undefined *sometimes*, which is literally never supposed to happen
                if (window.Object && !window.modules) {
                    window.modules = window.__c?.();
                }
                return this.value;
            },
            set(v) { this.value = v; }
        }
    });
} else {
    // It is too late to late to hook __r, so we just initialize Revenge here
    // Likely because of using the legacy loader (from Vendetta)
    initializeRevenge();
}