import { ButtonColors, Theme } from "@types";
import { React, clipboard } from "@metro/common";
import { fetchTheme, removeTheme, selectTheme } from "@lib/themes";
import { useProxy } from "@lib/storage";
import { BundleUpdaterManager } from "@lib/native";
import { getAssetIDByName } from "@ui/assets";
import { showConfirmationAlert } from "@ui/alerts";
import { showToast } from "@ui/toasts";
import settings from "@lib/settings";
import Card, { CardWrapper } from "@ui/settings/components/Card";
import { lang } from "..";

async function selectAndReload(value: boolean, id: string) {
    await selectTheme(value ? id : "default");
    BundleUpdaterManager.reload();
}

export default function ThemeCard({ item: theme, index, highlight }: CardWrapper<Theme>) {
    useProxy(settings);
    const [removed, setRemoved] = React.useState(false);

    // This is needed because of React™
    if (removed) return null;

    const authors = theme.data.authors;

    return (
        <Card
            index={index}
            headerLabel={theme.data.name}
            headerSublabel={authors?.[0] && `by ${authors.map(i => i.name).join(", ")}`}
            descriptionLabel={theme.data.description ?? "No description."}
            toggleType={!settings.safeMode?.enabled ? "radio" : undefined}
            toggleValue={theme.selected}
            onToggleChange={(v: boolean) => {
                selectAndReload(v, theme.id);
            }}
            overflowTitle={theme.data.name}
            overflowActions={[
                {
                    icon: "ic_sync_24px",
                    label: lang.format("button.refetch", {}),
                    onPress: () => {
                        fetchTheme(theme.id, theme.selected).then(() => {
                            if (theme.selected) {
                                showConfirmationAlert({
                                    title: lang.format("theme.refetch.title", {}),
                                    content: lang.format("theme.refetch.prompt", {}),
                                    confirmText: lang.format("button.reload", {}),
                                    cancelText: lang.format("button.cancel", {}),
                                    confirmColor: ButtonColors.RED,
                                    onConfirm: () => BundleUpdaterManager.reload(),
                                })
                            } else {
                                showToast(lang.format("theme.refetch.success", {}), getAssetIDByName("toast_image_saved"));
                            }
                        }).catch(() => {
                            showToast(lang.format("theme.refetch.error", {}), getAssetIDByName("Small"));
                        });
                    },
                },
                {
                    icon: "copy",
                    label: lang.format("button.copy", {}),
                    onPress: () => {
                        clipboard.setString(theme.id);
                        showToast(lang.format("button.copy.toast", {}), getAssetIDByName("toast_copy_link"));
                    }
                },
                {
                    icon: "ic_message_delete",
                    label: lang.format("button.delete", {}),
                    isDestructive: true,
                    onPress: () => showConfirmationAlert({
                        title: "Wait!",
                        content: `${lang.format("theme.delete.prompt", {})}`,
                        confirmText: lang.format("button.delete", {}),
                        cancelText: lang.format("button.cancel", {}),
                        confirmColor: ButtonColors.RED,
                        onConfirm: () => {
                            removeTheme(theme.id).then((wasSelected) => {
                                setRemoved(true);
                                if (wasSelected) selectAndReload(false, theme.id);
                            }).catch((e: Error) => {
                                showToast(e.message, getAssetIDByName("Small"));
                            });
                        }
                    })
                },
            ]}
            highlight={highlight}
        />
    )
}
