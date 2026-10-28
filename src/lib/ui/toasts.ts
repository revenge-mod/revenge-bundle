import { Strings } from "@core/i18n";
import { findAssetId } from "@lib/api/assets";
import { instead } from "@lib/api/patcher";
import { lazyDestructure } from "@lib/utils/lazy";
import { React, ReactNative as RN, toasts } from "@metro/common";
import { findByProps } from "@metro/wrappers";

const { uuid4 } = lazyDestructure(() => findByProps("uuid4"));

const assetIcons = new Map<number, React.ComponentType<any>>();

function toToastIcon(icon: unknown) {
    if (typeof icon !== "number") return icon;

    let Icon = assetIcons.get(icon);
    if (!Icon) {
        Icon = ({ style, color }: { style?: any; color?: string; }) => React.createElement(RN.Image, {
            source: icon,
            style: [{ width: 18, height: 18, tintColor: color }, style]
        });
        assetIcons.set(icon, Icon);
    }

    return Icon;
}

export function patchToasts() {
    return instead("open", toasts, (args, orig) => {
        const [options] = args;
        if (toasts.open.length < 2 || args.length !== 1 || options == null || typeof options !== "object") {
            return orig.apply(toasts, args);
        }

        const { key, content, text, source, icon, ...rest } = options;
        return orig.call(toasts, key ?? `vd-toast-${uuid4()}`, {
            ...rest,
            text: text ?? content,
            icon: toToastIcon(icon ?? source)
        });
    });
}

export const showToast = (content: string, asset?: number) => toasts.open({
    // ? In build 182205/44707, Discord changed their toasts, source is no longer used, rather icon, and a key is needed.
    // TODO: We could probably have the developer specify a key themselves, but this works to fix toasts
    key: `vd-toast-${uuid4()}`,
    content: content,
    source: asset,
    icon: asset,
});

showToast.showCopyToClipboard = (message = Strings.COPIED_TO_CLIPBOARD) => {
    showToast(message, findAssetId("LinkIcon"));
};
