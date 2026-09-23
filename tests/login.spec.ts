import { test, LOGIN_PAGE_URL } from '../fixtures/test';
import { user } from '../test-data/users';
import { invalidPassword, invalidLoginErrorMessage } from '../test-data/login-data';

test.describe('Login Page Tests', () => {
    test('should display the login page correctly', async ({ loginPage }) => {
        await loginPage.verifyOpened();
    });

    test('should clear registration form after clicking Register', async ({ registrationPage }) => {
        await registrationPage.open();
        await registrationPage.fill(user);
        await registrationPage.submit();

        await registrationPage.verifyFieldsCleared();
    });

    test('should allow an existing user to log in successfully', async ({ loginPage }) => {
        await loginPage.verifyOpened();
        await loginPage.login(user.credentials.username, user.credentials.password);

        await loginPage.verifyLoggedIn();
    });

    test('should not allow a user to log in with an incorrect password', async ({ loginPage }) => {
        await loginPage.login(user.credentials.username, invalidPassword);

        await loginPage.verifyLoginFailed(LOGIN_PAGE_URL, invalidLoginErrorMessage);
    });
});