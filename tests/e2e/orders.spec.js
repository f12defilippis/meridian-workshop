const { test, expect } = require('@playwright/test');

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders');
  });

  test('loads and displays orders table', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Orders');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('displays order data rows', async ({ page }) => {
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('filters by order status', async ({ page }) => {
    const statusFilter = page.locator('select').nth(3);
    await statusFilter.selectOption('Delivered');
    await page.waitForTimeout(500);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('filters by warehouse', async ({ page }) => {
    const locationFilter = page.locator('select').nth(1);
    await locationFilter.selectOption('London');
    await page.waitForTimeout(500);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('displays correct table columns', async ({ page }) => {
    await expect(page.locator('th:has-text("Customer")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });
});
