import { test, expect } from '@playwright/test';

// URL of the login page
//todo: move the page URL to a separate configuration or fixture file
const pageUrl = 'https://demoqa.com/login'; 

// use this user object for login and registration tests
//todo: move to a separate configuration or fixture file
const user = {
    username: 'User',
    password: 'Zz7410741!@$',
    firstName: 'User',
    lastName: 'User',
    invalidPassword: 'invalidPassword123!'
} 

// Opening of the login page and performing login-related tests
test.describe('Login Page Tests', () => {

    // Before each test, navigate to the login page
    test.beforeEach(async ({ page }) => {
        await page.goto(pageUrl);
    });

    test('login page successfully loads', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click();    // Click on the 'Login' link to navigate to the login form

        let header = await page.getByRole('heading', { name: 'Login', exact: true }); // Get the main heading of the login form
        let headerText = await page.getByRole('heading', { name: 'Login in Book Store' }); // Get the subheading of the login form
        let loginButton = await page.getByRole('button', { name: 'Login' }); // Get the login button

        await expect(header).toBeVisible(); // Check that the main heading is visible
        await expect(headerText).toBeVisible(); // Check that the subheading is visible
        await expect(loginButton).toBeVisible(); // Check that the login button is visible
    });

    // Test for creating a new user
    test('new user successfully registers', async ({ page }) => {
        let newUserButton = await page.getByRole('button', { name: 'New User' });   // Get the 'New User' button
        await expect(newUserButton).toBeVisible(); // Check that the 'New User' button is visible

        await newUserButton.click(); // Click on the 'New User' button to navigate to the registration form

        await page.getByRole('button', { name: 'Register' }).waitFor(); // Wait for the 'Register' button to be available

        await page.getByRole('textbox', { name: 'First Name' }).fill(user.firstName); // Fill in the first name field
        await page.getByRole('textbox', { name: 'Last Name' }).fill(user.lastName); // Fill in the last name field
        await page.getByRole('textbox', { name: 'Username' }).fill(user.username); // Fill in the username field
        await page.getByRole('textbox', { name: 'Password' }).fill(user.password); // Fill in the password field

        await page.getByRole('button', { name: 'Register' }).click(); // Click on the 'Register' button to submit the registration form

        let firstNameField = await page.getByRole('textbox', { name: 'First Name' });
        await expect(firstNameField).toHaveValue(''); // Check that the first name field is no longer present after registration (should be empty)

        let lastNameField = await page.getByRole('textbox', { name: 'Last Name' });
        await expect(lastNameField).toHaveValue(''); // Check that the last name field is no longer present after registration (should be empty)

        let usernameField = await page.getByRole('textbox', { name: 'Username' });
        await expect(usernameField).toHaveValue(''); // Check that the username field is no longer present after registration (should be empty)

        let passwordField = await page.getByRole('textbox', { name: 'Password' });
        await expect(passwordField).toHaveValue(''); // Check that the password field is no longer present after registration (should be empty)

    });

    // Test for logging in by an existing user successfully
    test('existing user successfully logs in', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click(); // Click on the 'Login' link to navigate to the login form
        await page.getByRole('textbox', { name: 'Username' }).fill(user.username); // Fill in the username field
        await page.getByRole('textbox', { name: 'Password' }).fill(user.password); // Fill in the password field
        await page.getByRole('button', { name: 'Login' }).click(); // Click on the 'Login' button to submit the login form

        await expect(page).toHaveURL(/profile/); // Check that the user is redirected to the profile page after successful login
        let logOutButton = await page.getByRole('button', { name: 'Logout' }); // Get the 'Logout' button element
        await expect(logOutButton).toBeVisible(); // Check that the 'Logout' button is visible after successful login
    });

    // Test for invalid login with incorrect password
    test('user fails to log in with incorrect password', async ({ page }) => {
        await page.getByRole('link', { name: 'Login' }).click(); // Click on the 'Login' link to navigate to the login form
        await page.getByRole('textbox', { name: 'Username' }).fill(user.username); // Fill in the username field
        await page.getByRole('textbox', { name: 'Password' }).fill(user.invalidPassword); // Fill in the password field with an incorrect password
        await page.getByRole('button', { name: 'Login' }).click(); // Click on the 'Login' button to submit the login form

        await expect(page).toHaveURL(/login/); // Check that the user is redirected to the login page after invalid login attempt

        let errorMessage = await page.getByText('Invalid username or password');
        await expect(errorMessage).toBeVisible();   // Check that the error message is visible after invalid login attempt
        // Check that the user is redirected to the login page after deletion
        await expect(page).toHaveURL(pageUrl); // Verify that the current URL is the login page URL
    });
});

