import { expect, Page } from "@playwright/test";
import { Book } from "../models/book";

export class BooksPage {
    constructor(private page: Page) {}

    async navigateToBooks() {
        await this.page.goto('/books');
    }

    async getBooksCollection() {
        return this.page.locator('.book-item'); // Adjust the selector based on your actual HTML structure
    }

    async addBookToCollection(books: Book[]) {
        for (const book of books) {
            await this.page.getByRole('link', { name: book.title }).click();
            await expect(this.page).toHaveURL(new RegExp(`books\\?search=${book.isbn}`));

            await this.page.getByRole('button', { name: 'Add To Your Collection' }).click();
            await this.page.getByRole('button', { name: 'Back To Book Store' }).click();
        }
    }
}