import { getJestConfig } from '@storybook/test-runner';

const testRunnerConfig = getJestConfig();

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
    // The default Jest configuration comes from @storybook/test-runner
    ...testRunnerConfig,
    /** Add your own overrides below
     * @see https://jestjs.io/docs/configuration
     */
    testTimeout: 30000, // default timeout is 15s
};