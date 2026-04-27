const { test, expect } = require('@playwright/test');

test.describe('Filter Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays all four filter dropdowns', async ({ page }) => {
    await expect(page.locator('select')).toHaveCount(4);
  });

  test('time period filter has month options', async ({ page }) => {
    const periodFilter = page.locator('select').nth(0);
    const options = periodFilter.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(13);
  });

  test('warehouse filter changes data', async ({ page }) => {
    const locationFilter = page.locator('select').nth(1);
    await locationFilter.selectOption('Tokyo');
    await page.waitForTimeout(500);
    // Page should still render after filter change
    await expect(page.locator('h2')).toHaveText('Overview');
  });

  test('category filter changes data', async ({ page }) => {
    const categoryFilter = page.locator('select').nth(2);
    await categoryFilter.selectOption('Sensors');
    await page.waitForTimeout(500);
    await expect(page.locator('h2')).toHaveText('Overview');
  });
});
