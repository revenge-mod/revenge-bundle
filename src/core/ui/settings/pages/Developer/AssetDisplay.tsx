import { Asset, findAssetId } from "@lib/api/assets";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { clipboard } from "@metro/common";
import { Stack, TableRow, Text } from "@metro/common/components";
import { showToast } from "@ui/toasts";
import { Image, ScrollView } from "react-native";
import { requireModule } from "@metro/internals/modules";

const { openAlert } = lazyDestructure(() =>
  findByProps("openAlert", "dismissAlert"),
);
const { AlertModal, AlertActionButton } = lazyDestructure(() =>
  findByProps("AlertModal", "AlertActions"),
);

// More robust, normalized type checks and preview support.
// - Image types: standard raster/vector images
// - Text-like preview types: JSONA/JSON and Lottie (show raw JSON when possible)
const DISPLAYABLE_IMAGE_TYPES = new Set(["png", "jpg", "jpeg", "svg", "gif"]);
const DISPLAYABLE_TEXT_TYPES = new Set(["jsona", "json", "lottie"]);

// icon map uses lowercased keys
const iconMap: Record<string, string> = {
  jsona: "ic_file_text",
  lottie: "ic_image",
  webm: "CirclePlayIcon-primary",
  ttf: "ic_add_text",
  default: "UnknownGameIcon",
};

interface AssetDisplayProps {
  asset: Asset;
}

export default function AssetDisplay({ asset }: AssetDisplayProps) {
  // Normalize type checks to lowercase and guard against undefined
  const type = String(asset.type ?? "").toLowerCase();
  const isImage = DISPLAYABLE_IMAGE_TYPES.has(type);
  const isTextPreview = DISPLAYABLE_TEXT_TYPES.has(type);

  return (
    <TableRow
      variant={isImage || isTextPreview ? "default" : "danger"}
      label={asset.name}
      subLabel={`Index: ${asset.id} Type: ${asset.type}`}
      icon={
        isImage ? (
          <Image source={asset.id} style={{ width: 32, height: 32 }} />
        ) : (
          <TableRow.Icon
            variant="danger"
            source={findAssetId(
              type in iconMap
                ? iconMap[type as keyof typeof iconMap]
                : iconMap.default,
            )}
          />
        )
      }
      onPress={() =>
        openAlert(
          "revenge-asset-display-details",
          <AlertModal
            title={asset.name}
            content={`Index: ${asset.id}\nModule ID: ${asset.moduleId}\nType: ${asset.type}`}
            extraContent={
              isImage ? (
                <Image
                  resizeMode="contain"
                  source={asset.id}
                  style={{ flex: 1, width: "auto", height: 192 }}
                />
              ) : isTextPreview ? (
                // For JSON-like assets (jsona, json, lottie) attempt to require the module
                // and show a readable JSON/text preview. If loading fails, show a helpful message.
                (() => {
                  try {
                    const moduleExport = requireModule(asset.moduleId);
                    const printable =
                      typeof moduleExport === "object"
                        ? JSON.stringify(moduleExport, null, 2)
                        : String(moduleExport);
                    return (
                      <ScrollView style={{ maxHeight: 192, padding: 8 }}>
                        <Text
                          variant="text-sm/medium"
                          style={{ fontSize: 12, fontFamily: "monospace" }}
                        >
                          {printable}
                        </Text>
                      </ScrollView>
                    );
                  } catch (e) {
                    return (
                      <Text
                        variant="text-sm/medium"
                        color="text-warning"
                        style={{ width: "100%", textAlign: "center" }}
                      >
                        Could not load preview for {type.toUpperCase()}.
                      </Text>
                    );
                  }
                })()
              ) : (
                <Text
                  variant="text-sm/medium"
                  color="text-danger"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  Asset type {String(asset.type).toUpperCase()} is not supported
                  for preview.
                </Text>
              )
            }
            actions={
              <Stack>
                <AlertActionButton
                  text="Copy asset name"
                  variant="primary"
                  onPress={() => copyToClipboard(asset.name)}
                />
                <AlertActionButton
                  text="Copy asset index"
                  variant="secondary"
                  onPress={() => copyToClipboard(asset.id.toString())}
                />
              </Stack>
            }
          />,
        )
      }
    />
  );
}

const copyToClipboard = (text: string) => {
  clipboard.setString(text);
  showToast.showCopyToClipboard();
};
