import { findAssetId } from "@lib/api/assets";
import { clipboard } from "@metro/common";
import { TableRow, TableRowTrailingText } from "@metro/common/components";
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
            icon={<TableRow.Icon source={findAssetId(icon)} />}
            trailing={<TableRowTrailingText text={version} />}
            onPress={() => {
                clipboard.setString(`${label} - ${version}`);
                showToast.showCopyToClipboard();
            }}
        />
    );
}
