// @ts-check

import config from '../../eslint.config.mjs';

import tseslint from 'typescript-eslint';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
    ...tseslint.configs.recommended,
    ...config,
];