import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Alpine.js
global.Alpine = {
  start: vi.fn(),
};

// Mock AudioManager
vi.mock('./audio.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(),
    playAlert: vi.fn().mockResolvedValue(),
    setEnabled: vi.fn(),
    isAvailable: vi.fn().mockReturnValue(true),
    cleanup: vi.fn(),
    startClickTesting: vi.fn().mockResolvedValue(),
    stopClickTesting: vi.fn(),
    startMetronome: vi.fn().mockResolvedValue(),
    stopMetronome: vi.fn(),
    isInitialized: false,
  })),
}));

// Import after mocking
import { multiTimerApp, createTimer, audioManager } from './main.js';

describe('Multi-Timer Application', () => {
  let app;
  let mockIntervalId;
  let setIntervalSpy;
  let clearIntervalSpy;

  beforeEach(() => {
    // Mock Date.now for consistent timing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    // Mock setInterval and clearInterval
    mockIntervalId = 123;
    setIntervalSpy = vi
      .spyOn(global, 'setInterval')
      .mockReturnValue(mockIntervalId);
    clearIntervalSpy = vi
      .spyOn(global, 'clearInterval')
      .mockImplementation(() => {});

    // Create fresh app instance
    app = multiTimerApp();

    // Reset interval ID for each test
    app.intervalId = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      expect(app.timers).toEqual([]);
      expect(app.newTimer).toEqual({ minutes: 0, seconds: 0 });
      expect(app.formError).toBe('');
      expect(app.settings).toEqual({
        audioEnabled: true,
        flashEnabled: true,
        audioTestingEnabled: false,
        metronomeEnabled: false,
      });
      expect(app.intervalId).toBeNull();
      expect(app.isInitialized).toBe(false);
    });

    it('should initialize successfully', async () => {
      await app.init();

      expect(app.isInitialized).toBe(true);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
    });
  });

  describe('timer creation', () => {
    it('should create timer with correct structure', () => {
      const timer = createTimer(5, 30);

      expect(timer).toMatchObject({
        id: expect.any(Number),
        duration: 330, // 5 minutes 30 seconds
        remainingTime: 330,
        status: 'ready',
        startTime: null,
        pausedTime: 0,
      });
    });

    it('should generate unique IDs for timers', () => {
      const timer1 = createTimer(1, 0);
      const timer2 = createTimer(2, 0);

      expect(timer1.id).not.toBe(timer2.id);
    });
  });

  describe('form validation', () => {
    it('should validate correct timer input', () => {
      app.newTimer = { minutes: 5, seconds: 30 };
      expect(app.isValidTimer()).toBe(true);
    });

    it('should reject zero duration', () => {
      app.newTimer = { minutes: 0, seconds: 0 };
      expect(app.isValidTimer()).toBe(false);
    });

    it('should reject negative minutes', () => {
      app.newTimer = { minutes: -1, seconds: 30 };
      expect(app.isValidTimer()).toBe(false);
    });

    it('should reject negative seconds', () => {
      app.newTimer = { minutes: 5, seconds: -1 };
      expect(app.isValidTimer()).toBe(false);
    });

    it('should reject minutes over 59', () => {
      app.newTimer = { minutes: 60, seconds: 0 };
      expect(app.isValidTimer()).toBe(false);
    });

    it('should reject seconds over 59', () => {
      app.newTimer = { minutes: 5, seconds: 60 };
      expect(app.isValidTimer()).toBe(false);
    });

    it('should accept valid edge cases', () => {
      app.newTimer = { minutes: 0, seconds: 1 };
      expect(app.isValidTimer()).toBe(true);

      app.newTimer = { minutes: 59, seconds: 59 };
      expect(app.isValidTimer()).toBe(true);
    });
  });

  describe('addTimer', () => {
    it('should add valid timer to list', async () => {
      app.newTimer = { minutes: 2, seconds: 30 };

      await app.addTimer();

      expect(app.timers).toHaveLength(1);
      expect(app.timers[0].duration).toBe(150); // 2:30
      expect(app.newTimer).toEqual({ minutes: 0, seconds: 0 });
      expect(app.formError).toBe('');
    });

    it('should not add invalid timer', async () => {
      app.newTimer = { minutes: 0, seconds: 0 };

      await app.addTimer();

      expect(app.timers).toHaveLength(0);
      expect(app.formError).toBe(
        'Please enter valid minutes and seconds (at least 1 second total)'
      );
    });

    it('should start interval when adding first timer', async () => {
      app.newTimer = { minutes: 1, seconds: 0 };

      await app.addTimer();

      expect(setIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('addQuickTimers', () => {
    it('should add multiple timers from durations', () => {
      const durations = [30, 360, 1140, 1200]; // 30s, 6m, 19m, 20m

      app.addQuickTimers(durations);

      expect(app.timers).toHaveLength(4);
      expect(app.timers[0].duration).toBe(30);
      expect(app.timers[1].duration).toBe(360);
      expect(app.timers[2].duration).toBe(1140);
      expect(app.timers[3].duration).toBe(1200);
    });

    it('should start interval when adding quick timers', () => {
      app.addQuickTimers([30]);

      expect(setIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('timer controls', () => {
    beforeEach(() => {
      app.timers = [
        {
          id: 1,
          duration: 60,
          remainingTime: 60,
          status: 'ready',
          startTime: null,
          pausedTime: 0,
        },
        {
          id: 2,
          duration: 120,
          remainingTime: 120,
          status: 'ready',
          startTime: null,
          pausedTime: 0,
        },
      ];
    });

    it('should check if all timers can be started', () => {
      expect(app.canStartAll()).toBe(true);

      app.timers[0].status = 'running';
      expect(app.canStartAll()).toBe(true);

      app.timers[1].status = 'running';
      expect(app.canStartAll()).toBe(false);
    });

    it('should start all ready timers', () => {
      const now = Date.now();

      app.startAllTimers();

      expect(app.timers[0].status).toBe('running');
      expect(app.timers[0].startTime).toBe(now);
      expect(app.timers[1].status).toBe('running');
      expect(app.timers[1].startTime).toBe(now);
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('should not start already running timers', () => {
      app.timers[0].status = 'running';
      app.timers[0].startTime = 1000;

      app.startAllTimers();

      expect(app.timers[0].startTime).toBe(1000); // Should not change
      expect(app.timers[1].status).toBe('running'); // Should start the ready one
    });

    it('should toggle timer from ready to running', () => {
      const now = Date.now();

      app.toggleTimer(1);

      expect(app.timers[0].status).toBe('running');
      expect(app.timers[0].startTime).toBe(now);
    });

    it('should toggle timer from running to paused', () => {
      app.timers[0].status = 'running';
      app.timers[0].startTime = Date.now() - 1000; // Started 1 second ago

      app.toggleTimer(1);

      expect(app.timers[0].status).toBe('paused');
      expect(app.timers[0].pausedTime).toBe(1); // 1 second paused
    });

    it('should remove timer by id', () => {
      app.removeTimer(1);

      expect(app.timers).toHaveLength(1);
      expect(app.timers[0].id).toBe(2);
    });

    it('should reset all timers', () => {
      app.timers[0].status = 'running';
      app.timers[0].remainingTime = 30;
      app.timers[0].startTime = Date.now();
      app.timers[0].pausedTime = 10;

      // Set up the interval so it can be cleared
      app.intervalId = mockIntervalId;

      app.resetAllTimers();

      expect(app.timers[0].status).toBe('ready');
      expect(app.timers[0].remainingTime).toBe(60);
      expect(app.timers[0].startTime).toBeNull();
      expect(app.timers[0].pausedTime).toBe(0);
      expect(clearIntervalSpy).toHaveBeenCalledWith(mockIntervalId);
    });
  });

  describe('timer updates', () => {
    beforeEach(() => {
      app.intervalId = mockIntervalId;
      app.timers = [
        {
          id: 1,
          duration: 60,
          remainingTime: 60,
          status: 'running',
          startTime: Date.now() - 1000, // Started 1 second ago
          pausedTime: 0,
        },
      ];
    });

    it('should update running timer countdown', () => {
      app.updateTimers();

      expect(app.timers[0].remainingTime).toBe(59); // 60 - 1 second elapsed
    });

    it('should mark timer as completed when time reaches zero', () => {
      app.timers[0].startTime = Date.now() - 60000; // Started 60 seconds ago

      app.updateTimers();

      expect(app.timers[0].status).toBe('completed');
      expect(app.timers[0].remainingTime).toBe(0);
    });

    it('should stop interval when no timers are running', () => {
      app.timers[0].status = 'completed';

      app.updateTimers();

      expect(clearIntervalSpy).toHaveBeenCalledWith(mockIntervalId);
    });

    it('should not update paused timers', () => {
      app.timers[0].status = 'paused';
      app.timers[0].remainingTime = 45;

      app.updateTimers();

      expect(app.timers[0].remainingTime).toBe(45); // Should not change
    });
  });

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(app.formatTime(0)).toBe('00:00');
      expect(app.formatTime(30)).toBe('00:30');
      expect(app.formatTime(60)).toBe('01:00');
      expect(app.formatTime(90)).toBe('01:30');
      expect(app.formatTime(3661)).toBe('61:01');
    });

    it('should handle edge cases', () => {
      expect(app.formatTime(59.9)).toBe('00:59'); // Should floor
      expect(app.formatTime(60.1)).toBe('01:00'); // Should floor
    });
  });

  describe('interval management', () => {
    it('should start timer interval', () => {
      app.startTimerInterval();

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
      expect(app.intervalId).toBe(mockIntervalId);
    });

    it('should not start multiple intervals', () => {
      app.intervalId = mockIntervalId;

      app.startTimerInterval();

      expect(setIntervalSpy).toHaveBeenCalledTimes(0); // Should not call again
    });

    it('should stop timer interval', () => {
      app.intervalId = mockIntervalId;

      app.stopTimerInterval();

      expect(clearIntervalSpy).toHaveBeenCalledWith(mockIntervalId);
      expect(app.intervalId).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      app.intervalId = mockIntervalId;

      app.destroy();

      expect(clearIntervalSpy).toHaveBeenCalledWith(mockIntervalId);
    });
  });

  describe('audio testing state management', () => {
    let app;

    beforeEach(() => {
      app = multiTimerApp();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      if (app) {
        app.destroy();
      }
    });

    it('should initialize with audio testing and metronome disabled', () => {
      expect(app.settings.audioTestingEnabled).toBe(false);
      expect(app.settings.metronomeEnabled).toBe(false);
      expect(app.audioTestingIntervalId).toBeNull();
      expect(app.audioTestingActive).toBe(false);
      expect(app.metronomeActive).toBe(false);
    });

    it('should have startAudioTesting method', () => {
      expect(typeof app.startAudioTesting).toBe('function');
    });

    it('should have stopAudioTesting method', () => {
      expect(typeof app.stopAudioTesting).toBe('function');
    });

    it('should have startMetronome method', () => {
      expect(typeof app.startMetronome).toBe('function');
    });

    it('should have stopMetronome method', () => {
      expect(typeof app.stopMetronome).toBe('function');
    });

    it('should start audio testing when enabled', async () => {
      const startClickTestingSpy = vi.spyOn(audioManager, 'startClickTesting');

      await app.startAudioTesting();

      expect(startClickTestingSpy).toHaveBeenCalled();
      expect(app.audioTestingActive).toBe(true);
    });

    it('should stop audio testing when disabled', async () => {
      const stopClickTestingSpy = vi.spyOn(audioManager, 'stopClickTesting');

      await app.startAudioTesting();
      await app.stopAudioTesting();

      expect(stopClickTestingSpy).toHaveBeenCalled();
      expect(app.audioTestingActive).toBe(false);
    });

    it('should handle audio testing errors gracefully', async () => {
      const startClickTestingSpy = vi
        .spyOn(audioManager, 'startClickTesting')
        .mockRejectedValue(new Error('Audio testing failed'));

      await app.startAudioTesting();

      expect(startClickTestingSpy).toHaveBeenCalled();
      expect(app.audioTestingActive).toBe(false);
    });

    it('should clean up audio testing on destroy', async () => {
      const stopClickTestingSpy = vi.spyOn(audioManager, 'stopClickTesting');

      await app.startAudioTesting();
      app.destroy();

      expect(stopClickTestingSpy).toHaveBeenCalled();
    });

    it('should start metronome when enabled', async () => {
      const startMetronomeSpy = vi.spyOn(audioManager, 'startMetronome');

      await app.startMetronome();

      expect(startMetronomeSpy).toHaveBeenCalledWith(expect.any(Function));
      expect(app.metronomeActive).toBe(true);
    });

    it('should stop metronome when disabled', async () => {
      const stopMetronomeSpy = vi.spyOn(audioManager, 'stopMetronome');

      await app.startMetronome();
      await app.stopMetronome();

      expect(stopMetronomeSpy).toHaveBeenCalled();
      expect(app.metronomeActive).toBe(false);
    });

    it('should handle metronome errors gracefully', async () => {
      const startMetronomeSpy = vi
        .spyOn(audioManager, 'startMetronome')
        .mockRejectedValue(new Error('Metronome failed'));

      await app.startMetronome();

      expect(startMetronomeSpy).toHaveBeenCalled();
      expect(app.metronomeActive).toBe(false);
    });

    it('should clean up metronome on destroy', async () => {
      const stopMetronomeSpy = vi.spyOn(audioManager, 'stopMetronome');

      await app.startMetronome();
      app.destroy();

      expect(stopMetronomeSpy).toHaveBeenCalled();
    });

    it('should pass correct function to check for active timers', async () => {
      const startMetronomeSpy = vi.spyOn(audioManager, 'startMetronome');

      // Add a running timer
      app.timers = [{ id: 1, status: 'running' }];

      await app.startMetronome();

      expect(startMetronomeSpy).toHaveBeenCalledWith(expect.any(Function));

      // Test the function that was passed
      const hasActiveTimersFunction = startMetronomeSpy.mock.calls[0][0];
      expect(hasActiveTimersFunction()).toBe(true);

      // Test with no running timers
      app.timers = [{ id: 1, status: 'ready' }];
      expect(hasActiveTimersFunction()).toBe(false);
    });
  });
});
