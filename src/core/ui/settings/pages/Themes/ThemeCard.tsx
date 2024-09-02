import { formatString, Strings } from "@core/i18n";
import AddonCard, { CardWrapper } from "@core/ui/components/AddonCard";
import ColorManager from "@lib/addons/themes/colors/manager";
import { findAssetId } from "@lib/api/assets";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage/new";
import { clipboard } from "@metro/common";
import { showConfirmationAlert } from "@ui/alerts";
import { showToast } from "@ui/toasts";

type ColorDisplayInfo = ReturnType<typeof ColorManager.getDisplayInfo>;

export default function ThemeCard({ item: theme }: CardWrapper<ColorDisplayInfo>) {
    useProxy(ColorManager.preferences);

    const { authors } = theme;

    return (
        <AddonCard
            headerLabel={theme.name}
            headerSublabel={authors ? `by ${authors.map(i => i.name).join(", ")}` : ""}
            descriptionLabel={theme.description ?? "No description."}
            toggleType={!settings.safeMode?.enabled ? "radio" : undefined}
            toggleValue={() => ColorManager.preferences.selected === theme.id}
            onToggleChange={(v: boolean) => {
                ColorManager.select(v ? theme.id : null);
            }}
            overflowTitle={theme.name}
            overflowActions={[
                {
                    icon: "ic_sync_24px",
                    label: Strings.REFETCH,
                    onPress: () => {
                        ColorManager.refresh(theme.id).then(() => {
                            showToast(Strings.THEME_REFETCH_SUCCESSFUL, findAssetId("toast_image_saved"));
                        }).catch(() => {
                            showToast(Strings.THEME_REFETCH_FAILED, findAssetId("Small"));
                        });
                    },
                },
                {
                    icon: "copy",
                    label: Strings.COPY_URL,
                    onPress: () => {
                        clipboard.setString(ColorManager.infos[theme.id].sourceUrl);
                        showToast.showCopyToClipboard();
                    }
                },
                {
                    icon: "ic_message_delete",
                    label: Strings.DELETE,
                    isDestructive: true,
                    onPress: () => showConfirmationAlert({
                        title: Strings.HOLD_UP,
                        content: formatString("ARE_YOU_SURE_TO_DELETE_THEME", { name: theme.name }),
                        confirmText: Strings.DELETE,
                        cancelText: Strings.CANCEL,
                        confirmColor: "red",
                        onConfirm: () => {
                            ColorManager.uninstall(theme.id).catch((e: Error) => {
                                showToast(e.message, findAssetId("Small"));
                            });
                        }
                    })
                },
            ]}
        />
    );
}
