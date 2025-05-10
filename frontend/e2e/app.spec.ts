import { test, expect } from '@playwright/test';

test.describe('App End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    // Mock image list response
    await page.route('**/api/images*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'img1', url: 'https://via.placeholder.com/150', timestamp: 't1' },
        ]),
      });
    });
    // Mock directory list response
    await page.route('**/api/dirs*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { name: 'subdir', image_count: 1, dir_count: 0 },
        ]),
      });
    });
  });

  test('loads and displays image grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.grid')).toBeVisible();
    const items = page.locator('.item');
    await expect(items).toHaveCount(1);
    await expect(items.first().locator('img')).toHaveAttribute('src', /placeholder/);
  });

  test('path picker shows directories', async ({ page }) => {
    await page.goto('/');
    await page.click('.path-btn');
    const options = page.locator('.path-dropdown li');
    await expect(options).toHaveCount(1);
    await expect(options.first()).toHaveText('subdir (1 images, 0 dirs)');
  });

  test('lightbox opens and closes', async ({ page }) => {
    await page.goto('/');
    // Click zoom icon to open
    await page.click('.zoom-icon');
    await expect(page.locator('.lightbox')).toBeVisible();
    // Click lightbox overlay to close
    await page.click('.lightbox');
    await expect(page.locator('.lightbox')).toBeHidden();
  });
});