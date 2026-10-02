import { Worker } from '../models/worker';
import { expect, Locator, type Page } from '@playwright/test';

export class WebTablesPage {
    static readonly URL = '/webtables';

    constructor(private page: Page) {}

    async verifyWebTablesDetails() {
        await expect(this.page.getByRole('heading', { name: 'Web Tables' })).toBeVisible();

        await this.isLocatorVisibleAndEnabled(this.page.getByRole('button', { name: 'Add' }));
        await this.isLocatorVisible(this.page.getByRole('table'));

        await expect(this.page.locator('table tr')).toHaveCount(4);

        await this.isLocatorVisibleAndDisabled(this.page.getByRole('button', { name: 'First' }));
        await this.isLocatorVisibleAndDisabled(this.page.getByRole('button', { name: 'Last' }));
        await this.isLocatorVisibleAndDisabled(this.page.getByRole('button', { name: 'Previous' }));
        await this.isLocatorVisibleAndDisabled(this.page.getByRole('button', { name: 'Next' }));
        await this.isLocatorVisibleAndEnabled(this.page.getByPlaceholder('Search'));
    }

    async addWorker(worker: Worker) {
        await this.page.getByRole('button', { name: 'Add' }).click();

        await this.fillWorkerData(worker);
        await this.page.getByRole('button', { name: 'Submit' }).click();
    }

    async verifyWorkerExists(worker: Worker) {
        const row = await this.getWorkerRow(worker);
        await expect(row).toBeVisible();
    }

    async getWorkerByIndex(index: number): Promise<Worker> {
        const row = this.page.locator('table tbody tr').nth(index);

        return {
            firstName: (await row.locator('td').nth(0).textContent()) ?? '',
            lastName: (await row.locator('td').nth(1).textContent()) ?? '',
            age: parseInt((await row.locator('td').nth(2).textContent()) || '0', 10),
            email: (await row.locator('td').nth(3).textContent()) ?? '',
            salary: parseFloat((await row.locator('td').nth(4).textContent()) || '0'),
            department: (await row.locator('td').nth(5).textContent()) ?? '',
        };
    }

    async deleteWorker(worker: Worker) {
        const row = await this.getWorkerRow(worker);
        await row.getByTitle('Delete').click();
    }

    async verifyWorkerDoesNotExist(worker: Worker) {
        const row = await this.getWorkerRow(worker);
        await expect(row).toHaveCount(0);
    }

    async editWorker(worker: Worker, updatedWorker: Worker) {
        const row = await this.getWorkerRow(worker);
        await row.getByTitle('Edit').click();

        await this.fillWorkerData(updatedWorker);
        await this.page.getByRole('button', { name: 'Submit' }).click();
    }

    private async getWorkerRow(worker: Worker) {
        return this.page.locator('table tbody tr', { hasText: worker.email });
    }

    private async fillWorkerData(worker: Worker) {
        await this.page.getByPlaceholder('First Name').fill(worker.firstName);
        await this.page.getByPlaceholder('Last Name').fill(worker.lastName);
        await this.page.getByPlaceholder('name@example.com').fill(worker.email);
        await this.page.getByPlaceholder('Age').fill(worker.age.toString());
        await this.page.getByPlaceholder('Salary').fill(worker.salary.toString());
        await this.page.getByPlaceholder('Department').fill(worker.department);
    }

    private async isLocatorVisibleAndEnabled(locator: Locator) {
        await this.isLocatorVisible(locator);
        await expect(locator).toBeEnabled();
    }

    private async isLocatorVisibleAndDisabled(locator: Locator) {
        await this.isLocatorVisible(locator);
        await expect(locator).toBeDisabled();
    }

    private async isLocatorVisible(locator: Locator) {
        await expect(locator).toBeVisible();
    }
}
