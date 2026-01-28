const turboModuleProxy = globalThis.__turboModuleProxy;

/**
 * Backwards compatible way to get a native module. Throws an error if the module is not found.
 *
 * Use this as a replacement to `TurboModuleRegistry.getEnforcing()`.
 *
 * @see {@link https://github.com/facebook/react-native/blob/main/packages/react-native/Libraries/TurboModule/TurboModuleRegistry.js#L19-L39 React Native's source}
 *
 * @param name The name of the native module to get.
 */
export function getNativeModule<T>(name: string): T | null {
    const module =
        // Non-bridgeless with TurboModules
        turboModuleProxy?.(name) ??
        // Bridgeless & legacy modules
        nativeModuleProxy[name];

    if (module) return module as T;

    throw new Error(`Unable to access native module: ${name}`);
}

const Bridge = getNativeModule<{
    getBBox(handle: number, options: object): object;
}>('RNSVGRenderableModule')!;

const BridgePromise = getNativeModule<{
    readAsDataURL(map: object): Promise<any>;
}>('FileReaderModule')!;

function makePayload(name: string, args: any[]): object {
    return {
        revenge: {
            method: name,
            args: args,
        },
    };
}

/**
 * Calls a method on the native module and returns a promise that resolves with the result.
 *
 * @param name The name of the native method to call.
 * @param args The arguments to pass to the native method.
 * @returns A promise that resolves with the result of the native method call.
 */
export async function callBridgeMethod<N extends MethodName>(
    name: N,
    args: MethodArgs<N>
): Promise<MethodResult<N>> {
    try {
        const result = await BridgePromise.readAsDataURL(
            makePayload(name, args),
        );

        if ('error' in result) throw result.error;
        if ('result' in result) return result.result as MethodResult<N>;

        throw 'The module did not return a valid result. The native hook must have failed.';
    } catch (error) {
        throw new Error(`Call failed: ${error}`);
    }
}

/**
 * Calls a method on the native module synchronously and returns the result.
 *
 * Only use synchronous methods when absolutely necessary, as they block JS execution until the native method returns.
 *
 * @param name The name of the native method to call.
 * @param args The arguments to pass to the native method.
 * @returns The result of the native method call.
 */
export function callBridgeMethodSync<N extends MethodName>(
    name: N,
    args: MethodArgs<N>
): MethodResult<N> {
    try {
        const result = Bridge.getBBox(0, makePayload(name, args)) as any;

        if ('error' in result) throw result.error;
        if ('result' in result) return result.result as MethodResult<N>;

        throw 'The module did not return a valid result. The native hook must have failed.';
    } catch (error) {
        throw new Error(`Call failed: ${error}`);
    }
}

/**
 * Get the bridge information.
 */
export function getBridgeInfo(): BridgeInfo | null {
    try {
        return callBridgeMethodSync('revenge.info', []);
    } catch (e) {
        nativeLoggingHook(
            `\u001b[31mFailed to get native bridge info: ${e}\u001b[0m`,
            2,
        );
        return null;
    }
}

export interface BridgeInfo {
    name: string;
    version: number;
}

export type MethodName = Extract<keyof Methods, string>;
export type MethodArgs<T extends MethodName> = Methods[T][0];
export type MethodResult<T extends MethodName> = Methods[T][1];

export interface Methods {
    'revenge.info': [[], BridgeInfo];
    'revenge.test': [[], {
        string: string;
        number: number;
        array: any[];
        object: object;
        boolean: boolean;
        args: any;
    }];

    'revenge.fs.getConstants': [[], {
        data: string;
        files: string;
        cache: string;
    }];
    'revenge.fs.delete': [[path: string], boolean];
    'revenge.fs.exists': [[path: string], boolean];
    'revenge.fs.read': [[path: string], string];
    'revenge.fs.write': [[path: string, contents: string], void];
    'revenge.alertError': [[error: string, version: string], null];
    'revenge.showRecoveryAlert': [[], void];
    'revenge.updater.clear': [[], void];
    'revenge.app.reload': [[], void];
}