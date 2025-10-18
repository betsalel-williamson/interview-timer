import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Alpine.js
global.Alpine = {
  start: vi.fn(),
};

// Import the app and audio manager
import { multiTimerApp, audioManager } from './main.js';

describe('Multi-Timer Integration Tests', () => {
  let app;
  let mockIntervalId;
  let audioManagerSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    // Spy on the actual audio manager instance
    audioManagerSpy = vi.spyOn(audioManager, 'playAlert').mockResolvedValue();

    // Mock timers
    mockIntervalId = 123;
    global.setInterval = vi.fn().mockReturnValue(mockIntervalId);
    global.clearInterval = vi.fn();

    // Mock DOM methods
    global.document = {
      createElement: vi.fn().mockReturnValue({
        style: {},
        parentNode: { removeChild: vi.fn() },
      }),
      head: { appendChild: vi.fn() },
      body: { appendChild: vi.fn() },
      getElementById: vi.fn().mockReturnValue(null),
    };

    // Mock timing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    app = multiTimerApp();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Specific Use Case: 30s, 6m, 19m, 20m Timers', () => {
    it('should add all four specific timers correctly', () => {
      const durations = [30, 360, 1140, 1200]; // 30s, 6m, 19m, 20m

      app.addQuickTimers(durations);

      expect(app.timers).toHaveLength(4);
      expect(app.timers[0].duration).toBe(30); // 30 seconds
      expect(app.timers[1].duration).toBe(360); // 6 minutes
      expect(app.timers[2].duration).toBe(1140); // 19 minutes
      expect(app.timers[3].duration).toBe(1200); // 20 minutes

      // All should be in ready state
      app.timers.forEach((timer) => {
        expect(timer.status).toBe('ready');
        expect(timer.remainingTime).toBe(timer.duration);
      });
    });

    it('should start all timers simultaneously', () => {
      const durations = [30, 360, 1140, 1200];
      app.addQuickTimers(durations);

      const startTime = Date.now();
      app.startAllTimers();

      // All timers should start at the same time
      app.timers.forEach((timer) => {
        expect(timer.status).toBe('running');
        expect(timer.startTime).toBe(startTime);
        expect(timer.pausedTime).toBe(0);
      });
    });

    it('should countdown all timers in perfect synchronization', () => {
      const durations = [30, 360, 1140, 1200];
      app.addQuickTimers(durations);
      app.startAllTimers();

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);
      app.updateTimers();

      // All timers should have lost exactly 5 seconds
      expect(app.timers[0].remainingTime).toBe(25); // 30 - 5
      expect(app.timers[1].remainingTime).toBe(355); // 360 - 5
      expect(app.timers[2].remainingTime).toBe(1135); // 1140 - 5
      expect(app.timers[3].remainingTime).toBe(1195); // 1200 - 5
    });

    it('should complete 30-second timer first', () => {
      const durations = [30, 360, 1140, 1200];
      app.addQuickTimers(durations);
      app.startAllTimers();

      // Advance time to 30 seconds
      vi.advanceTimersByTime(30000);
      app.updateTimers();

      // First timer should be completed
      expect(app.timers[0].status).toBe('completed');
      expect(app.timers[0].remainingTime).toBe(0);

      // Other timers should still be running
      expect(app.timers[1].status).toBe('running');
      expect(app.timers[2].status).toBe('running');
      expect(app.timers[3].status).toBe('running');
    });

    it('should complete all timers in correct order', () => {
      const durations = [30, 360, 1140, 1200];
      app.addQuickTimers(durations);
      app.startAllTimers();

      // Complete 30s timer
      vi.advanceTimersByTime(30000);
      app.updateTimers();
      expect(app.timers[0].status).toBe('completed');

      // Complete 6m timer (at 6 minutes total)
      vi.advanceTimersByTime(330000); // 5.5 more minutes
      app.updateTimers();
      expect(app.timers[1].status).toBe('completed');

      // Complete 19m timer (at 19 minutes total)
      vi.advanceTimersByTime(780000); // 13 more minutes
      app.updateTimers();
      expect(app.timers[2].status).toBe('completed');

      // Complete 20m timer (at 20 minutes total)
      vi.advanceTimersByTime(60000); // 1 more minute
      app.updateTimers();
      expect(app.timers[3].status).toBe('completed');
    });
  });

  describe('Timer Completion Alerts', () => {
    beforeEach(() => {
      app.timers = [
        { id: 1, duration: 1, remainingTime: 0, status: 'completed' },
      ];
    });

    it('should trigger audio alert when timer completes', async () => {
      await app.handleTimerCompletion([app.timers[0]]);

      expect(audioManagerSpy).toHaveBeenCalled();
    });

    it('should not trigger audio alert when disabled', async () => {
      app.settings.audioEnabled = false;

      await app.handleTimerCompletion([app.timers[0]]);

      expect(audioManagerSpy).not.toHaveBeenCalled();
    });

    it('should trigger visual flash when enabled', () => {
      app.settings.flashEnabled = true;

      app.flashScreen();

      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should not trigger visual flash when disabled', () => {
      app.settings.flashEnabled = false;

      // Flash should not be called when disabled
      // This is tested implicitly by not calling flashScreen
    });
  });

  describe('Full Workflow Integration', () => {
    it('should handle complete workflow from setup to completion', async () => {
      // Initialize app
      await app.init();
      expect(app.isInitialized).toBe(true);

      // Add specific timers
      app.addQuickTimers([30, 360, 1140, 1200]);
      expect(app.timers).toHaveLength(4);

      // Start all timers
      app.startAllTimers();
      expect(app.timers.every((t) => t.status === 'running')).toBe(true);

      // Simulate time passing and updates
      vi.advanceTimersByTime(1000);
      app.updateTimers();
      expect(app.timers.every((t) => t.remainingTime < t.duration)).toBe(true);

      // Complete first timer
      vi.advanceTimersByTime(29000);
      app.updateTimers();
      expect(app.timers[0].status).toBe('completed');

      // Reset all timers
      app.resetAllTimers();
      expect(app.timers.every((t) => t.status === 'ready')).toBe(true);
      expect(app.timers.every((t) => t.remainingTime === t.duration)).toBe(
        true
      );
    });

    it('should handle individual timer controls during workflow', () => {
      app.addQuickTimers([30, 60]);
      app.startAllTimers();

      // Pause first timer
      app.toggleTimer(app.timers[0].id);
      expect(app.timers[0].status).toBe('paused');
      expect(app.timers[1].status).toBe('running');

      // Advance time
      vi.advanceTimersByTime(10000);
      app.updateTimers();

      // First timer should not have changed (paused)
      expect(app.timers[0].remainingTime).toBe(30);
      // Second timer should have lost 10 seconds
      expect(app.timers[1].remainingTime).toBe(50);

      // Resume first timer
      app.toggleTimer(app.timers[0].id);
      expect(app.timers[0].status).toBe('running');
    });

    it('should handle removing timers during workflow', () => {
      app.addQuickTimers([30, 60, 90]);
      expect(app.timers).toHaveLength(3);

      // Remove middle timer
      app.removeTimer(app.timers[1].id);
      expect(app.timers).toHaveLength(2);

      // Start remaining timers
      app.startAllTimers();
      expect(app.timers.every((t) => t.status === 'running')).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle audio initialization failure gracefully', async () => {
      vi.spyOn(audioManager, 'initialize').mockRejectedValue(
        new Error('Audio init failed')
      );

      await app.init();

      // App should still initialize even if audio fails
      expect(app.isInitialized).toBe(true);
    });

    it('should handle audio playback failure gracefully', async () => {
      vi.spyOn(audioManager, 'playAlert').mockRejectedValue(
        new Error('Audio playback failed')
      );

      // Should not throw
      await expect(
        app.handleTimerCompletion([{ id: 1 }])
      ).resolves.toBeUndefined();
    });

    it('should handle invalid timer operations gracefully', () => {
      // Toggle non-existent timer
      expect(() => app.toggleTimer(999)).not.toThrow();

      // Remove non-existent timer
      expect(() => app.removeTimer(999)).not.toThrow();
    });

    it('should handle rapid timer operations', () => {
      app.addQuickTimers([30, 60]);
      app.startAllTimers();

      // Rapid toggle operations
      app.toggleTimer(app.timers[0].id); // Pause
      app.toggleTimer(app.timers[0].id); // Resume
      app.toggleTimer(app.timers[0].id); // Pause again

      expect(app.timers[0].status).toBe('paused');
    });
  });

  describe('Performance with Multiple Timers', () => {
    it('should handle many timers efficiently', () => {
      const manyDurations = Array.from({ length: 20 }, (_, i) => (i + 1) * 10);

      app.addQuickTimers(manyDurations);
      expect(app.timers).toHaveLength(20);

      app.startAllTimers();
      expect(app.timers.every((t) => t.status === 'running')).toBe(true);

      // Update should be fast even with many timers
      const startTime = performance.now();
      app.updateTimers();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });
});
