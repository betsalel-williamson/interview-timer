import { test, expect } from '@playwright/test';

test.describe('Audio Simple Test', () => {
  test('should test audio functionality directly', async ({ page }) => {
    // Collect console logs
    const audioLogs = [];
    page.on('console', (msg) => {
      if (msg.text().includes('[AUDIO]')) {
        audioLogs.push({
          timestamp: new Date().toISOString(),
          message: msg.text(),
          type: msg.type(),
        });
      }
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for Alpine.js to initialize

    // Ensure the page is stable
    await page.waitForSelector('#app');

    // Test AudioManager directly in the browser
    const audioTestResult = await page.evaluate(async () => {
      try {
        // Import AudioManager
        const { default: AudioManager } = await import('/src/audio.js');
        const audioManager = new AudioManager();

        console.log(`[AUDIO] Testing AudioManager directly`);

        // Test initialization
        await audioManager.initialize();
        console.log(`[AUDIO] AudioManager initialized successfully`);

        // Test playAlert
        await audioManager.playAlert();
        console.log(`[AUDIO] playAlert test completed`);

        // Test playMetronomeClick
        await audioManager.playMetronomeClick();
        console.log(`[AUDIO] playMetronomeClick test completed`);

        // Test startMetronome
        await audioManager.startMetronome(() => true);
        console.log(`[AUDIO] startMetronome test completed`);

        // Wait a bit to see interval ticks
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Stop metronome
        audioManager.stopMetronome();
        console.log(`[AUDIO] stopMetronome test completed`);

        return {
          success: true,
          isInitialized: audioManager.isInitialized,
          isEnabled: audioManager.isEnabled,
          audioContextState: audioManager.audioContext?.state,
        };
      } catch (error) {
        console.log(`[AUDIO] Test failed: ${error.message}`);
        return {
          success: false,
          error: error.message,
        };
      }
    });

    // Wait a bit for all console logs to be captured
    await page.waitForTimeout(1000);

    // Analyze results
    console.log('\n=== AUDIO TEST RESULTS ===');
    console.log(`AudioManager test success: ${audioTestResult.success}`);
    if (audioTestResult.success) {
      console.log(`AudioManager initialized: ${audioTestResult.isInitialized}`);
      console.log(`AudioManager enabled: ${audioTestResult.isEnabled}`);
      console.log(`Audio context state: ${audioTestResult.audioContextState}`);
    } else {
      console.log(`Error: ${audioTestResult.error}`);
    }

    console.log(`\nTotal audio logs captured: ${audioLogs.length}`);
    audioLogs.forEach((log, index) => {
      console.log(`${index + 1}. [${log.timestamp}] ${log.message}`);
    });

    // Validate results
    expect(audioTestResult.success).toBe(true);
    expect(audioTestResult.isInitialized).toBe(true);
    expect(audioTestResult.isEnabled).toBe(true);
    expect(audioTestResult.audioContextState).toBe('running');

    // Should have captured several audio logs
    expect(audioLogs.length).toBeGreaterThan(5);

    // Should have logs for all major audio functions
    const hasPlayAlert = audioLogs.some((log) =>
      log.message.includes('playAlert called')
    );
    const hasPlayMetronome = audioLogs.some((log) =>
      log.message.includes('playMetronomeClick called')
    );
    const hasStartMetronome = audioLogs.some((log) =>
      log.message.includes('startMetronome called')
    );

    expect(hasPlayAlert).toBe(true);
    expect(hasPlayMetronome).toBe(true);
    expect(hasStartMetronome).toBe(true);

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
  });
});
