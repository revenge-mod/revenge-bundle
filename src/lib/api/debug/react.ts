import { logger } from "@lib/utils/logger";
import { getReactDevToolsProp, isReactDevToolsPreloaded } from "../native/loader";
import { showToast } from "@lib/ui/toasts";
import { findAssetId } from "../assets";

const rdtPort = 8097;

export let rdtClient: WebSocket | null = null;
export let rdtConnected = false;

// this is a replacement for Emitter
const changeHooks = new Set<(value: boolean) => void>();

function bump() {
    for (const x of changeHooks) x(rdtConnected);
}
function cleanup() {
    rdtClient = null;
    rdtConnected = false;
    bump();
}

/** @internal */
export function connectRdt(url: string, quiet?: boolean) {
    if (!isReactDevToolsPreloaded() || rdtClient) return;

    const base = url.split(":").slice(0, -1);
    const ws = (rdtClient = new WebSocket(`ws://${base}:${rdtPort}`));

    ws.addEventListener('open', () => {
        if (!quiet) showToast("Connected to React DevTools", findAssetId("CheckmarkSmallIcon"));

        rdtConnected = true;
        bump();
    });

    ws.addEventListener('close', () => {
        cleanup();
    });

    ws.addEventListener('error', (e: any) => {
        cleanup();

        const err = e?.message ?? e?.stack ?? String(e);
        logger.error('React DevTools error:', err);

        if (!quiet) showToast(err, findAssetId("CircleXIcon-primary"));
    });

    window[getReactDevToolsProp() || "__vendetta_rdc"].connectToDevTools({
        websocket: ws,
    });
}

export function disconnectRdt() {
    rdtClient?.close();
}

export function useIsRdtConnected() {
    const [connected, update] = React.useState(rdtConnected);

    React.useEffect(() => {
        changeHooks.add(update);
        return () => void changeHooks.delete(update);
    });

    return connected;
}
