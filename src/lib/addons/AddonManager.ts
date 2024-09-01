
export default abstract class AddonManager<T> {
    abstract prepare(): Promise<void>;
    abstract initialize(): Promise<void>;

    abstract fetch(url: string, {}?): Promise<T>;

    abstract install(url: string, {}?): void | Promise<void>;
    abstract uninstall(id: string, {}?): void | Promise<void>;

    abstract updateAll(): Promise<void>;
}
