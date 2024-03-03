import { findByProps } from "@metro/filters";
import { ConfirmationAlertOptions, InputAlertProps } from "@types";
import InputAlert from "@ui/components/InputAlert";

const Alerts = findByProps("openLazy", "close");

interface InternalConfirmationAlertOptions
  extends Omit<ConfirmationAlertOptions, "content"> {
  content?: ConfirmationAlertOptions["content"];
  body?: ConfirmationAlertOptions["content"];
}

export function showConfirmationAlert(options: ConfirmationAlertOptions) {
  const internalOptions = options as InternalConfirmationAlertOptions;

  internalOptions.body = options.content;
  delete internalOptions.content;

  internalOptions.isDismissable ??= true;

  return Alerts.show(internalOptions);
}

export const showCustomAlert = (
  component: React.ComponentType<any>,
  props: any
) =>
  Alerts.openLazy({
    importer: async () => () => React.createElement(component, props),
  });

export const showInputAlert = (options: InputAlertProps) =>
  showCustomAlert(InputAlert, options);
