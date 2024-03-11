import { findByProps } from "@metro/filters";
import type { InputAlertProps } from "@types";
import { Alert, Forms } from "@ui/components";
import { TableInput } from "./Table";

const { FormInput } = Forms;
const Alerts = findByProps("openLazy", "close");

export default function InputAlert({
  title,
  confirmText,
  confirmColor,
  onConfirm,
  cancelText,
  placeholder,
  initialValue = "",
  secureTextEntry
}: InputAlertProps) {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState("");

  function onConfirmWrapper() {
    const asyncOnConfirm = Promise.resolve(onConfirm(value));

    asyncOnConfirm
      .then(() => {
        Alerts.close();
      })
      .catch((e: Error) => {
        setError(e.message);
      });
  }

  return (
    <Alert
      title={title}
      confirmText={confirmText}
      confirmColor={confirmColor}
      isConfirmButtonDisabled={error.length !== 0}
      onConfirm={onConfirmWrapper}
      cancelText={cancelText}
      onCancel={() => Alerts.close()}
    >
      <TableInput
        placeholder={placeholder}
        value={value}
        onChange={(v: string | { text: string }) => {
          setValue(typeof v === "string" ? v : v.text);
          if (error) setError("");
        }}
        returnKeyType="done"
        onSubmitEditing={onConfirmWrapper}
        error={error || undefined}
        secureTextEntry={secureTextEntry}
        autoFocus={true}
      />
    </Alert>
  );
}
