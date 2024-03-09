import { ReactNative as RN, clipboard } from "@metro/common";
import type { Asset } from "@types";
import { getAssetIDByName } from "@ui/assets";
import { Forms } from "@ui/components";
import { showToast } from "@ui/toasts";

interface AssetDisplayProps {
  asset: Asset;
}

const { FormRow } = Forms;

export default function AssetDisplay({ asset }: AssetDisplayProps) {
  return (
    <FormRow
      label={`${asset.name} - ${asset.id}`}
      trailing={
        <RN.Image source={asset.id} style={{ width: 32, height: 32 }} />
      }
      onPress={() => {
        clipboard.setString(asset.name);
        showToast(
          "Copied asset name to clipboard.",
          getAssetIDByName("toast_copy_link")
        );
      }}
    />
  );
}
