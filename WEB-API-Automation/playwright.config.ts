import { defineConfig } from '@playwright/test';
import { getEnvironment } from './utils/environment';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    forbidOnly: !!process.env.CI,
    timeout: 60_000,
    expect: { timeout: 10_000 },
    reporter: [
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
    ],
    use: {
        baseURL: getEnvironment().baseURL,
        actionTimeout: 15_000,
        trace: 'off',
    },
    projects: [{ name: 'api' }],
});
