import PluginReporter, {  } from "@core/reporter/PluginReporter";
import { PluginDisableReason, PluginStage } from "@core/reporter/PluginStage";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { tokens } from "@metro/common";

// TODO: export in common
const { useToken } = lazyDestructure(() => findByProps("useToken"));

export default function usePluginStatusColor(id: string) {
    PluginReporter.useReporter();

    const dangerBg = useToken(tokens.colors.STATUS_DANGER_BACKGROUND);
    const positiveBg = useToken(tokens.colors.STATUS_POSITIVE_BACKGROUND);
    const offlineBg = useToken(tokens.colors.STATUS_OFFLINE);

    const stage = PluginReporter.stages[id];
    const disableReason = PluginReporter.disableReason[id];

    if (stage === PluginStage.STARTED) {
        return positiveBg;
    }

    if (disableReason === PluginDisableReason.ERROR) {
        return dangerBg;
    }

    return offlineBg;
}
