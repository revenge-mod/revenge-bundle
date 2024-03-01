import { ReactNative as RN, url } from "@metro/common";
import { DISCORD_SERVER, GITHUB } from "@lib/constants";
import { getDebugInfo, toggleSafeMode } from "@lib/debug";
import { removeMMKVBackend, useProxy } from "@lib/storage";
import { BundleUpdaterManager } from "@lib/native";
import { getAssetIDByName } from "@ui/assets";
import { Forms, Summary, ErrorBoundary } from "@ui/components";
import settings from "@lib/settings";
import Version from "@ui/settings/components/Version";
import { showConfirmationAlert } from '@ui/alerts'
import { ButtonColors } from '@types'
import { lang } from "..";

const { FormRow, FormSwitchRow, FormSection, FormDivider } = Forms;
const debugInfo = getDebugInfo();

export default function General() {
    useProxy(settings);

    const versions = [
        {
            label: "Revenge",
            version: debugInfo.vendetta.version,
            icon: "ic_progress_wrench_24px",
        },
        {
            label: "Discord",
            version: `${debugInfo.discord.version} (${debugInfo.discord.build})`,
            icon: "Discord",
        },
        {
            label: "React",
            version: debugInfo.react.version,
            icon: "ic_category_16px",
        },
        {
            label: "React Native",
            version: debugInfo.react.nativeVersion,
            icon: "mobile",
        },
        {
            label: lang.format("info.bytecode", {}),
            version: debugInfo.hermes.bytecodeVersion,
            icon: "ic_server_security_24px",
        },
    ];

    const platformInfo = [
        {
            label: lang.format("info.loader", {}),
            version: debugInfo.vendetta.loader,
            icon: "ic_download_24px",
        },
        {
            label: lang.format("info.os", {}),
            version: `${debugInfo.os.name} ${debugInfo.os.version}`,
            icon: "ic_cog_24px"
        },
        ...(debugInfo.os.sdk ? [{
            label: "SDK",
            version: debugInfo.os.sdk,
            icon: "ic_profile_badge_verified_developer_color"
        }] : []),
        {
            label: lang.format("info.manufacturer", {}),
            version: debugInfo.device.manufacturer,
            icon: "ic_badge_staff"
        },
        {
            label: lang.format("info.brand", {}),
            version: debugInfo.device.brand,
            icon: "ic_settings_boost_24px"
        },
        {
            label: lang.format("info.model", {}),
            version: debugInfo.device.model,
            icon: "ic_phonelink_24px"
        },
        {
            label: RN.Platform.select({ android: lang.format("info.android", {}), ios: lang.format("info.bytecode", {})})!,
            version: debugInfo.device.codename,
            icon: "ic_compose_24px"
        }
    ];

    return (
        <ErrorBoundary>
            <RN.ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
                <FormSection title={lang.format("header.links", {})} titleStyleType="no_border">
                    <FormRow
                        label={lang.format("discord", {})}
                        leading={<FormRow.Icon source={getAssetIDByName("Discord")} />}
                        trailing={FormRow.Arrow}
                        onPress={() => url.openDeeplink(DISCORD_SERVER)}
                    />
                    <FormDivider />
                    <FormRow
                        label="GitHub"
                        leading={<FormRow.Icon source={getAssetIDByName("img_account_sync_github_white")} />}
                        trailing={FormRow.Arrow}
                        onPress={() => url.openURL(GITHUB)}
                    />
                </FormSection>
                <FormSection title={lang.format("header.actions", {})}>
                    <FormRow
                        label={lang.format("actions.reload", {})}
                        leading={<FormRow.Icon source={getAssetIDByName("ic_message_retry")} />}
                        onPress={() => BundleUpdaterManager.reload()}
                    />
                    <FormDivider />
                    <FormRow
                        label={settings.safeMode?.enabled ? lang.format("actions.safemode.disable", {}) : lang.format("actions.safemode.enable", {})}
                        subLabel={`${lang.format("actions.safemode", {})} ${settings.safeMode?.enabled ? lang.format("actions.safemode.normal", {}) : lang.format("actions.safemode.noplugins", {})`}
                        leading={<FormRow.Icon source={getAssetIDByName("ic_privacy_24px")} />}
                        onPress={toggleSafeMode}
                    />
                    <FormDivider />
                    <FormSwitchRow
                        label={lang.format("actions.devmode", {})}
                        leading={<FormRow.Icon source={getAssetIDByName("ic_progress_wrench_24px")} />}
                        value={settings.developerSettings}
                        onValueChange={(v: boolean) => {
                            settings.developerSettings = v;
                        }}
                    />
                </FormSection>
                <FormSection title={lang.format("header.info", {})}>
                    <Summary label={lang.format("header.versions", {})} icon="ic_information_filled_24px">
                        {versions.map((v, i) => (
                            <>
                                <Version label={v.label} version={v.version} icon={v.icon} />
                                {i !== versions.length - 1 && <FormDivider />}
                            </>
                        ))}
                    </Summary>
                    <FormDivider />
                    <Summary label={lang.format("header.platform", {})} icon="ic_mobile_device">
                        {platformInfo.map((p, i) => (
                            <>
                                <Version label={p.label} version={p.version} icon={p.icon} />
                                {i !== platformInfo.length - 1 && <FormDivider />}
                            </>
                        ))}
                    </Summary>
                </FormSection>
                <FormSection title={lang.format("header.advanced", {})}>
                    <FormRow
                        label={lang.format("actions.clear.plugin.title", {})}
                        leading={<FormRow.Icon source={getAssetIDByName("ic_message_delete")} />}
                        onPress={() => showConfirmationAlert({
                            title: lang.format("actions.clear.plugin", {}),
                            content: lang.format("actions.clear.plugin.warn", {}),
                            confirmText: lang.format("actions.clear.confirm", {}),
                            cancelText: lang.format("button.cancel", {}),
                            confirmColor: ButtonColors.RED,
                            onConfirm: () => {
                                removeMMKVBackend('VENDETTA_PLUGINS')
                                BundleUpdaterManager.reload()
                            },
                        })}
                    />
                    <FormDivider />
                    <FormRow
                        label={lang.format("actions.clear.theme", {})}
                        leading={<FormRow.Icon source={getAssetIDByName("ic_message_delete")} />}
                        onPress={() => showConfirmationAlert({
                            title: lang.format("actions.clear.theme.title", {}),
                            content: lang.format("actions.clear.theme.warn", {}),
                            confirmText: lang.format("actions.clear.confirm", {}),
                            cancelText: lang.format("button.cancel", {}),
                            confirmColor: ButtonColors.RED,
                            onConfirm: () => {
                                removeMMKVBackend('VENDETTA_THEMES')
                                BundleUpdaterManager.reload()
                            },
                        })}
                    />
                </FormSection>
            </RN.ScrollView>
        </ErrorBoundary>
    )
}
