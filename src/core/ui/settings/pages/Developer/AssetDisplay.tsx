import { Asset, findAssetId } from "@lib/api/assets";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { clipboard } from "@metro/common";
import { Stack, TableRow, Text } from "@metro/common/components";
import { showToast } from "@ui/toasts";
import { Image } from "react-native";

const { openAlert } = lazyDestructure(() => findByProps("openAlert", "dismissAlert"));
const { AlertModal, AlertActionButton } = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

const displayable = new Set(['png', 'jpg', 'svg']);

const iconMap = {
    jsona: 'PaperIcon',
    lottie: 'ImageTextIcon',
    webm: 'CirclePlayIcon-primary',
    ttf: 'LettersIcon',
    default: 'UnknownGameIcon'
};

interface AssetDisplayProps { asset: Asset; }

export default function AssetDisplay({ asset }: AssetDisplayProps) {

    return (
        <TableRow
            variant={displayable.has(asset.type) ? 'default' : 'danger'}
            label={asset.name}
            subLabel={`Index: ${asset.id} Type: ${asset.type}`}
            icon={
                displayable.has(asset.type)
                    ? <Image source={asset.id} style={{ width: 32, height: 32 }} />
                    : <TableRow.Icon
                        variant='danger'
                        source={findAssetId(asset.type in iconMap ? iconMap[asset.type as keyof typeof iconMap] : iconMap.default)}
                    />
            }
            onPress={() =>
                openAlert("revenge-asset-display-details", <AlertModal
                    title={asset.name}
                    content={`Index: ${asset.id}\nModule ID: ${asset.moduleId}\nType: ${asset.type}`}
                    extraContent={
                        displayable.has(asset.type)
                            ? <Image resizeMode="contain" source={asset.id} style={{ flex: 1, width: 'auto', height: 192 }} />
                            : (<Text variant='text-sm/medium' color="text-danger" style={{ width: '100%', textAlign: 'center' }}>
                                Asset type {asset.type.toUpperCase()} is not supported for preview.
                            </Text>)
                    }
                    actions={
                        <Stack>
                            <AlertActionButton text="Copy asset name" variant="primary" onPress={() => copyToClipboard(asset.name)} />
                            <AlertActionButton text="Copy asset index" variant="secondary" onPress={() => copyToClipboard(asset.id.toString())} />
                        </Stack>
                    }
                />)
            }
        />
    );
}

const copyToClipboard = (text: string) => {
    clipboard.setString(text);
    showToast.showCopyToClipboard();
};