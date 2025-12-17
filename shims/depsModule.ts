import { findByPropsLazy } from "@metro/wrappers";

module.exports = {
    "react": findByPropsLazy("createElement"),
    "react-native": findByPropsLazy("AppRegistry"),
    "util": findByPropsLazy("inspect", "isNullOrUndefined"),
    "moment": findByPropsLazy("isMoment"),
    "chroma-js": findByPropsLazy("brewer"),
    "lodash": findByPropsLazy("forEachRight"),
    "react-native-webview": findByPropsLazy("WebView")
};
