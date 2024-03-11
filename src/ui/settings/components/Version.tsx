import { TableRow } from "@/ui/components/Table";
import { clipboard } from "@metro/common";
import { getAssetIDByName } from "@ui/assets";
import { showToast } from "@ui/toasts";

interface VersionProps {
  label: string;
  version: string;
  icon: string;
}

export default function Version({ label, version, icon }: VersionProps) {
  return (
    <TableRow
      label={label}
      icon={getAssetIDByName(icon)}
      trailing={<TableRow.TrailingText text={version} />}
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
