function error(...args: any[]): void;
function error(strings: TemplateStringsArray, ...args: any[]) {
    if (Array.isArray(strings) && "raw" in strings) {
        console.error(String.raw(strings, ...args));
    }

    console.error(strings, ...args);
}

export const logger = {
    ...console,
    error,
};
