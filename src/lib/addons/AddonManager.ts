
export default abstract class AddonManager<T> {
    abstract prepare(): Promise<void>;
    abstract initialize(): Promise<void>;

    abstract fetch(url: string, {}?): Promise<T>;

    abstract start(id: string, {}?): void | Promise<void>;
    abstract stop(id: string, {}?): void | Promise<void>;
    abstract enable(id: string, {}?): void | Promise<void>;
    abstract disable(id: string, {}?): void | Promise<void>;
    abstract install(url: string, {}?): void | Promise<void>;
    abstract uninstall(id: string, {}?): void | Promise<void>;

    abstract updateAll(): Promise<void>;
}
