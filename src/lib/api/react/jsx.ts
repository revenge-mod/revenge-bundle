import { after } from "@lib/api/patcher";
import { findByPropsLazy } from "@metro";

type Callback = (Component: any, ret: JSX.Element) => JSX.Element;
const callbacks = new Map<string, Callback[]>();

const jsxRuntime = findByPropsLazy("jsx", "jsxs");

export function onJsxCreate(Component: string, callback: Callback) {
    if (!callbacks.has(Component)) callbacks.set(Component, []);
    callbacks.get(Component)!.push(callback);
}

export function deleteJsxCreate(Component: string, callback: Callback) {
    if (!callbacks.has(Component)) return;
    const cbs = callbacks.get(Component)!;
    cbs.splice(cbs.indexOf(callback), 1);
    if (cbs.length === 0) callbacks.delete(Component);
}

/**
 * @internal
 */
export function patchJsx() {
    const callback = ([Component]: unknown[], ret: JSX.Element) => {
        // Band-aid fix for iOS invalid element type crashes
        if (typeof ret.type === 'undefined') {
            ret.type = 'RCTView'
            return ret
        }

        // The check could be more complex, but this is fine for now to avoid overhead
        const name = typeof Component === "function" ? Component.name
            : (Component as any)?.type?.name ?? (Component as any)?.render?.name;

        if (name && callbacks.has(name)) {
            const cbs = callbacks.get(name)!;
            for (const cb of cbs) {
                const _ret = cb(Component, ret);
                if (_ret !== undefined) ret = _ret;
            }
            return ret;
        }
    };

    const patches = [
        after("jsx", jsxRuntime, callback),
        after("jsxs", jsxRuntime, callback)
    ];

    return () => patches.forEach(unpatch => unpatch());
}
