import { test, expect } from '@playwright/test';

// Test for opening the DemoQA home page
test('should open DemoQA home page', async ({ page }) => {
  await page.goto('https://demoqa.com/');

  await expect(page).toHaveTitle(/demosite/);
  const seleniumLink = page.getByRole('link', { name: 'Selenium Online Training' });
  await expect(seleniumLink).toBeVisible();
});
