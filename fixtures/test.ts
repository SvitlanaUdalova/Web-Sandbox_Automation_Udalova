import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RegistrationPage } from '../pages/registration-page';
import { ProfilePage } from '../pages/profile-page';
import { LeftMenu } from '../pages/left-menu';
import { WebTablesPage } from '../pages/web-tables-page';

type PageFixtures = {
    loginPage: LoginPage;
    registrationPage: RegistrationPage;
    profilePage: ProfilePage;
    leftMenu: LeftMenu;
    webTablesPage: WebTablesPage;
};

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        await page.goto(LoginPage.URL);
        await use(new LoginPage(page));
    },

    registrationPage: async ({ page }, use) => {
        await page.goto(LoginPage.URL);
        await use(new RegistrationPage(page));
    },
    profilePage: async ({ page }, use) => {
        await use(new ProfilePage(page));
    },
    leftMenu: async ({ page }, use) => {
        await use(new LeftMenu(page));
    },
    webTablesPage: async ({ page }, use) => {
        await page.goto(WebTablesPage.URL);
        await use(new WebTablesPage(page));
    },
});

export { expect };
