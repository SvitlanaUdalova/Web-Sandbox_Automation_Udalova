import { test } from '../fixtures/profile-test';
import { books, selectiveDeletionBooks } from '../test-data/books';

test.describe('Profile Page', { tag: '@regression' }, () => {
    // Coverage includes collection empty/add/search/delete and a search with no match.
    // Follow-up candidate: duplicate add behavior.
    // API calls prepare and clean account data; scenario actions and assertions stay in the UI.

    test('should display empty books collection', async ({ profilePage }) => {
        await profilePage.verifyBooksInCollection([]);
    });

    test('should display added book in the collection', async ({ profilePage, booksPage }) => {
        await booksPage.navigateToBooks();
        await booksPage.addBookToCollection([books[0]]);
        await profilePage.navigateToProfile();

        await profilePage.verifyBooksInCollection([books[0]]);
    });

    test('should search for a book in the collection', async ({ profilePage, collectionApi }) => {
        await collectionApi.addBooks(books);
        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection(books);

        await profilePage.searchBookInCollection(books[0].title);

        await profilePage.verifyBooksInCollection([books[0]]);
    });

    test('should show no results when searching for a book not in the collection', async ({
        profilePage,
        collectionApi,
    }) => {
        // Seed a different title so zero results verifies filtering, not merely an empty table.
        await collectionApi.addBooks([books[0]]);
        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection([books[0]]);

        await profilePage.searchBookInCollection('Book not in collection');

        await profilePage.verifyBooksInCollection([]);
    });

    test('should restore the full collection after clearing a search with no results', async ({
        profilePage,
        collectionApi,
    }) => {
        await collectionApi.addBooks(books);
        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection(books);

        await profilePage.searchBookInCollection('Book not in collection');
        await profilePage.verifyBooksInCollection([]);

        await profilePage.searchBookInCollection('');

        await profilePage.verifyBooksInCollection(books);

        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection(books);
    });

    test('should preserve all books when cancelling deletion of the second book', async ({
        profilePage,
        collectionApi,
    }) => {
        await collectionApi.addBooks(selectiveDeletionBooks);
        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection(selectiveDeletionBooks);

        await profilePage.cancelBookDeletion(selectiveDeletionBooks[1]);

        await profilePage.verifyBooksInCollection(selectiveDeletionBooks);

        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection(selectiveDeletionBooks);
    });

    test('should delete the second book and preserve the first and third books', async ({
        profilePage,
        collectionApi,
    }) => {
        const [firstBook, secondBook, thirdBook] = selectiveDeletionBooks;
        await collectionApi.addBooks(selectiveDeletionBooks);
        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection(selectiveDeletionBooks);

        await profilePage.deleteBookFromCollection([secondBook]);

        await profilePage.bookShouldNotBeInCollection(secondBook);
        await profilePage.verifyBooksInCollection([firstBook, thirdBook]);
    });

    test('should delete all books from the collection', async ({ profilePage, collectionApi }) => {
        await collectionApi.addBooks(books);
        await profilePage.navigateToProfile();
        await profilePage.verifyBooksInCollection(books);

        await profilePage.deleteBookFromCollection(books);
        await profilePage.verifyBooksInCollection([]);
    });
});
