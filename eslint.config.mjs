import typescriptEslint from "@typescript-eslint/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import importAlias from "eslint-plugin-import-alias";
import tsParser from "@typescript-eslint/parser";

export default [{
    ignores: ["**/dist", "**/browser"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        "simple-import-sort": simpleImportSort,
        "unused-imports": unusedImports,
        "import-alias": importAlias,
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        "no-restricted-syntax": ["error", {
            selector: "AwaitExpression:not(:function *)",
            message: "Hermes does not support top-level await, and SWC cannot transform it.",
        }],

        quotes: ["error", "double", {
            avoidEscape: true,
        }],

        "jsx-quotes": ["error", "prefer-double"],
        "no-mixed-spaces-and-tabs": "error",

        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "arrow-parens": ["error", "as-needed"],
        "eol-last": ["error", "always"],
        "func-call-spacing": ["error", "never"],
        "no-multi-spaces": "error",
        "no-trailing-spaces": "error",
        "no-whitespace-before-property": "error",
        semi: ["error", "always"],
        "semi-style": ["error", "last"],
        "space-in-parens": ["error", "never"],
        "block-spacing": ["error", "always"],
        "object-curly-spacing": ["error", "always"],

        eqeqeq: ["error", "always", {
            null: "ignore",
        }],

        "spaced-comment": ["error", "always", {
            markers: ["!"],
        }],

        yoda: "error",

        "prefer-destructuring": ["error", {
            object: true,
            array: false,
        }],

        "operator-assignment": ["error", "always"],
        "no-useless-computed-key": "error",

        "no-unneeded-ternary": ["error", {
            defaultAssignment: false,
        }],

        "no-invalid-regexp": "error",

        "no-constant-condition": ["error", {
            checkLoops: false,
        }],

        "no-duplicate-imports": "error",
        "no-extra-semi": "error",
        "dot-notation": "error",
        "no-useless-escape": ["error"],
        "no-fallthrough": "error",
        "for-direction": "error",
        "no-async-promise-executor": "error",
        "no-cond-assign": "error",
        "no-dupe-else-if": "error",
        "no-duplicate-case": "error",
        "no-irregular-whitespace": "error",
        "no-loss-of-precision": "error",
        "no-misleading-character-class": "error",
        "no-prototype-builtins": "error",
        "no-regex-spaces": "error",
        "no-shadow-restricted-names": "error",
        "no-unexpected-multiline": "error",
        "no-unsafe-optional-chaining": "error",
        "no-useless-backreference": "error",
        "use-isnan": "error",
        "prefer-const": "error",
        "prefer-spread": "error",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "unused-imports/no-unused-imports": "error",

        "import-alias/import-alias": ["error", {
            relativeDepth: 0,

            aliases: [{
                alias: "@metro",
                matcher: "^src/lib/metro",
            }, {
                alias: "@core",
                matcher: "^src/core",
            }, {
                alias: "@ui",
                matcher: "^src/lib/ui",
            }, {
                alias: "@types",
                matcher: "^src/lib/utils/types.ts",
            }, {
                alias: "@lib",
                matcher: "^src/lib",
            }],
        }],
    },
}];