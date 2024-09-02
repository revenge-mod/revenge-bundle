import { Strings } from "@core/i18n";
import PluginManager from "@lib/addons/plugins/manager";
import { ApplicationCommand, ApplicationCommandOptionType } from "@lib/api/commands/types";
import { messageUtil } from "@metro/common";

export default () => <ApplicationCommand>{
    name: "plugins",
    description: Strings.COMMAND_PLUGINS_DESC,
    options: [
        {
            name: "ephemeral",
            displayName: "ephemeral",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: Strings.COMMAND_DEBUG_OPT_EPHEMERALLY,
        }
    ],
    execute([ephemeral], ctx) {
        const plugins = PluginManager.getAllIds().map(id => PluginManager.getManifest(id)).filter(Boolean);
        plugins.sort((a, b) => a.display.name.localeCompare(b.display.name));

        const enabled = plugins.filter(p => PluginManager.settings[p.id].enabled).map(p => p.display.name);
        const disabled = plugins.filter(p => !PluginManager.settings[p.id].enabled).map(p => p.display.name);

        const content = [
            `**Installed Plugins (${plugins.length}):**`,
            ...(enabled.length > 0 ? [
                `Enabled (${enabled.length}):`,
                "> " + enabled.join(", "),
            ] : []),
            ...(disabled.length > 0 ? [
                `Disabled (${disabled.length}):`,
                "> " + disabled.join(", "),
            ] : []),
        ].join("\n");

        if (ephemeral?.value) {
            messageUtil.sendBotMessage(ctx.channel.id, content);
        } else {
            messageUtil.sendMessage(ctx.channel.id, { content });
        }
    }
};
