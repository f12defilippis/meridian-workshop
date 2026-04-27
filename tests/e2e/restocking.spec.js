const { test, expect } = require('@playwright/test');

test.describe('Restocking Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking');
  });

  test('loads and displays restocking page', async ({ page }) => {
    await expect(page.locator('h2').first()).toHaveText('Restocking Recommendations');
  });

  test('displays budget control with default value', async ({ page }) => {
    const budgetInput = page.locator('#budget-input');
    await expect(budgetInput).toBeVisible();
    await expect(budgetInput).toHaveValue('50000');
  });

  test('displays summary stat cards', async ({ page }) => {
    await expect(page.locator('.stat-label:has-text("Total Budget")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Recommended Cost")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Budget Remaining")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Items to Order")')).toBeVisible();
  });

  test('displays recommendations table with data', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("SKU")')).toBeVisible();
    await expect(page.locator('th:has-text("Deficit")')).toBeVisible();
    await expect(page.locator('th:has-text("Trend")')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('shows funded items with badge', async ({ page }) => {
    await expect(page.locator('.badge.success').first()).toBeVisible();
  });

  test('allows editing recommended quantity', async ({ page }) => {
    const qtyInput = page.locator('.qty-input').first();
    await expect(qtyInput).toBeVisible();
    await qtyInput.fill('10');
    await page.waitForTimeout(300);
    await expect(page.locator('.stat-label:has-text("Recommended Cost")')).toBeVisible();
  });

  test('updates recommendations when budget changes', async ({ page }) => {
    const budgetInput = page.locator('#budget-input');
    await budgetInput.fill('5000');
    await page.waitForTimeout(800);
    await expect(page.locator('table')).toBeVisible();
  });

  test('filters by warehouse', async ({ page }) => {
    const locationFilter = page.locator('select').nth(1);
    await locationFilter.selectOption('Tokyo');
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });
});
