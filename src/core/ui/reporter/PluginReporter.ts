import { awaitStorage, createStorage } from "@lib/api/storage";

export enum PluginStage {
    FETCHING = "FETCHING",
    PARSING = "PARSING",
    INSTANTIATING = "INSTANTIATING",
    STARTING = "STARTING",
    STARTED = "STARTED",
    STOPPING = "STOPPING",
    STOPPED = "STOPPED"
}

export enum PluginDisableReason {
    REQUESTED = "REQUESTED",
    ERROR = "ERROR"
}

interface SerializedError {
    name?: string;
    stack?: string;
    message?: string;
    cause?: SerializedError | string;
}

const ERROR_PROPERTIES = [
    { property: "name", enumerable: false },
    { property: "message", enumerable: false },
    { property: "stack", enumerable: false },
    { property: "cause", enumerable: false },
] as const;


function toSerialized(error: unknown, flow = [] as Array<{ cause?: unknown }>) {
    const newError = error instanceof Error
        ? <SerializedError> {
            name: error.name,
            stack: error.stack,
            message: error.message,
            cause: error.cause ? String(error.cause) : undefined
        }
        : String(error);

    if (typeof newError === "object"
        && error instanceof Error
        && error.cause instanceof Error
        && !flow.includes(error) // in case it's recursive
    ) {
        newError.cause = toSerialized(error.cause, [...flow, error]);
    }

    return newError;
}

function convertToError(error: SerializedError) {
    const ctr: new () => Error = (error.name ? window[error.name] : null) ?? Error;
    const newErr = new ctr();

    for (const { property, enumerable } of ERROR_PROPERTIES) {
        if (property in error) {
            Object.defineProperty(newErr, property, {
                value: error[property],
                enumerable,
                configurable: true,
                writable: true,
            });
        }
    }

    const { cause } = error;
    if (cause && typeof cause !== "string") {
        newErr.cause = convertToError(cause);
    }

    return newErr;
}

export default new class PluginReporter {
    stages = {} as Record<string, PluginStage>;

    disableReason = createStorage<Record<string, PluginDisableReason>>("plugins/reporter/disable-reason.json");
    lastErrors = createStorage<Record<string, SerializedError | string>>("plugins/reporter/last-errors.json");

    prepare() {
        return awaitStorage(this.disableReason, this.lastErrors);
    }

    hasErrors() {
        return !!Object.keys(this.lastErrors).length;
    }

    getError(id: string): Error | string {
        const error = this.lastErrors[id];
        if (typeof error === "string") return error;
        return convertToError(error);
    }

    updateStage(id: string, stage: PluginStage) {
        this.stages[id] = stage;
        if (stage === PluginStage.STARTED && this.lastErrors[id]) {
            delete this.lastErrors[id];
        }
    }

    reportPluginError(id: string, error: unknown) {
        this.lastErrors[id] = toSerialized(error);
    }

    reportPluginDisable(id: string, reason: PluginDisableReason) {
        this.disableReason[id] = reason;
    }

    clearPluginReports(id: string, stage = false) {
        delete this.disableReason[id];
        delete this.lastErrors[id];
        if (stage) delete this.stages[id];
    }
};
