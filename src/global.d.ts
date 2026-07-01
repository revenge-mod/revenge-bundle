declare global {
    type React = typeof import("react");

    // ReactNative/Hermes globals
    var globalEvalWithSourceUrl: (script: string, sourceURL: string) => any;
    var nativePerformanceNow: typeof performance.now;
    var nativeModuleProxy: Record<string, any>;
    var __turboModuleProxy: (name: string) => any;
    function nativeLoggingHook(str: string, level: number): void;

    interface Window {
        [key: string]: any;
        vendetta: any;
        bunny: typeof import("@lib");
    }
}

export { };
