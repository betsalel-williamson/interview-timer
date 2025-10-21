import { test, expect } from '@playwright/test';

test.describe('Timer Layout Baseline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should capture baseline snapshot of timer layout', async ({ page }) => {
    // Add a timer first
    await page.getByTestId('minutes-input').fill('5');
    await page.getByTestId('seconds-input').fill('30');
    await page.getByTestId('add-timer-button').click();

    // Wait for timer to appear
    await expect(page.locator('.timer-card')).toBeVisible();

    // Take snapshot of the timer layout
    await expect(page.locator('.timer-card')).toHaveScreenshot(
      'timer-layout-baseline.png'
    );
  });

  test('should capture baseline snapshot of multiple timers', async ({
    page,
  }) => {
    // Add multiple timers
    await page.getByTestId('minutes-input').fill('5');
    await page.getByTestId('seconds-input').fill('30');
    await page.getByTestId('add-timer-button').click();

    await page.getByTestId('minutes-input').fill('10');
    await page.getByTestId('seconds-input').fill('0');
    await page.getByTestId('add-timer-button').click();

    // Wait for timers to appear
    await expect(page.locator('.timer-card')).toHaveCount(2);

    // Take snapshot of multiple timers layout
    await expect(page.locator('.timers-grid')).toHaveScreenshot(
      'multiple-timers-baseline.png'
    );
  });

  test('should capture baseline snapshot of global controls', async ({
    page,
  }) => {
    // Add a timer first
    await page.getByTestId('minutes-input').fill('5');
    await page.getByTestId('seconds-input').fill('30');
    await page.getByTestId('add-timer-button').click();

    // Take snapshot of global controls
    await expect(page.locator('.timer-controls-header')).toHaveScreenshot(
      'global-controls-baseline.png'
    );
  });
});
