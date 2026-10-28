import { test } from '../fixtures/test';
import { books } from '../test-data/books';

test.describe('Book Store agent seed', { tag: '@regression' }, () => {
    test('should open the public catalog for test planning', async ({ booksPage }) => {
        await booksPage.verifyBookInCatalog(books[0]);
    });
});
