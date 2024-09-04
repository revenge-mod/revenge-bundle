
export interface PluginErrorReport {
    id: string;
    error: unknown;
}

export default new class PluginReporter {
    failedLoadingPlugins = [] as Array<PluginErrorReport>;

    reportPluginError(id: string, error: unknown) {
        this.failedLoadingPlugins.push({ id, error });
    }
};
