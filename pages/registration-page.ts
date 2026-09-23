import { expect, type Page } from '@playwright/test';
import { User } from '../models/user-credentials';

// Page object for the "New User" registration form on the login page
export class RegistrationPage {
    constructor(private page: Page) { }

    private get newUserButton() {
        return this.page.getByRole('button', { name: 'New User' });
    }

    private get firstNameField() {
        return this.page.getByRole('textbox', { name: 'First Name' });
    }

    private get lastNameField() {
        return this.page.getByRole('textbox', { name: 'Last Name' });
    }

    private get usernameField() {
        return this.page.getByRole('textbox', { name: 'Username' });
    }

    private get passwordField() {
        return this.page.getByRole('textbox', { name: 'Password' });
    }

    private get registerButton() {
        return this.page.getByRole('button', { name: 'Register' });
    }

    async open() {
        await expect(this.newUserButton).toBeVisible();
        await this.newUserButton.click();
    }

    async fill(user: User) {
        await this.firstNameField.fill(user.firstName);
        await this.lastNameField.fill(user.lastName);
        await this.usernameField.fill(user.credentials.username);
        await this.passwordField.fill(user.credentials.password);
    }

    async submit() {
        await this.registerButton.click();
    }

    async verifyFieldsCleared() {
        await expect(this.firstNameField).toHaveValue('');
        await expect(this.lastNameField).toHaveValue('');
        await expect(this.usernameField).toHaveValue('');
        await expect(this.passwordField).toHaveValue('');
    }
}
