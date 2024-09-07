import { Observable } from "@gullerya/object-observer";
import { awaitStorage, createStorage, useObservable } from "@lib/api/storage";

import { PluginDisableReason, PluginStage } from "./enums";
import { convertToError, convertToSerialized, SerializedError } from "./errorConverter";

export default {
    stages: Observable.from({}) as Record<string, PluginStage>,
    errors: createStorage<Record<string, SerializedError | string>>("plugins/reporter/last-errors.json"),
    disableReason: createStorage<Record<string, PluginDisableReason>>("plugins/reporter/disable-reason.json"),

    useReporter() {
        useObservable([this.stages, this.disableReason, this.errors]);
    },

    prepare() {
        return awaitStorage(this.disableReason, this.errors);
    },

    hasErrors() {
        return !!Object.keys(this.errors).length;
    },

    getError(id: string): Error | string {
        const error = this.errors[id];
        if (typeof error === "string") return error;
        return convertToError(error);
    },

    updateStage(id: string, stage: PluginStage) {
        this.stages[id] = stage;
        if (stage === PluginStage.STARTED && this.errors[id]) {
            delete this.errors[id];
        }
    },

    reportPluginError(id: string, error: unknown) {
        this.errors[id] = convertToSerialized(error);
    },

    reportPluginDisable(id: string, reason: PluginDisableReason) {
        this.disableReason[id] = reason;
    },

    clearPluginReports(id: string, stage = false) {
        delete this.disableReason[id];
        delete this.errors[id];
        if (stage) delete this.stages[id];
    }
};
