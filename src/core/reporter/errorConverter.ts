export interface SerializedError {
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

export function convertToSerialized(error: unknown, flow = [] as Array<{ cause?: unknown; }>) {
    const newError = error instanceof Error
        ? <SerializedError>{
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
        newError.cause = convertToSerialized(error.cause, [...flow, error]);
    }

    return newError;
}

export function convertToError(error: SerializedError) {
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
