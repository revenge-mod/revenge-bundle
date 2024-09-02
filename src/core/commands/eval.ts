import { Strings } from "@core/i18n";
import BunnySettings from "@core/storage/BunnySettings";
import { ApplicationCommand, ApplicationCommandOptionType } from "@lib/api/commands/types";
import { messageUtil } from "@metro/common";
import { findByPropsLazy } from "@metro/wrappers";

const util = findByPropsLazy("inspect");
const AsyncFunction = (async () => void 0).constructor;

const ZERO_WIDTH_SPACE_CHARACTER = "\u200B";

function wrapInJSCodeblock(resString: string) {
    return "```js\n" + resString.replaceAll("`", "`" + ZERO_WIDTH_SPACE_CHARACTER) + "\n```";
}

export default () => <ApplicationCommand>{
    name: "eval",
    description: Strings.COMMAND_EVAL_DESC,
    shouldHide: () => BunnySettings.developer.evalCommandEnabled === true,
    options: [
        {
            name: "code",
            type: ApplicationCommandOptionType.STRING,
            description: Strings.COMMAND_EVAL_OPT_CODE,
            required: true
        },
        {
            name: "async",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: Strings.COMMAND_EVAL_OPT_ASYNC,
        }
    ],
    async execute([code, async], ctx) {
        try {
            const res = util.inspect(async?.value ? await AsyncFunction(code.value)() : eval?.(code.value));
            const trimmedRes = res.length > 2000 ? res.slice(0, 2000) + "..." : res;

            messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(trimmedRes));
        } catch (err: any) {
            messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(err?.stack ?? err));
        }
    }
};
