import { expect, Page } from "@playwright/test";
import { Book, BookDetails } from "../models/book";

export class BooksPage {
    static readonly URL = '/books';
    constructor(private page: Page) {}

    async navigateToBooks() {
        await this.page.goto('/books');
    }

    async getBooksCollection() {
        return this.page.locator('.book-item'); // Adjust the selector based on your actual HTML structure
    }

    async verifyBookInCatalog(book: Book) {
        await expect(this.page).toHaveURL(/\/books$/);
        await expect(this.page.getByRole('link', { name: book.title, exact: true })).toBeVisible();
    }

    async openBook(book: Book) {
        await this.page.getByRole('link', { name: book.title, exact: true }).click();
        await expect(this.page).toHaveURL(new RegExp(`/books\\?search=${book.isbn}$`));
    }

    async verifyBookDetails(book: BookDetails) {
        await expect(this.page.getByRole('heading', { name: 'Book Store', exact: true })).toBeVisible();
        await expect(this.page.locator('#ISBN-wrapper').getByText(book.isbn, { exact: true })).toBeVisible();
        await expect(this.page.locator('#title-wrapper').getByText(book.title, { exact: true })).toBeVisible();
        await expect(this.page.locator('#author-wrapper').getByText(book.author, { exact: true })).toBeVisible();
        await expect(this.page.locator('#publisher-wrapper').getByText(book.publisher, { exact: true })).toBeVisible();
    }

    async backToBookStore() {
        await this.page.getByRole('button', { name: 'Back To Book Store', exact: true }).click();
    }

    async addBookToCollection(books: Book[]) {
        for (const book of books) {
            await this.openBook(book);

            await this.page.getByRole('button', { name: 'Add To Your Collection' }).click();
            await this.backToBookStore();
        }
    }
}