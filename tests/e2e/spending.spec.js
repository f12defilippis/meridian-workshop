const { test, expect } = require('@playwright/test');

test.describe('Finance / Spending', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/spending');
  });

  test('loads and displays finance dashboard', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Finance Dashboard');
  });

  test('displays financial KPI cards', async ({ page }) => {
    await expect(page.locator('.stat-label:has-text("Total Revenue")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Total Costs")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Net Profit")')).toBeVisible();
  });

  test('displays Revenue vs Costs chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Revenue vs Costs' })).toBeVisible();
  });

  test('displays Monthly Cost Flow chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Cost Flow' })).toBeVisible();
  });

  test('displays Spending by Category', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Spending by Category' })).toBeVisible();
  });

  test('displays Recent Transactions table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recent Transactions' })).toBeVisible();
  });
});
