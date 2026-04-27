const { test, expect } = require('@playwright/test');

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads and displays page title', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Overview');
  });

  test('displays KPI cards', async ({ page }) => {
    await expect(page.locator('text=Inventory Turnover Rate')).toBeVisible();
    await expect(page.locator('text=Orders Fulfilled')).toBeVisible();
    await expect(page.locator('text=Order Fill Rate')).toBeVisible();
  });

  test('displays Order Health section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Order Health' })).toBeVisible();
  });

  test('displays Inventory Value by Category', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory Value by Category' })).toBeVisible();
  });

  test('displays Inventory Shortages table', async ({ page }) => {
    await expect(page.locator('text=Inventory Shortages')).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('displays Top Products by Revenue table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Top Products by Revenue' })).toBeVisible();
  });
});
