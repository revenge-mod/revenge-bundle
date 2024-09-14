import { logger } from "@core/logger";
import { findAssetId } from "@lib/api/assets";
import { after } from "@lib/api/patcher";
import { showToast } from "@lib/ui/toasts";

export let socket: WebSocket;

export function connectToDebugger(url: string) {
    if (socket !== undefined && socket.readyState !== WebSocket.CLOSED) socket.close();

    if (!url) {
        showToast("Invalid debugger URL!", findAssetId("Small"));
        return;
    }

    socket = new WebSocket(`ws://${url}`);

    socket.addEventListener("open", () => showToast("Connected to debugger.", findAssetId("Check")));
    socket.addEventListener("message", (message: any) => {
        try {
            (0, eval)(message.data);
        } catch (e) {
            logger.error(e);
        }
    });

    socket.addEventListener("error", (err: any) => {
        logger.log(`Debugger error: ${err.message}`);
        showToast("An error occurred with the debugger connection!", findAssetId("Small"));
    });
}

/**
 * @internal
 */
export function patchLogHook() {
    const unpatch = after("nativeLoggingHook", globalThis, (args) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ message: args[0], level: args[1] }));
        }
    });

    return () => {
        socket?.close();
        unpatch();
    };
}
