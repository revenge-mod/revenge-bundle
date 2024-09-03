export enum ModuleFlags {
    EXISTS = 1 << 0,
    BLACKLISTED = 1 << 1,
    ASSET = 1 << 2,
}

export enum ModulesMapInternal {
    FULL_LOOKUP,
    NOT_FOUND
}
