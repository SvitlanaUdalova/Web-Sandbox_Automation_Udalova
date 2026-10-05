import { expect, type Page } from '@playwright/test';
// Helper class for interacting with the post-login account/profile page
export class ProfilePage {
    constructor(private page: Page) {}

    async verifyLoggedIn(username: string) {
        await expect(this.page).toHaveURL(/profile/);
        await expect(this.page.locator('#userName-value')).toHaveText(username);
        await expect(this.page.getByRole('button', { name: 'Logout' })).toBeVisible();
    }

    async logout() {
        await this.page.getByRole('button', { name: 'Logout' }).click();
    }
}
