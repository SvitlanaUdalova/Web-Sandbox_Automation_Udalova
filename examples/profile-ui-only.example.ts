// Historical UI-only example. Kept outside testDir; not part of the active suite.
import { test, expect } from '../fixtures/test';
import { user } from '../test-data/users';
import { books } from '../test-data/books';

test.describe('Profile Page', { tag: '@regression' }, () => {
    // Coverage includes collection empty/add/search/delete and a search with no match.
    // Follow-up candidates: duplicate add behavior and deletion of a single selected book.
    // Books are added through the UI for now; API-assisted setup is planned for the Web API part.

    test.beforeEach(async ({ loginPage, profilePage }) => {
        await loginPage.login(user.credentials.username, user.credentials.password);
        await profilePage.verifyLoggedIn(user.credentials.username);
        await profilePage.navigateToProfile();
        // Isolate each scenario from shared account state; tests must not depend on run order.
        await profilePage.deleteAllBooks();
    });

    test.afterEach(async ({ profilePage }) => {
        // Leave the shared account clean so the next test (or run) isn't affected either.
        await profilePage.deleteAllBooks();
    });

    test('should display empty books collection', async ({ profilePage }) => {
        await profilePage.verifyCountOfBooksInCollection(0);
    });

    test('should display added book in the collection', async ({ profilePage, booksPage }) => {
        await booksPage.addBookToCollection([books[0]]);
        await profilePage.navigateToProfile();

        await profilePage.bookShouldBeInCollection(books[0]);
    });

    test('should search for a book in the collection', async ({ profilePage, booksPage }) => {
        await booksPage.addBookToCollection(books);
        await profilePage.navigateToProfile();
        await profilePage.waitForCollection(books.length);

        await profilePage.searchBookInCollection(books[0].title);

        await profilePage.verifyCountOfBooksInCollection(1);
        await profilePage.bookShouldBeInCollection(books[0]);
    });

    test('should show no results when searching for a book not in the collection', async ({
        profilePage,
        booksPage,
    }) => {
        // Seed a different title so zero results verifies filtering, not merely an empty table.
        await booksPage.addBookToCollection([books[0]]);
        await profilePage.navigateToProfile();
        await profilePage.bookShouldBeInCollection(books[0]);

        await profilePage.searchBookInCollection('Book not in collection');

        await profilePage.verifyCountOfBooksInCollection(0);
    });

    test('should delete all books from the collection', async ({ profilePage, booksPage }) => {
        await booksPage.addBookToCollection(books);
        await profilePage.navigateToProfile();
        await profilePage.waitForCollection(books.length);

        await profilePage.deleteBookFromCollection(books);
        await profilePage.verifyCountOfBooksInCollection(0);
    });
});
