import { findByProps } from "@metro/filters";
import { Logger } from "@types";

export const logModule = findByProps("setLogFn").default;
const logger: Logger = new logModule("Revenge");

export default logger;
