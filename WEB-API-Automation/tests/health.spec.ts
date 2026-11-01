import { test, expect } from '../fixtures/fixtures';
import { expectText } from '../utils/assertions';

test.describe('Health', { tag: '@regression' }, () => {
    test('ping reports readiness', { tag: '@smoke' }, async ({ health }) => {
        const start = performance.now();
        const response = await health.ping();
        expectText(response, 201, 'Created');
        expect(performance.now() - start, 'Generous availability budget, not an SLA').toBeLessThan(
            15_000,
        );
    });
});
