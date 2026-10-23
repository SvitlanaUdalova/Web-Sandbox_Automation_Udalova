import { test as base } from './test';
import { BookCollectionApi } from '../api/book-collection-api';
import { user } from '../test-data/users';

export const test = base.extend<{ collectionApi: BookCollectionApi }>({
    collectionApi: [
        async ({ request, loginPage, profilePage }, use) => {
            // UI login generates the account token, so authenticate the API afterward.
            await loginPage.login(user.credentials.username, user.credentials.password);
            await profilePage.verifyLoggedIn(user.credentials.username);
            const collectionApi = await BookCollectionApi.authenticate(request, user.credentials);
            await collectionApi.clearBooks();
            try {
                await profilePage.navigateToProfile();
                await profilePage.verifyLoggedIn(user.credentials.username);
                await use(collectionApi);
            } finally {
                await collectionApi.clearBooks();
            }
        },
        { auto: true },
    ],
});
