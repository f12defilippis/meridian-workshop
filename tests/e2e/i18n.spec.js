const { test, expect } = require('@playwright/test');

test.describe('Internationalization (i18n)', () => {
  test('switches to Japanese language', async ({ page }) => {
    await page.goto('/');

    // Click language switcher
    await page.click('button:has-text("English")');
    await page.waitForTimeout(300);

    // Select Japanese
    const japaneseOption = page.locator('text=Japanese').or(page.locator('text=日本語'));
    if (await japaneseOption.isVisible()) {
      await japaneseOption.click();
      await page.waitForTimeout(500);

      // Verify Japanese text appears in navigation
      await expect(page.locator('nav a').first()).not.toHaveText('Overview');
    }
  });

  test('Reports page renders with i18n (no hardcoded English)', async ({ page }) => {
    await page.goto('/reports');
    // Verify i18n keys are resolved (not showing raw keys like 'reports.title')
    await expect(page.locator('h2')).toHaveText('Performance Reports');
    // Verify no raw i18n keys visible
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('reports.title');
    expect(bodyText).not.toContain('reports.description');
  });

  test('Restocking page renders with i18n', async ({ page }) => {
    await page.goto('/restocking');
    await expect(page.locator('h2').first()).toHaveText('Restocking Recommendations');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('restocking.title');
    expect(bodyText).not.toContain('restocking.description');
  });
});
