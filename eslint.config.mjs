import nx from '@nx/eslint-plugin';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import unusedImports from "eslint-plugin-unused-imports";
import spellcheck from "eslint-plugin-spellcheck";
import noSecrets from "eslint-plugin-no-secrets";

import storybook from 'eslint-plugin-storybook'

export default [
    eslint.configs.recommended,
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    ...storybook.configs['flat/recommended'],
    {
        ignores: ['**/dist', '**/coverage', '**/node_modules', '**/storybook-static', "'!.storybook'"],
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    {
        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.cts',
            '**/*.mts',
            '**/*.js',
            '**/*.jsx',
            '**/*.cjs',
            '**/*.mjs',
        ],
        // Override or add rules here
        rules: {},
    },
    {
        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.cts',
            '**/*.mts',
            '**/*.js',
            '**/*.jsx',
            '**/*.cjs',
            '**/*.mjs',
        ],
        plugins: {
            "unused-imports": unusedImports,
            spellcheck,
            "no-secrets": noSecrets,
        },
        rules: {
            camelcase: ["error", {
                properties: "never",
            }],

            "no-secrets/no-secrets": ["error", {
                ignoreContent: ["userWithUnconfirmedEmail"],
            }],

            "spellcheck/spell-checker": [0, {
                comments: true,
                strings: true,
                identifiers: true,
                templates: true,
                lang: "en_US",
                skipIfMatch: ["http://[^s]*", "^[-\\w]+/[-\\w\\.]+$"],
                skipWordIfMatch: ["^vue.*$", "^pinia.*$"],
                minLength: 3,

                skipWords: [
                    "dict",
                    "aff",
                    "hunspellchecker",
                    "hunspell",
                    "utils",
                    "axios",
                    "vue",
                    "pinia",
                    "vuex",
                    "vuetify",
                    "vite",
                    "lang",
                    "gtag",
                    "csrf",
                    "href",
                    "pico",
                    "iframe",
                    "unmount",
                    "cvc",
                    "ecma",
                    "yoda",
                    "pageview",
                    "checkbox",
                    "vitest",
                    "rtl",
                    "ltr",
                    "keydown",
                    "roboto",
                ],
            }],

            "no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",

            "unused-imports/no-unused-vars": ["warn", {
                vars: "all",
                varsIgnorePattern: "^_",
                args: "after-used",
                argsIgnorePattern: "^_",
            }],

            "no-unneeded-ternary": "error",
            "no-useless-rename": "error",
            "no-useless-return": "error",
            "no-var": "error",

            "sort-imports": ["error", {
                ignoreDeclarationSort: true,
            }],

            "spaced-comment": ["error", "always", {
                markers: ["/"],
            }],

            yoda: "error",
            "no-trailing-spaces": "error",
            "dot-notation": "error",
            "no-lonely-if": "error",
            "no-undef-init": "error",
            "prefer-const": "error",
        },
        languageOptions: {
            ecmaVersion: "latest",
            parserOptions: {},
        },
    }
];
