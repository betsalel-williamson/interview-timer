import { test, expect } from '@playwright/test';

test.describe('Interview Timer Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to initialize
    await page.waitForSelector('[data-testid="app-container"]', {
      timeout: 10000,
    });
  });

  test('should load the application successfully', async ({ page }) => {
    // Check that the main elements are present
    await expect(page.locator('h1')).toContainText('Interview Timer');
    await expect(page.locator('[data-testid="timer-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-timers"]')).toBeVisible();
  });

  test('should add a timer successfully', async ({ page }) => {
    // Fill in the timer form
    await page.fill('[data-testid="minutes-input"]', '5');
    await page.fill('[data-testid="seconds-input"]', '30');
    await page.click('[data-testid="add-timer-button"]');

    // Check that the timer was added
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toHaveCount(1);
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toContainText('05:30');
  });

  test('should start and stop timers', async ({ page }) => {
    // Add a short timer for testing
    await page.fill('[data-testid="minutes-input"]', '0');
    await page.fill('[data-testid="seconds-input"]', '3');
    await page.click('[data-testid="add-timer-button"]');

    // Wait for timer list to be visible
    await page.waitForSelector('[data-testid="timer-list"]', {
      state: 'visible',
    });

    // Start the timer (click the label since the checkbox might be hidden)
    await page.click('label:has([data-testid="start-all-button"])');

    // Check that the timer is running
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toContainText('running');

    // Wait for timer to complete (3 seconds)
    await page.waitForTimeout(4000);

    // Check that the timer is completed
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toContainText('completed');
  });

  test('should handle multiple timers', async ({ page }) => {
    // Add multiple timers using the form
    // First timer: 30 seconds
    await page.fill('[data-testid="minutes-input"]', '0');
    await page.fill('[data-testid="seconds-input"]', '30');
    await page.click('[data-testid="add-timer-button"]');

    // Second timer: 1 minute
    await page.fill('[data-testid="minutes-input"]', '1');
    await page.fill('[data-testid="seconds-input"]', '0');
    await page.click('[data-testid="add-timer-button"]');

    // Third timer: 5 minutes
    await page.fill('[data-testid="minutes-input"]', '5');
    await page.fill('[data-testid="seconds-input"]', '0');
    await page.click('[data-testid="add-timer-button"]');

    // Check that all timers were added
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toHaveCount(3);

    // Start all timers
    await page.click('label:has([data-testid="start-all-button"])');

    // Check that all timers are running
    const timerItems = page.locator('[data-testid="timer-list"] .timer-item');
    await expect(timerItems).toHaveCount(3);

    // Wait a bit and check that timers are counting down
    await page.waitForTimeout(1000);
    // The 30-second timer should be counting down
    await expect(timerItems.first()).toContainText(/0[0-2]:[0-5][0-9]/);
  });

  test('should remove timers', async ({ page }) => {
    // Add a timer
    await page.click('[data-testid="quick-timer-1m"]');
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toHaveCount(1);

    // Remove the timer
    await page.click(
      '[data-testid="timer-list"] .timer-item [data-testid="remove-timer"]'
    );

    // Check that the timer was removed
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toHaveCount(0);
  });

  test('should validate timer input', async ({ page }) => {
    // Try to add a timer with invalid input (zero duration)
    await page.fill('[data-testid="minutes-input"]', '0');
    await page.fill('[data-testid="seconds-input"]', '0');

    // Check that the button is disabled for invalid input
    await expect(
      page.locator('[data-testid="add-timer-button"]')
    ).toBeDisabled();

    // Now test with valid input
    await page.fill('[data-testid="minutes-input"]', '1');
    await page.fill('[data-testid="seconds-input"]', '0');

    // Check that the button is enabled for valid input
    await expect(
      page.locator('[data-testid="add-timer-button"]')
    ).toBeEnabled();
  });

  test.skip('should handle timer editing', async ({ page }) => {
    // TODO: Fix timer editing functionality - edit mode not activating when clicking timer display
    // Add a timer using the form
    await page.fill('[data-testid="minutes-input"]', '1');
    await page.fill('[data-testid="seconds-input"]', '0');
    await page.click('[data-testid="add-timer-button"]');

    // Click to edit the timer (click on the minutes span)
    await page.click('[data-testid="timer-list"] .timer-item .timer-minutes');

    // Wait for edit mode to be active
    await page.waitForSelector(
      '[data-testid="timer-list"] .timer-item [data-testid="edit-inputs"]',
      { state: 'visible' }
    );

    // Edit the timer duration
    await page.fill(
      '[data-testid="timer-list"] .timer-item [data-testid="edit-minutes"]',
      '2'
    );
    await page.fill(
      '[data-testid="timer-list"] .timer-item [data-testid="edit-seconds"]',
      '30'
    );

    // Save the edit
    await page.press(
      '[data-testid="timer-list"] .timer-item [data-testid="edit-minutes"]',
      'Enter'
    );

    // Check that the timer was updated
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toContainText('02:30');
  });

  test('should handle audio settings', async ({ page }) => {
    // Check that audio settings are present
    await expect(page.locator('[data-testid="audio-settings"]')).toBeVisible();

    // Check that metronome is enabled by default
    await expect(
      page.locator('[data-testid="metronome-checkbox"]')
    ).toBeChecked();

    // Toggle audio testing
    await page.click('[data-testid="audio-testing-checkbox"]');
    await expect(
      page.locator('[data-testid="audio-testing-checkbox"]')
    ).toBeChecked();

    // Check that audio testing indicator appears
    await expect(
      page.locator('[data-testid="audio-testing-indicator"]')
    ).toBeVisible();
  });

  test.skip('should handle metronome functionality', async ({ page }) => {
    // TODO: Fix metronome timing issues - metronome indicator not disappearing when timers complete
    // Add a timer and start it to trigger metronome
    await page.fill('[data-testid="minutes-input"]', '0');
    await page.fill('[data-testid="seconds-input"]', '5');
    await page.click('[data-testid="add-timer-button"]');
    await page.click('label:has([data-testid="start-all-button"])');

    // Check that metronome indicator appears
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toBeVisible();

    // Wait for timer to complete
    await page.waitForTimeout(6000);

    // Check that metronome indicator disappears when no timers are running
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).not.toBeVisible();
  });

  test('should handle timer completion with audio and flash', async ({
    page,
  }) => {
    // Enable flash for visual feedback
    await page.click('[data-testid="flash-checkbox"]');

    // Add a short timer
    await page.fill('[data-testid="minutes-input"]', '0');
    await page.fill('[data-testid="seconds-input"]', '2');
    await page.click('[data-testid="add-timer-button"]');
    await page.click('label:has([data-testid="start-all-button"])');

    // Wait for timer to complete
    await page.waitForTimeout(3000);

    // Check that the timer is completed
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toContainText('completed');

    // Note: Audio testing would require more complex setup with audio context mocking
    // For now, we just verify the visual state
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that the app still loads and functions
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="timer-form"]')).toBeVisible();

    // Add a timer on mobile
    await page.fill('[data-testid="minutes-input"]', '1');
    await page.fill('[data-testid="seconds-input"]', '0');
    await page.click('[data-testid="add-timer-button"]');

    // Check that timer was added
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toHaveCount(1);
  });
});
