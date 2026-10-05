import { test } from '../fixtures/test';
import { LoginPage } from '../pages/login-page';
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

    test('should allow an existing user to log in successfully', async ({
        loginPage,
        profilePage,
    }) => {
        await loginPage.verifyOpened();
        await loginPage.login(user.credentials.username, user.credentials.password);

        await profilePage.verifyLoggedIn(user.credentials.username);
    });

    test('should not allow a user to log in with an incorrect password', async ({ loginPage }) => {
        await loginPage.login(user.credentials.username, invalidPassword);

        await loginPage.verifyLoginFailed(LoginPage.URL, invalidLoginErrorMessage);
    });
    test('should allow a logged-in user to log out successfully', async ({
        loginPage,
        profilePage,
    }) => {
        await loginPage.login(user.credentials.username, user.credentials.password);
        await profilePage.logout();
        await loginPage.verifyOpened();
    });
});
