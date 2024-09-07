
export enum PluginStage {
    FETCHING = "FETCHING",
    FETCHED = "FETCHED",
    PARSING = "PARSING",
    PARSED = "PARSED",
    INSTANTIATING = "INSTANTIATING",
    INSTANTIATED = "INSTANTIATED",
    STARTING = "STARTING",
    STARTED = "STARTED",
    STOPPING = "STOPPING",
    STOPPED = "STOPPED"
}

export enum PluginDisableReason {
    REQUESTED = "REQUESTED",
    ERROR = "ERROR"
}
