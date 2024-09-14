import { logger } from "@core/logger";
import { FluxDispatcher } from "@metro/common";

import langDefault from "./default.json";
import { findByProps } from "@metro";

// Pylix wanted to use Discord's built-in modules, but it just does not work :/
import IntlMessageFormat from "intl-messageformat";

type I18nKey = keyof typeof langDefault;

let _currentLocale: string | null = null;
let _lastSetLocale: string | null = null;

const _loadedLocale = new Set<string>();
const _loadedStrings = {} as Record<string, typeof langDefault>;

export const Strings = new Proxy(
    {},
    {
        get: (_t, prop: keyof typeof langDefault) => {
            if (_currentLocale && _loadedStrings[_currentLocale]?.[prop]) {
                return _loadedStrings[_currentLocale]?.[prop];
            }
            return langDefault[prop];
        },
    },
) as Record<I18nKey, string>;

export function initFetchI18nStrings() {
    const cb = ({ locale }: { locale: string; }) => {
        const languageMap = {
            "es-ES": "es",
            "es-419": "es_419",
            "zh-TW": "zh-Hant",
            "zh-CN": "zh-Hans",
            "pt-PT": "pt",
            "pt-BR": "pt_BR",
            "sv-SE": "sv",
        } as Record<string, string>;

        const resolvedLocale = (_lastSetLocale = languageMap[locale] ?? locale);

        if (resolvedLocale.startsWith("en-")) {
            _currentLocale = null;
            return;
        }

        if (!_loadedLocale.has(resolvedLocale)) {
            _loadedLocale.add(resolvedLocale);

            fetch(`https://raw.githubusercontent.com/pyoncord/i18n/main/resources/${resolvedLocale}/bunny.json`)
                .then((r) => r.json())
                .then((strings) => (_loadedStrings[resolvedLocale] = strings))
                .then(() => resolvedLocale === _lastSetLocale && (_currentLocale = resolvedLocale))
                .catch((e) => logger.error`An error occured while fetching strings for ${resolvedLocale}: ${e}`);
        } else {
            _currentLocale = resolvedLocale;
        }
    };

    FluxDispatcher.subscribe("I18N_LOAD_SUCCESS", cb);
    return () => FluxDispatcher.unsubscribe("I18N_LOAD_SUCCESS", cb);
}

export function formatString(key: I18nKey, val: Record<string, any>): string {
    return new IntlMessageFormat(Strings[key]).format(val)
}