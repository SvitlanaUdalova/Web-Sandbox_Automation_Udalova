import { test } from '../fixtures/profile-test';
import { books } from '../test-data/books';

test.describe('Profile Page', { tag: '@regression' }, () => {
    // Coverage includes collection empty/add/search/delete and a search with no match.
    // Follow-up candidates: duplicate add behavior and deletion of a single selected book.
    // API calls prepare and clean account data; scenario actions and assertions stay in the UI.

    test('should display empty books collection', async ({ profilePage }) => {
        await profilePage.verifyCountOfBooksInCollection(0);
    });

    test('should display added book in the collection', async ({ profilePage, booksPage }) => {
        await booksPage.navigateToBooks();
        await booksPage.addBookToCollection([books[0]]);
        await profilePage.navigateToProfile();

        await profilePage.bookShouldBeInCollection(books[0]);
    });

    test('should search for a book in the collection', async ({ profilePage, collectionApi }) => {
        await collectionApi.addBooks(books);
        await profilePage.navigateToProfile();
        await profilePage.verifyCountOfBooksInCollection(books.length);

        await profilePage.searchBookInCollection(books[0].title);

        await profilePage.verifyCountOfBooksInCollection(1);
        await profilePage.bookShouldBeInCollection(books[0]);
    });

    test('should show no results when searching for a book not in the collection', async ({
        profilePage,
        collectionApi,
    }) => {
        // Seed a different title so zero results verifies filtering, not merely an empty table.
        await collectionApi.addBooks([books[0]]);
        await profilePage.navigateToProfile();
        await profilePage.bookShouldBeInCollection(books[0]);

        await profilePage.searchBookInCollection('Book not in collection');

        await profilePage.verifyCountOfBooksInCollection(0);
    });

    test('should delete all books from the collection', async ({ profilePage, collectionApi }) => {
        await collectionApi.addBooks(books);
        await profilePage.navigateToProfile();
        await profilePage.verifyCountOfBooksInCollection(books.length);

        await profilePage.deleteBookFromCollection(books);
        await profilePage.verifyCountOfBooksInCollection(0);
    });
});
