import { test, expect } from '@playwright/test';

test.describe('Bug Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to initialize
    await page.waitForSelector('[data-testid="app-container"]', {
      timeout: 10000,
    });
  });

  test('Bug 1: Metronome timing drift - should accumulate delays over time', async ({
    page,
  }) => {
    // Add a timer and start it to trigger metronome
    await page.fill('[data-testid="minutes-input"]', '0');
    await page.fill('[data-testid="seconds-input"]', '10');
    await page.click('[data-testid="add-timer-button"]');

    // Start the timer
    await page.click('label:has([data-testid="start-all-button"])');

    // Check that metronome indicator appears
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toBeVisible();

    // Wait for 5 seconds to allow timing drift to accumulate
    await page.waitForTimeout(5000);

    // The bug: metronome should still be running but may have drifted
    // We can't easily test the exact timing drift in e2e, but we can verify
    // that the metronome continues running and doesn't stop unexpectedly
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toBeVisible();

    // Wait for timer to complete
    await page.waitForTimeout(6000);

    // Metronome should stop when timer completes
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).not.toBeVisible();
  });

  test('Bug 2: Metronome toggle requires 3 clicks to stop', async ({
    page,
  }) => {
    // Add a timer and start it to trigger metronome
    await page.fill('[data-testid="minutes-input"]', '0');
    await page.fill('[data-testid="seconds-input"]', '10');
    await page.click('[data-testid="add-timer-button"]');

    // Start the timer
    await page.click('label:has([data-testid="start-all-button"])');

    // Check that metronome indicator appears
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toBeVisible();

    // First click - should NOT stop the metronome (due to isInitialLoad bug)
    await page.click('[data-testid="metronome-checkbox"]');

    // Metronome should still be visible after first click
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toBeVisible();

    // Second click - should still NOT stop the metronome
    await page.click('[data-testid="metronome-checkbox"]');

    // Metronome should still be visible after second click
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toBeVisible();

    // Third click - should finally stop the metronome
    await page.click('[data-testid="metronome-checkbox"]');

    // Now metronome should be stopped
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).not.toBeVisible();
  });

  test('Bug 3: Timer editing is inconsistent when clicking numbers', async ({
    page,
  }) => {
    // Add a timer
    await page.fill('[data-testid="minutes-input"]', '1');
    await page.fill('[data-testid="seconds-input"]', '30');
    await page.click('[data-testid="add-timer-button"]');

    // Start the timer
    await page.click('label:has([data-testid="start-all-button"])');

    // Verify timer is running
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toContainText('running');

    // Click on the minutes to edit - this should pause the timer and enter edit mode
    await page.click('[data-testid="timer-list"] .timer-item .timer-minutes');

    // Wait for edit mode to potentially activate
    await page.waitForTimeout(200);

    // Check if edit mode activated
    const editInputs = page.locator(
      '[data-testid="timer-list"] .timer-item [data-testid="edit-inputs"]'
    );

    if (await editInputs.isVisible()) {
      // Edit mode activated successfully - test the editing functionality
      await page.fill(
        '[data-testid="timer-list"] .timer-item [data-testid="edit-minutes"]',
        '2'
      );
      await page.fill(
        '[data-testid="timer-list"] .timer-item [data-testid="edit-seconds"]',
        '45'
      );

      // Click outside to trigger blur and save
      await page.click('body');

      // Wait for edit to complete
      await page.waitForTimeout(200);

      // Check that the timer was updated
      await expect(
        page.locator('[data-testid="timer-list"] .timer-item')
      ).toContainText('02:45');
    } else {
      // If edit mode didn't activate, try clicking on seconds instead
      await page.click('[data-testid="timer-list"] .timer-item .timer-seconds');

      // Wait for edit mode to potentially activate
      await page.waitForTimeout(200);

      // Check if edit mode activated this time
      if (await editInputs.isVisible()) {
        // Edit mode activated - test the editing functionality
        await page.fill(
          '[data-testid="timer-list"] .timer-item [data-testid="edit-minutes"]',
          '2'
        );
        await page.fill(
          '[data-testid="timer-list"] .timer-item [data-testid="edit-seconds"]',
          '45'
        );

        // Click outside to trigger blur and save
        await page.click('body');

        // Wait for edit to complete
        await page.waitForTimeout(200);

        // Check that the timer was updated
        await expect(
          page.locator('[data-testid="timer-list"] .timer-item')
        ).toContainText('02:45');
      } else {
        // If edit mode still didn't activate, that's the bug we're testing for
        throw new Error(
          'Edit mode did not activate when clicking timer numbers - this is the bug being tested'
        );
      }
    }
  });

  test('Bug 3: Timer should pause when entering edit mode and resume on blur if other timers running', async ({
    page,
  }) => {
    // Add two timers
    await page.fill('[data-testid="minutes-input"]', '1');
    await page.fill('[data-testid="seconds-input"]', '0');
    await page.click('[data-testid="add-timer-button"]');

    await page.fill('[data-testid="minutes-input"]', '2');
    await page.fill('[data-testid="seconds-input"]', '0');
    await page.click('[data-testid="add-timer-button"]');

    // Start both timers
    await page.click('label:has([data-testid="start-all-button"])');

    // Verify both timers are running
    const timerItems = page.locator('[data-testid="timer-list"] .timer-item');
    await expect(timerItems).toHaveCount(2);
    await expect(timerItems.first()).toContainText('running');
    await expect(timerItems.nth(1)).toContainText('running');

    // Click on first timer to edit it
    await timerItems.first().locator('.timer-minutes').click();

    // Wait for edit mode
    await page.waitForTimeout(100);

    // Check if edit mode activated
    const editInputs = timerItems
      .first()
      .locator('[data-testid="edit-inputs"]');

    if (await editInputs.isVisible()) {
      // The first timer should be paused while editing
      await expect(timerItems.first()).toContainText('paused');

      // The second timer should still be running
      await expect(timerItems.nth(1)).toContainText('running');

      // Edit the timer
      await timerItems
        .first()
        .locator('[data-testid="edit-minutes"]')
        .fill('3');

      // Click outside to trigger blur
      await page.click('body');

      // Wait for edit to complete
      await page.waitForTimeout(200);

      // The first timer should resume running since other timers are running
      await expect(timerItems.first()).toContainText('running');
      await expect(timerItems.nth(1)).toContainText('running');

      // Check that the timer was updated
      await expect(timerItems.first()).toContainText('03:00');
    } else {
      // If edit mode didn't activate, that's the bug
      throw new Error(
        'Edit mode did not activate - this is the bug being tested'
      );
    }
  });
});
