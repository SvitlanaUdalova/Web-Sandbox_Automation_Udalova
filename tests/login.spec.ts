import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { user } from '../test-data/users';

test.describe('Login Page Tests', () => {
    let loginPage: LoginPage;
    
    const PAGEURL = '/login';

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await page.goto(PAGEURL);
    });

    test('should display the login page correctly', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click();

        await loginPage.verifyOpened();
    });

    test('should clear registration form after clicking Register', async ({ page }) => {
        const newUserButton = page.getByRole('button', { name: 'New User' });

        await expect(newUserButton).toBeVisible();

        await newUserButton.click();

        await page.getByRole('textbox', { name: 'First Name' }).fill(user.firstName);
        await page.getByRole('textbox', { name: 'Last Name' }).fill(user.lastName);
        await page.getByRole('textbox', { name: 'Username' }).fill(user.credentials.username);
        await page.getByRole('textbox', { name: 'Password' }).fill(user.credentials.password);

        await page.getByRole('button', { name: 'Register' }).click();
        const firstNameField = page.getByRole('textbox', { name: 'First Name' });
        await expect(firstNameField).toHaveValue('');
        const lastNameField = page.getByRole('textbox', { name: 'Last Name' });
        await expect(lastNameField).toHaveValue('');
        const usernameField = page.getByRole('textbox', { name: 'Username' });
        await expect(usernameField).toHaveValue('');
        const passwordField = page.getByRole('textbox', { name: 'Password' });
        await expect(passwordField).toHaveValue('');
    });

    test('should allow an existing user to log in successfully', async ({ page }) => {
        await loginPage.verifyOpened();
        await loginPage.login(user.credentials.username, user.credentials.password);

        await expect(page).toHaveURL(/profile/);
        const logOutButton = page.getByRole('button', { name: 'Logout' });
        await expect(logOutButton).toBeVisible();
    });

    test('should not allow a user to log in with an incorrect password', async ({ page }) => {
        await loginPage.login(user.credentials.username, 'incorrectPassword123!');

        await loginPage.checkURL(PAGEURL);

        const errorMessage = page.getByText('Invalid username or password');
        await expect(errorMessage).toBeVisible();
    });
});