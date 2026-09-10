import { test, expect } from '@playwright/test';


test('open page', async ({ page }) => {
  await page.goto('https://demoqa.com/'); // Navigate to the demoqa.com homepage

  await expect(page).toHaveTitle(/demosite/); // Check that the page title contains 'demosite'
  let seleniumLink = page.getByRole('link', { name: 'Selenium Online Training' });
  await expect(seleniumLink).toBeVisible(); // Check that the Selenium Online Training link is visible
});
