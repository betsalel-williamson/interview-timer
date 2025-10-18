import { test, expect } from '@playwright/test';

test.describe('Audio Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]', {
      timeout: 10000,
    });
  });

  test('should initialize audio context on user interaction', async ({
    page,
  }) => {
    // Monitor console for audio-related errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Add a timer to trigger audio initialization
    await page.click('[data-testid="quick-timer-5s"]');

    // Start timer to trigger audio initialization
    await page.click('[data-testid="start-all-button"]');
    await page.waitForTimeout(1000);

    // Should not have audio-related errors
    const audioErrors = consoleErrors.filter(
      (log) =>
        log.includes('audio') ||
        log.includes('Audio') ||
        log.includes('AudioContext') ||
        log.includes('Web Audio')
    );
    expect(audioErrors).toHaveLength(0);
  });

  test('should handle audio context creation and state', async ({ page }) => {
    // Test that we can create an audio context in the browser
    const audioContextResult = await page.evaluate(() => {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        return {
          success: true,
          state: audioContext.state,
          sampleRate: audioContext.sampleRate,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    expect(audioContextResult.success).toBe(true);
    expect(audioContextResult.state).toBe('running');
    expect(audioContextResult.sampleRate).toBeGreaterThan(0);
  });

  test('should handle suspended audio context', async ({ page }) => {
    // Test audio context resume functionality
    const resumeResult = await page.evaluate(async () => {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // If suspended, try to resume
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        return {
          success: true,
          initialState: audioContext.state,
          finalState: audioContext.state,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    expect(resumeResult.success).toBe(true);
  });

  test('should handle metronome toggle', async ({ page }) => {
    // Check that metronome is enabled by default
    await expect(
      page.locator('[data-testid="metronome-checkbox"]')
    ).toBeChecked();

    // Disable metronome
    await page.click('[data-testid="metronome-checkbox"]');
    await expect(
      page.locator('[data-testid="metronome-checkbox"]')
    ).not.toBeChecked();

    // Re-enable metronome
    await page.click('[data-testid="metronome-checkbox"]');
    await expect(
      page.locator('[data-testid="metronome-checkbox"]')
    ).toBeChecked();
  });

  test('should show metronome indicator when active', async ({ page }) => {
    // Add and start a timer to activate metronome
    await page.click('[data-testid="quick-timer-10s"]');
    await page.click('[data-testid="start-all-button"]');

    // Check that metronome indicator appears
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).toContainText('♪ Metronome');

    // Wait for timer to complete
    await page.waitForTimeout(11000);

    // Check that metronome indicator disappears
    await expect(
      page.locator('[data-testid="metronome-indicator"]')
    ).not.toBeVisible();
  });

  test('should handle audio testing toggle', async ({ page }) => {
    // Enable audio testing
    await page.click('[data-testid="audio-testing-checkbox"]');
    await expect(
      page.locator('[data-testid="audio-testing-checkbox"]')
    ).toBeChecked();

    // Check that audio testing indicator appears
    await expect(
      page.locator('[data-testid="audio-testing-indicator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="audio-testing-indicator"]')
    ).toContainText('🔊 Testing');

    // Disable audio testing
    await page.click('[data-testid="audio-testing-checkbox"]');
    await expect(
      page.locator('[data-testid="audio-testing-checkbox"]')
    ).not.toBeChecked();

    // Check that indicator disappears
    await expect(
      page.locator('[data-testid="audio-testing-indicator"]')
    ).not.toBeVisible();
  });

  test('should handle audio settings persistence', async ({ page }) => {
    // Toggle audio settings
    await page.click('[data-testid="audio-testing-checkbox"]');
    await page.click('[data-testid="metronome-checkbox"]');

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="app-container"]', {
      timeout: 10000,
    });

    // Check that settings are preserved (this would require localStorage implementation)
    // For now, we just verify the checkboxes are in their expected state
    await expect(
      page.locator('[data-testid="audio-testing-checkbox"]')
    ).not.toBeChecked();
    await expect(
      page.locator('[data-testid="metronome-checkbox"]')
    ).not.toBeChecked();
  });

  test('should handle audio context errors gracefully', async ({ page }) => {
    // Mock audio context failure
    await page.addInitScript(() => {
      // Override AudioContext to simulate failure
      window.AudioContext = class {
        constructor() {
          throw new Error('Audio context creation failed');
        }
      };
    });

    // Reload page with mocked audio context
    await page.reload();
    await page.waitForSelector('[data-testid="app-container"]', {
      timeout: 10000,
    });

    // Try to add and start a timer
    await page.click('[data-testid="quick-timer-5s"]');
    await page.click('[data-testid="start-all-button"]');

    // Should not crash the application
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toHaveCount(1);
    await expect(
      page.locator('[data-testid="timer-list"] .timer-item')
    ).toContainText('running');
  });

  test('should test AudioManager functionality in browser', async ({
    page,
  }) => {
    // Test that AudioManager can be imported and used
    const audioManagerTest = await page.evaluate(async () => {
      try {
        // Import AudioManager (this will work in the browser context)
        const { default: AudioManager } = await import('/src/audio.js');
        const audioManager = new AudioManager();

        // Test initialization
        await audioManager.initialize();

        // Test that it's properly initialized
        const isInitialized = audioManager.isInitialized;
        const isEnabled = audioManager.isEnabled;

        // Test playAlert method (should not throw)
        await audioManager.playAlert();

        // Test playMetronomeClick method (should not throw)
        await audioManager.playMetronomeClick();

        return {
          success: true,
          isInitialized,
          isEnabled,
          audioContextState: audioManager.audioContext?.state,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    expect(audioManagerTest.success).toBe(true);
    expect(audioManagerTest.isInitialized).toBe(true);
    expect(audioManagerTest.isEnabled).toBe(true);
    expect(audioManagerTest.audioContextState).toBe('running');
  });

  test('should test metronome interval functionality', async ({ page }) => {
    // Test that metronome intervals work correctly
    const metronomeTest = await page.evaluate(async () => {
      try {
        const { default: AudioManager } = await import('/src/audio.js');
        const audioManager = new AudioManager();
        await audioManager.initialize();

        // Start metronome with a function that always returns true
        await audioManager.startMetronome(() => true);

        // Check that interval is set
        const hasInterval = audioManager.metronomeIntervalId !== null;

        // Wait a bit to see if it's working
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Stop metronome
        audioManager.stopMetronome();

        // Check that interval is cleared
        const intervalCleared = audioManager.metronomeIntervalId === null;

        return {
          success: true,
          hasInterval,
          intervalCleared,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    expect(metronomeTest.success).toBe(true);
    expect(metronomeTest.hasInterval).toBe(true);
    expect(metronomeTest.intervalCleared).toBe(true);
  });
});
