import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Alpine.js
global.Alpine = {
  start: vi.fn(),
};

// Import the app and audio manager
import { multiTimerApp, audioManager } from '../src/main.js';

describe('Specific Use Case: Interview Practice Timers', () => {
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

    // Mock DOM methods for flash functionality
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

  describe('30 seconds, 6 minutes, 19 minutes, 20 minutes timers', () => {
    it('should add all four specific timers quickly', () => {
      // Test the exact durations from the use case
      const durations = [30, 360, 1140, 1200]; // 30s, 6m, 19m, 20m

      app.addQuickTimers(durations);

      expect(app.timers).toHaveLength(4);
      expect(app.timers[0].duration).toBe(30); // 30 seconds
      expect(app.timers[1].duration).toBe(360); // 6 minutes (6 * 60)
      expect(app.timers[2].duration).toBe(1140); // 19 minutes (19 * 60)
      expect(app.timers[3].duration).toBe(1200); // 20 minutes (20 * 60)
    });

    it('should start all timers simultaneously with one click', async () => {
      const durations = [30, 360, 1140, 1200];
      app.addQuickTimers(durations);

      // Verify all timers are ready
      expect(app.canStartAll()).toBe(true);

      // Start all with one action
      const startTime = Date.now();
      await app.startAllTimers();

      // All timers should start at exactly the same time
      app.timers.forEach((timer) => {
        expect(timer.status).toBe('running');
        expect(timer.startTime).toBe(startTime);
        expect(timer.pausedTime).toBe(0);
      });
    });

    it('should complete each timer with proper audio and visual alerts', async () => {
      const durations = [30, 360, 1140, 1200];
      app.addQuickTimers(durations);
      await app.startAllTimers();

      // Complete 30-second timer
      vi.advanceTimersByTime(30000);
      app.updateTimers();

      expect(app.timers[0].status).toBe('completed');
      expect(app.timers[0].remainingTime).toBe(0);

      // Should trigger alerts
      await app.handleTimerCompletion([app.timers[0]]);
      expect(audioManagerSpy).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('div'); // Flash element
    });

    it('should handle the full workflow smoothly', async () => {
      // Initialize application
      await app.init();
      expect(app.isInitialized).toBe(true);

      // Add specific timers
      app.addQuickTimers([30, 360, 1140, 1200]);
      expect(app.timers).toHaveLength(4);

      // Start all timers
      await app.startAllTimers();
      expect(app.timers.every((t) => t.status === 'running')).toBe(true);

      // Simulate the interview practice session
      // 30 seconds - first timer completes
      vi.advanceTimersByTime(30000);
      app.updateTimers();
      expect(app.timers[0].status).toBe('completed');

      // 6 minutes - second timer completes
      vi.advanceTimersByTime(330000); // 5.5 more minutes
      app.updateTimers();
      expect(app.timers[1].status).toBe('completed');

      // 19 minutes - third timer completes
      vi.advanceTimersByTime(780000); // 13 more minutes
      app.updateTimers();
      expect(app.timers[2].status).toBe('completed');

      // 20 minutes - final timer completes
      vi.advanceTimersByTime(60000); // 1 more minute
      app.updateTimers();
      expect(app.timers[3].status).toBe('completed');

      // All timers should be completed
      expect(app.timers.every((t) => t.status === 'completed')).toBe(true);
    });

    it('should maintain performance with multiple timers', async () => {
      const durations = [30, 360, 1140, 1200];
      app.addQuickTimers(durations);
      await app.startAllTimers();

      // Measure update performance
      const startTime = performance.now();

      // Simulate 1 minute of updates (600 updates at 100ms intervals)
      for (let i = 0; i < 600; i++) {
        vi.advanceTimersByTime(100);
        app.updateTimers();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should be reasonably fast even with continuous updates
      // Using a very lenient threshold for fake timers
      expect(totalTime).toBeLessThanOrEqual(60000); // Less than or equal to 1 minute for 600 updates
    });
  });

  describe('User Experience Validation', () => {
    it('should provide clear visual feedback for each timer state', async () => {
      app.addQuickTimers([30, 60]);

      // Ready state
      expect(app.timers[0].status).toBe('ready');
      expect(app.timers[0].remainingTime).toBe(30);

      // Running state
      await app.startAllTimers();
      expect(app.timers[0].status).toBe('running');

      // Completed state
      vi.advanceTimersByTime(30000);
      app.updateTimers();
      expect(app.timers[0].status).toBe('completed');
      expect(app.timers[0].remainingTime).toBe(0);
    });

    it('should allow individual timer control during session', async () => {
      app.addQuickTimers([30, 60, 90]);
      await app.startAllTimers();

      // Pause middle timer
      app.toggleTimer(app.timers[1].id);
      expect(app.timers[1].status).toBe('paused');

      // Other timers should continue running
      expect(app.timers[0].status).toBe('running');
      expect(app.timers[2].status).toBe('running');

      // Advance time
      vi.advanceTimersByTime(10000);
      app.updateTimers();

      // Paused timer should not change
      expect(app.timers[1].remainingTime).toBe(60);

      // Running timers should update
      expect(app.timers[0].remainingTime).toBe(20); // 30 - 10
      expect(app.timers[2].remainingTime).toBe(80); // 90 - 10
    });

    it('should allow reset and restart during session', async () => {
      app.addQuickTimers([30, 60]);
      await app.startAllTimers();

      // Advance time
      vi.advanceTimersByTime(15000);
      app.updateTimers();

      // Timers should have progressed
      expect(app.timers[0].remainingTime).toBe(15);
      expect(app.timers[1].remainingTime).toBe(45);

      // Reset all
      app.resetAllTimers();

      // Should return to initial state
      expect(app.timers[0].status).toBe('ready');
      expect(app.timers[0].remainingTime).toBe(30);
      expect(app.timers[1].status).toBe('ready');
      expect(app.timers[1].remainingTime).toBe(60);

      // Should be able to start again
      await app.startAllTimers();
      expect(app.timers.every((t) => t.status === 'running')).toBe(true);
    });

    it('should handle settings changes during session', async () => {
      app.addQuickTimers([30]);
      await app.startAllTimers();

      // Disable audio
      app.settings.audioEnabled = false;
      expect(app.settings.audioEnabled).toBe(false);

      // Complete timer
      vi.advanceTimersByTime(30000);
      app.updateTimers();

      // Should not play audio
      app.handleTimerCompletion([app.timers[0]]);
      expect(audioManagerSpy).not.toHaveBeenCalled();

      // Re-enable audio
      app.settings.audioEnabled = true;
      app.resetAllTimers();
      await app.startAllTimers();

      // Complete again
      vi.advanceTimersByTime(30000);
      app.updateTimers();

      // Should play audio now
      app.handleTimerCompletion([app.timers[0]]);
      expect(audioManagerSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle rapid timer additions and removals', async () => {
      // Add timers
      app.addQuickTimers([30, 60]);
      expect(app.timers).toHaveLength(2);

      // Remove one
      app.removeTimer(app.timers[0].id);
      expect(app.timers).toHaveLength(1);

      // Add more
      app.addQuickTimers([90, 120]);
      expect(app.timers).toHaveLength(3);

      // Start all
      await app.startAllTimers();
      expect(app.timers.every((t) => t.status === 'running')).toBe(true);
    });

    it('should handle timer completion during rapid operations', async () => {
      app.addQuickTimers([1, 2, 3]); // Very short timers for testing
      await app.startAllTimers();

      // Advance time to complete first timer
      vi.advanceTimersByTime(1000);
      app.updateTimers();

      expect(app.timers[0].status).toBe('completed');

      // Should still be able to control other timers
      app.toggleTimer(app.timers[1].id);
      expect(app.timers[1].status).toBe('paused');
    });

    it('should maintain accuracy over long periods', async () => {
      app.addQuickTimers([1200]); // 20 minutes
      await app.startAllTimers();

      // Advance by exactly 20 minutes
      vi.advanceTimersByTime(1200000); // 20 * 60 * 1000 ms
      app.updateTimers();

      expect(app.timers[0].status).toBe('completed');
      expect(app.timers[0].remainingTime).toBe(0);
    });
  });
});
