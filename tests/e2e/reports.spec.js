const { test, expect } = require('@playwright/test');

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('loads and displays reports page', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Performance Reports');
  });

  test('displays quarterly performance table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quarterly Performance' })).toBeVisible();
    await expect(page.locator('th:has-text("Quarter")')).toBeVisible();
    await expect(page.locator('th:has-text("Total Orders")')).toBeVisible();
    await expect(page.locator('th:has-text("Total Revenue")')).toBeVisible();
    await expect(page.locator('th:has-text("Fulfillment Rate")')).toBeVisible();
    await expect(page.locator('td:has-text("Q1-2025")')).toBeVisible();
  });

  test('displays monthly revenue trend chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Revenue Trend' })).toBeVisible();
    await expect(page.locator('.bar').first()).toBeVisible();
  });

  test('displays month-over-month analysis table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Month-over-Month Analysis' })).toBeVisible();
    await expect(page.locator('th:has-text("Growth Rate")')).toBeVisible();
  });

  test('displays summary stats', async ({ page }) => {
    await expect(page.locator('.stat-label:has-text("Total Revenue (YTD)")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Avg Monthly Revenue")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Total Orders (YTD)")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Best Performing Quarter")')).toBeVisible();
  });

  test('filters reports by warehouse', async ({ page }) => {
    const locationFilter = page.locator('select').nth(1);
    await locationFilter.selectOption('San Francisco');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Quarterly Performance' })).toBeVisible();
  });

  test('filters reports by time period', async ({ page }) => {
    const periodFilter = page.locator('select').nth(0);
    await periodFilter.selectOption({ index: 3 });
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Quarterly Performance' })).toBeVisible();
  });
});
