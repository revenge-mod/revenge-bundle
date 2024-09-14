export interface Argument {
    type: ApplicationCommandOptionType;
    name: string;
    value: string;
    focused: undefined;
    options: Argument[];
}

export interface ApplicationCommand {
    name: string;
    description: string;
    execute: (args: Argument[], ctx: CommandContext) => CommandResult | void | Promise<CommandResult> | Promise<void>;
    options: ApplicationCommandOption[];
    id?: string;
    applicationId?: string;
    displayName?: string;
    displayDescription?: string;
    untranslatedDescription?: string;
    untranslatedName?: string;
    inputType?: ApplicationCommandInputType;
    type?: ApplicationCommandType;
    __bunny?: {
        shouldHide: () => boolean;
    };
}

export interface BunnyApplicationCommand extends ApplicationCommand {
    shouldHide: () => boolean;
}

export enum ApplicationCommandInputType {
    BUILT_IN = 0,
    BUILT_IN_TEXT = 1,
    BUILT_IN_INTEGRATION = 2,
    BOT = 3,
    PLACEHOLDER = 4,
}

export interface ApplicationCommandOption {
    name: string;
    description: string;
    required?: boolean;
    type: ApplicationCommandOptionType;
    displayName?: string;
    displayDescription?: string;
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11,
}

export enum ApplicationCommandType {
    CHAT = 1,
    USER = 2,
    MESSAGE = 3,
}

export interface CommandContext {
    channel: any;
    guild: any;
}

export interface CommandResult {
    content: string;
    tts?: boolean;
}
