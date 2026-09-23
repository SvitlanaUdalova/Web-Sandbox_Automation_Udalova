import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RegistrationPage } from '../pages/registration-page';

export const LOGIN_PAGE_URL = '/login';

type PageFixtures = {
    loginPage: LoginPage;
    registrationPage: RegistrationPage;
};

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        await page.goto(LOGIN_PAGE_URL);
        await use(new LoginPage(page));
    },

    registrationPage: async ({ page }, use) => {
        await page.goto(LOGIN_PAGE_URL);
        await use(new RegistrationPage(page));
    },
});

export { expect };
