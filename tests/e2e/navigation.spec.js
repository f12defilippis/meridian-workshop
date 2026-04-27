const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays all navigation links', async ({ page }) => {
    await expect(page.locator('nav a')).toHaveCount(7);
    await expect(page.locator('nav a:has-text("Overview")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Inventory")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Orders")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Finance")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Demand Forecast")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Reports")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Restocking")')).toBeVisible();
  });

  test('navigates to Inventory page', async ({ page }) => {
    await page.click('nav a:has-text("Inventory")');
    await expect(page).toHaveURL('/inventory');
    await expect(page.locator('h2')).toHaveText('Inventory');
  });

  test('navigates to Orders page', async ({ page }) => {
    await page.click('nav a:has-text("Orders")');
    await expect(page).toHaveURL('/orders');
    await expect(page.locator('h2')).toHaveText('Orders');
  });

  test('navigates to Finance page', async ({ page }) => {
    await page.click('nav a:has-text("Finance")');
    await expect(page).toHaveURL('/spending');
    await expect(page.locator('h2')).toHaveText('Finance Dashboard');
  });

  test('navigates to Reports page', async ({ page }) => {
    await page.click('nav a:has-text("Reports")');
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('h2')).toHaveText('Performance Reports');
  });

  test('navigates to Restocking page', async ({ page }) => {
    await page.click('nav a:has-text("Restocking")');
    await expect(page).toHaveURL('/restocking');
    await expect(page.locator('h2')).toHaveText('Restocking Recommendations');
  });

  test('navigates to Demand Forecast page', async ({ page }) => {
    await page.click('nav a:has-text("Demand Forecast")');
    await expect(page).toHaveURL('/demand');
    await expect(page.locator('h2')).toHaveText('Demand Forecast');
  });
});
