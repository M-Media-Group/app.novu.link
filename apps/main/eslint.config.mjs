// @ts-check
import config from '../../eslint.config.mjs';
import eslintPluginVue from 'eslint-plugin-vue'


import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";

import globals from 'globals'

import pluginCypress from 'eslint-plugin-cypress/flat'

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

import tseslint from 'typescript-eslint';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
    includeIgnoreFile(gitignorePath),
    ...tseslint.configs.recommended,
    ...config,
    ...eslintPluginVue.configs['flat/recommended'],
    pluginCypress.configs.recommended,
    {
        plugins: {
            cypress: pluginCypress
        },
        rules: {
            'cypress/unsafe-to-chain-command': 'error'
        }
    },
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: '@typescript-eslint/parser'
            }
        }
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser
            }
        }
    },
    {
        ignores: [
            ".vue-translation.js",
        ]
    }
];