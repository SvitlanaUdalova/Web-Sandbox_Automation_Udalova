import { test } from '../fixtures/test';
import { gitPocketGuideDetails } from '../test-data/books';

test.describe('Book Store', { tag: '@regression' }, () => {
    test('should display the selected book details and return to the catalog', async ({ booksPage }) => {
        await booksPage.verifyBookInCatalog(gitPocketGuideDetails);

        await booksPage.openBook(gitPocketGuideDetails);
        await booksPage.verifyBookDetails(gitPocketGuideDetails);

        await booksPage.backToBookStore();
        await booksPage.verifyBookInCatalog(gitPocketGuideDetails);
    });
});
