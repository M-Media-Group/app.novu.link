// @ts-check
import config from "@novulink/eslint-config/base";
import eslintPluginVue from 'eslint-plugin-vue'

import ts from 'typescript-eslint'

import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default ts.config(
    includeIgnoreFile(gitignorePath),
    config,
    ...eslintPluginVue.configs['flat/recommended'],
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: '@typescript-eslint/parser'
            }
        }
    }
)