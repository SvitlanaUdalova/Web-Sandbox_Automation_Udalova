import { test } from '../fixtures/test';
import { user } from '../test-data/users';

test.describe('Left Menu Tests', () => {
    //to do expand the test coverage for other left menu features
    test('should display the web tables correctly for a logged-in user', async ({
        loginPage,
        leftMenu,
    }) => {
        await loginPage.login(user.credentials.username, user.credentials.password);

        await leftMenu.verifyWebTablesOptionNotDisplayed();
        await leftMenu.verifyElementsDropdownOpened();
        await leftMenu.verifyWebTablesOptionDisplayed();
        await leftMenu.verifyWebTables();
    });
});
