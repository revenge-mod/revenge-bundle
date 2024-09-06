
export enum PluginStage {
    FETCHING,
    PARSING,
    INSTANTIATING,
    STARTING,
    STARTED,
    STOPPING,
    STOPPED
}

export interface PluginErrorReport {
    id: string;
    error: unknown;
}

export default new class PluginReporter {
    stages = {} as Record<string, PluginStage>;
    errors = {
        "dfasdf": new Error("sjkldsjklfdEKJUGRUH FKLNAFDJNIHF FJFLNDN"),
        "fjkdjioda": "fjkljfijiofk",
        "kfdsfjkldfjkld": class Skjfdsfkjlfdfdjk {},
        "jfddsjkl": null
    } as Record<string, unknown>;

    updateStage(id: string, stage: PluginStage) {
        this.stages[id] = stage;
    }

    reportPluginError(id: string, error: unknown) {
        this.errors[id] = error;
    }
};
