//! Adapted from https://github.com/revenge-mod/revenge-bundle-next/blob/cb3b12f2eedd46c29d289d578502561c9b56e30c/src/plugins/start/developer-kit/devtools.ts

import { DevToolsClient } from "@revenge-mod/devtools-client";
import { instead } from "../patcher";
import { LogLevel } from "@revenge-mod/devtools-shared/constants";
import { getDebugInfo } from ".";
import { React } from "@metro/common";
import { logger } from "@lib/utils/logger";
import { showToast } from "@lib/ui/toasts";
import { findAssetId } from "../assets";

export let dtClient: DevToolsClient | null = null;
export let dtConnected = false;

// this is a replacement for Emitter
const changeHooks = new Set<(value: boolean) => void>();

let intercepted = false;
function interceptLogging() {
    if (intercepted) return;
    intercepted = true;

    const unpatches: (() => void)[] = [];
    for (const [key, level] of [
        ['log', LogLevel.Default],
        ['warn', LogLevel.Warn],
        ['error', LogLevel.Error],
        ['info', LogLevel.Default],
        ['debug', LogLevel.Debug],
    ] as const) {
        unpatches.push(
            instead(key, console, (args, orig) => {
                if (dtConnected && dtClient)
                    dtClient.log(level, args);
                return Reflect.apply(orig, console, args);
            }),
        );
    }

    return () => {
        intercepted = false;
        for (const unpatch of unpatches) unpatch();
    };
}

function bump() {
    for (const x of changeHooks) x(dtConnected);
}
function cleanup() {
    dtClient = null;
    dtConnected = false;
    bump();
}

/** @internal */
export function connectDt(url: string, quiet?: boolean) {
    if (dtClient) return;

    const info = getDebugInfo();
    const client = (dtClient = new DevToolsClient());

    client.connect(
        `ws://${url}`,
        `${info.discord.version} (${info.bunny.loader.name}-${info.bunny.loader.version})`,
    );

    const ws = client.ws!;

    ws.addEventListener('open', () => {
        if (!quiet) showToast("Connected to DevTools", findAssetId("CheckmarkSmallIcon"));

        if (client.settings.log.interceptConsole) {
            const unintercept = interceptLogging();

            ws.addEventListener('close', function self() {
                unintercept?.();
                ws.removeEventListener('close', self);
            });
        }

        dtConnected = true;
        bump();
    });

    ws.addEventListener('close', () => {
        cleanup();
    });

    ws.addEventListener('error', (e: any) => {
        cleanup();

        const err = e?.message ?? e?.stack ?? String(e);
        logger.error('DevTools error:', err);

        if (!quiet) showToast(err, findAssetId("CircleXIcon-primary"));
    });
}

export function disconnectDt() {
    dtClient?.disconnect();
}

export function useIsDtConnected() {
    const [connected, update] = React.useState(dtConnected);

    React.useEffect(() => {
        changeHooks.add(update);
        return () => void changeHooks.delete(update);
    });

    return connected;
}
