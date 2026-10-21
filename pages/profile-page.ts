import { expect, type Page } from '@playwright/test';
import { Book } from '../models/book';

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

    async navigateToProfile() {
        await this.page.goto('/profile');
    }

    async searchBookInCollection(searchTerm: string) {
        await this.page.getByRole('textbox', { name: 'Type to search' }).fill(searchTerm);
    }

    async waitForCollection(count: number) {
        if (!Number.isInteger(count) || count < 0) {
            throw new RangeError('Book collection count must be a non-negative integer.');
        }

        // This is only a short settling wait; scenario assertions use verifyCount... so a
        // missed target here doesn't silently turn into a passing test.
        const books = await this.getBookscollection();
        const deadline = Date.now() + 500;
        while (true) {
            if ((await books.count()) === count) {
                return;
            }

            const remainingTime = deadline - Date.now();
            if (remainingTime <= 0) {
                return;
            }

            await this.page.waitForTimeout(Math.min(50, remainingTime));
        }
    }

    async getBookscollection() {
        return this.page.locator('table tbody tr');
    }

    async bookShouldBeInCollection(book: Book) {
        const books = await this.getBookscollection();
        await expect(books.getByRole('link', { name: book.title })).toBeVisible();
    }

     async verifyCountOfBooksInCollection(count: number) {
        await this.assertBooksCount(count);
    }

    // Centralize collection count assertions here to avoid repeating locator/assertion
    // logic; this stays page-specific rather than becoming a generic utility.
    private async assertBooksCount(count: number, timeoutMs?: number) {
        const books = await this.getBookscollection();
        await expect(books).toHaveCount(count, timeoutMs ? { timeout: timeoutMs } : undefined);
    }

    async deleteBookFromCollection(books: Book[]) {
        const booksCollection = await this.getBookscollection();
        for (const book of books) {
            await booksCollection.locator(`#delete-record-${book.isbn}`).click();
            await this.confirmDeletion();
        }
    }

    // Clears the account's collection so every test can start and end on a known, empty state
    // regardless of what ran before it. Deletes rows one at a time via the same confirm-dialog
    // flow as deleteBookFromCollection: the bulk "Delete All Books" button was found to be
    // unreliable (its confirmation can be accepted without the collection actually clearing).
    async deleteAllBooks() {
        const maxIterations = 10;
        for (let i = 0; i < maxIterations && (await this.hasAnyBooks(500)); i++) {
            const books = await this.getBookscollection();
            await books.first().locator('[id^="delete-record-"]').click();
            await this.confirmDeletion();
        }

        await this.assertBooksCount(0, 10000);
    }

    // Wait for the dialog's actual hidden state instead of sleeping a fixed duration: it can
    // linger after confirmation and intercept clicks on the collection behind it.
    private async confirmDeletion() {
        await this.page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(this.page.getByRole('dialog')).toBeHidden();
    }

    // Bounded-wait existence check: waits briefly for a row to show up instead of reading the
    // locator's count instantly, which would race the async table render right after navigation
    // and falsely report "empty".
    private async hasAnyBooks(timeoutMs = 1000): Promise<boolean> {
        try {
            const books = await this.getBookscollection();
            await expect(books.first()).toBeVisible({ timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }
}
