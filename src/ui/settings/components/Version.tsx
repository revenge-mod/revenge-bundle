import { clipboard } from "@metro/common";
import { getAssetIDByName } from "@ui/assets";
import { Forms } from "@ui/components";
import { showToast } from "@ui/toasts";

interface VersionProps {
  label: string;
  version: string;
  icon: string;
}

const { FormRow, FormText } = Forms;

export default function Version({ label, version, icon }: VersionProps) {
  return (
    <FormRow
      label={label}
      leading={<FormRow.Icon source={getAssetIDByName(icon)} />}
      trailing={<FormText>{version}</FormText>}
      onPress={() => {
        clipboard.setString(`${label} - ${version}`);
        showToast(
          "Copied version to clipboard.",
          getAssetIDByName("toast_copy_link")
        );
      }}
    />
  );
}
