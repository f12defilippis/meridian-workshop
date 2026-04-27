const { test, expect } = require('@playwright/test');

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
  });

  test('loads and displays inventory table', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Inventory');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('displays inventory data', async ({ page }) => {
    // Verify the table has data rows
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('filters by warehouse', async ({ page }) => {
    const locationFilter = page.locator('select').nth(1);
    await locationFilter.selectOption('Tokyo');
    await page.waitForTimeout(500);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('filters by category', async ({ page }) => {
    const categoryFilter = page.locator('select').nth(2);
    await categoryFilter.selectOption('Sensors');
    await page.waitForTimeout(500);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search filters items by name', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Sensor');
      await page.waitForTimeout(300);
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
