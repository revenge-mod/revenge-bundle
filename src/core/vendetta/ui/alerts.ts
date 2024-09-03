import { findByPropsLazy } from "@metro/wrappers";

import InputAlert, { InputAlertProps } from "./components/InputAlert";

const Alerts = findByPropsLazy("openLazy", "close");

export function showConfirmationAlert(options: any) {
    const internalOptions = options;

    internalOptions.body = options.content;
    delete internalOptions.content;

    internalOptions.isDismissable ??= true;

    return Alerts.show(internalOptions);
}

export const showCustomAlert = (component: React.ComponentType<any>, props: any) => Alerts.openLazy({
    importer: async () => () => React.createElement(component, props),
});

export const showInputAlert = (options: InputAlertProps) => showCustomAlert(InputAlert, options);
