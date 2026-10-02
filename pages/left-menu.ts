import { expect, type Page } from '@playwright/test';

export class LeftMenu {
    constructor(private page: Page) {}

    async verifyWebTablesOptionDisplayed() {
        const webTablesOption = this.page.getByText('Web Tables');
        await expect(webTablesOption).toBeVisible();
    }

    async verifyWebTablesOptionNotDisplayed() {
        const webTablesOption = this.page.getByText('Web Tables');
        await expect(webTablesOption).not.toBeVisible();
    }

    async verifyElementsDropdownOpened() {
        await this.page.getByText('Elements').click();
    }

    async verifyWebTables() {
        await this.page.getByRole('link', { name: 'Web Tables' }).click();

        const pageURL = this.page.url();
        expect(pageURL).toContain('webtables');
    }
}
