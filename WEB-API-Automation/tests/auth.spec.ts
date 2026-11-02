import { test, expect } from '../fixtures/fixtures';
import { expectJson } from '../utils/assertions';
import { authFailureSchema, authTokenSchema } from '../Schema/auth';
import { getCredentials } from '../utils/environment';

test.describe('Authentication', { tag: '@regression' }, () => {
    test('valid credentials return a non-empty token', { tag: '@smoke' }, async ({ auth }) => {
        const response = await auth.createToken(getCredentials());
        expectJson(response, authTokenSchema);
    });

    for (const name of [
        'wrong password',
        'missing username',
        'missing password',
        'empty credentials',
    ]) {
        test(`rejects ${name}`, async ({ auth }) => {
            const credentials = getCredentials();
            const payload =
                name === 'wrong password'
                    ? { username: credentials.username, password: 'intentionally-invalid-password' }
                    : name === 'missing username'
                      ? { password: credentials.password }
                      : name === 'missing password'
                        ? { username: credentials.username }
                        : {};
            const result = expectJson(await auth.createToken(payload), authFailureSchema);
            expect(result.reason).toBe('Bad credentials');
        });
    }
});
