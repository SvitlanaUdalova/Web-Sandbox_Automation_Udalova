import { expect, type Page } from '@playwright/test';
// Helper class for interacting with the login page
export class LoginPage {

  constructor(private page: Page) { }

  async login(username: string, password: string) {
    await this.page.getByRole('link', { name: 'Login' }).click();
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async checkURL(expectedURL: string) {
    await expect(this.page).toHaveURL(expectedURL);
  }

  async verifyLoggedIn() {
    await expect(this.page).toHaveURL(/profile/);
    const logOutButton = this.page.getByRole('button', { name: 'Logout' });
    await expect(logOutButton).toBeVisible();
  }

  async verifyLoginFailed(expectedURL: string, expectedErrorMessage: string) {
    await this.checkURL(expectedURL);
    const errorMessage = this.page.getByText(expectedErrorMessage);
    await expect(errorMessage).toBeVisible();
  }

  async verifyOpened() {
    const header = this.page.getByRole('heading', { name: 'Login', exact: true });
    const headerText = this.page.getByRole('heading', { name: 'Login in Book Store' });
    const loginButton = this.page.getByRole('button', { name: 'Login' });

    await expect(header).toBeVisible();
    await expect(headerText).toBeVisible();
    await expect(loginButton).toBeVisible();
  }
}
