import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { RegistrationPage } from '../pages/registration-page';
import { ProfilePage } from '../pages/profile-page';
import { LeftMenu } from '../pages/left-menu';
import { WebTablesPage } from '../pages/web-tables-page';
import { BooksPage } from '../pages/books-page';

type PageFixtures = {
    loginPage: LoginPage;
    registrationPage: RegistrationPage;
    profilePage: ProfilePage;
    leftMenu: LeftMenu;
    webTablesPage: WebTablesPage;
    booksPage: BooksPage;
};

export const test = base.extend<PageFixtures>({
    // Fixtures construct page objects and apply their initial route; test-specific actions
    // and assertions remain in the specs.
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
    booksPage: async ({ page }, use) => {
        await page.goto(BooksPage.URL);
        await use(new BooksPage(page));
    }
});

export { expect };
