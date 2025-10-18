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
    playMetronomeClick: vi.fn().mockResolvedValue(),
    isInitialized: false,
  })),
}));

// Import after mocking
import { multiTimerApp, createTimer, audioManager } from '../src/main.js';

describe('Interview Timer Application', () => {
  let app;
  let mockIntervalId;
  let mockTimeoutId;
  let setIntervalSpy;
  let clearIntervalSpy;
  let setTimeoutSpy;
  let clearTimeoutSpy;

  beforeEach(() => {
    // Mock Date.now for consistent timing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    // Mock setInterval, clearInterval, setTimeout, and clearTimeout
    mockIntervalId = 123;
    mockTimeoutId = 456;
    setIntervalSpy = vi
      .spyOn(global, 'setInterval')
      .mockReturnValue(mockIntervalId);
    clearIntervalSpy = vi
      .spyOn(global, 'clearInterval')
      .mockImplementation(() => {});
    setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockReturnValue(mockTimeoutId);
    clearTimeoutSpy = vi
      .spyOn(global, 'clearTimeout')
      .mockImplementation(() => {});

    // Create fresh app instance
    app = multiTimerApp();

    // Reset interval ID and timer start time for each test
    app.intervalId = null;
    app.timerStartTime = null;
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
        metronomeEnabled: true,
        autoStartNewTimers: false,
      });
      expect(app.intervalId).toBeNull();
      expect(app.isInitialized).toBe(false);
    });

    it('should initialize successfully', async () => {
      await app.init();

      expect(app.isInitialized).toBe(true);
      expect(setTimeoutSpy).toHaveBeenCalled();
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
        isEditing: false,
        editMinutes: '',
        editSeconds: '',
        editError: '',
      });
    });

    it('should generate unique IDs for timers', () => {
      const timer1 = createTimer(1, 0);
      const timer2 = createTimer(2, 0);

      expect(timer1.id).not.toBe(timer2.id);
    });

    it('should have correct default values for editing properties', () => {
      const timer = createTimer(1, 30);

      expect(timer.isEditing).toBe(false);
      expect(timer.editMinutes).toBe('');
      expect(timer.editSeconds).toBe('');
      expect(timer.editError).toBe('');
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

      expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('should auto-start timer when autoStartNewTimers is enabled', async () => {
      app.settings.autoStartNewTimers = true;
      app.newTimer = { minutes: 1, seconds: 0 };

      await app.addTimer();

      expect(app.timers).toHaveLength(1);
      expect(app.timers[0].status).toBe('running');
      expect(app.timers[0].startTime).toBeDefined();
      expect(app.timers[0].pausedTime).toBe(0);
    });

    it('should not auto-start timer when autoStartNewTimers is disabled', async () => {
      app.settings.autoStartNewTimers = false;
      app.newTimer = { minutes: 1, seconds: 0 };

      await app.addTimer();

      expect(app.timers).toHaveLength(1);
      expect(app.timers[0].status).toBe('ready');
      expect(app.timers[0].startTime).toBeNull();
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

      expect(setTimeoutSpy).toHaveBeenCalled();
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

    it('should start all ready timers', async () => {
      const now = Date.now();

      await app.startAllTimers();

      expect(app.timers[0].status).toBe('running');
      expect(app.timers[0].startTime).toBe(now);
      expect(app.timers[1].status).toBe('running');
      expect(app.timers[1].startTime).toBe(now);
      expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('should not start already running timers', async () => {
      app.timers[0].status = 'running';
      app.timers[0].startTime = 1000;

      await app.startAllTimers();

      expect(app.timers[0].startTime).toBe(1000); // Should not change
      expect(app.timers[1].status).toBe('running'); // Should start the ready one
    });

    it('should toggle timer from ready to running', async () => {
      const now = Date.now();

      await app.toggleTimer(1);

      expect(app.timers[0].status).toBe('running');
      expect(app.timers[0].startTime).toBe(now);
      expect(setTimeoutSpy).toHaveBeenCalled();
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
      app.intervalId = mockTimeoutId;

      app.resetAllTimers();

      expect(app.timers[0].status).toBe('ready');
      expect(app.timers[0].remainingTime).toBe(60);
      expect(app.timers[0].startTime).toBeNull();
      expect(app.timers[0].pausedTime).toBe(0);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(mockTimeoutId);
    });
  });

  describe('timer updates', () => {
    beforeEach(() => {
      app.intervalId = mockTimeoutId;
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
    it('should start timer interval with system clock synchronization', () => {
      app.startTimerInterval();

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(app.intervalId).toBe(mockTimeoutId);
      expect(app.timerStartTime).toBeDefined();
    });

    it('should not start multiple intervals', () => {
      app.intervalId = mockTimeoutId;

      app.startTimerInterval();

      expect(setTimeoutSpy).toHaveBeenCalledTimes(0); // Should not call again
    });

    it('should stop timer interval', () => {
      app.intervalId = mockTimeoutId;

      app.stopTimerInterval();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(mockTimeoutId);
      expect(app.intervalId).toBeNull();
      expect(app.timerStartTime).toBeNull();
    });
  });

  describe('synchronization behavior', () => {
    it('should schedule timer updates aligned to second boundaries', () => {
      // Set a specific time that's not aligned to second boundary
      vi.setSystemTime(new Date('2024-01-01T00:00:00.500Z')); // 500ms past the second

      // Set timer start time to the beginning of the second
      app.timerStartTime = new Date('2024-01-01T00:00:00.000Z').getTime();

      app.scheduleNextTimerUpdate();

      // Should schedule the next update to align with the next second boundary
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('should calculate correct delay for system clock alignment', () => {
      // Test different times to ensure correct delay calculation
      const testCases = [
        { time: '2024-01-01T00:00:00.100Z', expectedDelay: 900 }, // 900ms to next second
        { time: '2024-01-01T00:00:00.500Z', expectedDelay: 500 }, // 500ms to next second
        { time: '2024-01-01T00:00:00.999Z', expectedDelay: 1 }, // 1ms to next second
        { time: '2024-01-01T00:00:00.000Z', expectedDelay: 0 }, // 0ms delay (immediate execution)
      ];

      testCases.forEach(({ time, expectedDelay }) => {
        vi.setSystemTime(new Date(time));
        // Set timer start time to the beginning of the second
        app.timerStartTime = new Date('2024-01-01T00:00:00.000Z').getTime();

        // Clear previous calls
        setTimeoutSpy.mockClear();

        app.scheduleNextTimerUpdate();

        expect(setTimeoutSpy).toHaveBeenCalledWith(
          expect.any(Function),
          expectedDelay
        );
      });
    });

    it('should continue scheduling updates when timers are running', () => {
      app.timerStartTime = Date.now();
      app.timers = [
        {
          id: 1,
          status: 'running',
          duration: 60,
          remainingTime: 60,
          startTime: Date.now(),
          pausedTime: 0,
        },
      ];

      // Mock the updateTimers method to avoid side effects
      const updateTimersSpy = vi
        .spyOn(app, 'updateTimers')
        .mockImplementation(() => {});

      app.scheduleNextTimerUpdate();

      // Should schedule another update since timer is running
      expect(setTimeoutSpy).toHaveBeenCalled();

      updateTimersSpy.mockRestore();
    });

    it('should stop scheduling updates when no timers are running', () => {
      app.timerStartTime = Date.now();
      app.timers = [
        {
          id: 1,
          status: 'ready',
          duration: 60,
          remainingTime: 60,
          startTime: null,
          pausedTime: 0,
        },
      ];

      // Mock the updateTimers method to avoid side effects
      const updateTimersSpy = vi
        .spyOn(app, 'updateTimers')
        .mockImplementation(() => {});

      app.scheduleNextTimerUpdate();

      // Should schedule the first update
      expect(setTimeoutSpy).toHaveBeenCalled();

      // Execute the callback to test the stopping logic
      const callback = setTimeoutSpy.mock.calls[0][0];
      callback();

      // Should not schedule another update since no timers are running
      expect(app.intervalId).toBeNull();

      updateTimersSpy.mockRestore();
    });

    it('should handle multiple timers synchronously', () => {
      app.timerStartTime = Date.now();
      app.timers = [
        {
          id: 1,
          status: 'running',
          duration: 60,
          remainingTime: 60,
          startTime: Date.now(),
          pausedTime: 0,
        },
        {
          id: 2,
          status: 'running',
          duration: 120,
          remainingTime: 120,
          startTime: Date.now(),
          pausedTime: 0,
        },
        {
          id: 3,
          status: 'ready',
          duration: 180,
          remainingTime: 180,
          startTime: null,
          pausedTime: 0,
        },
      ];

      // Mock the updateTimers method to avoid side effects
      const updateTimersSpy = vi
        .spyOn(app, 'updateTimers')
        .mockImplementation(() => {});

      app.scheduleNextTimerUpdate();

      // Should schedule another update since there are running timers
      expect(setTimeoutSpy).toHaveBeenCalled();

      updateTimersSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      app.intervalId = mockTimeoutId;

      app.destroy();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(mockTimeoutId);
    });
  });

  describe('timer editing methods', () => {
    beforeEach(() => {
      app.timers = [
        {
          id: 1,
          duration: 60,
          remainingTime: 60,
          status: 'ready',
          startTime: null,
          pausedTime: 0,
          isEditing: false,
          editMinutes: '',
          editSeconds: '',
          editError: '',
        },
        {
          id: 2,
          duration: 120,
          remainingTime: 120,
          status: 'running',
          startTime: Date.now(),
          pausedTime: 0,
          isEditing: false,
          editMinutes: '',
          editSeconds: '',
          editError: '',
        },
      ];
    });

    it('should have startEditTimer method', () => {
      expect(typeof app.startEditTimer).toBe('function');
    });

    it('should have cancelEditTimer method', () => {
      expect(typeof app.cancelEditTimer).toBe('function');
    });

    it('should have saveEditTimer method', () => {
      expect(typeof app.saveEditTimer).toBe('function');
    });

    it('should have validateTimeInput method', () => {
      expect(typeof app.validateTimeInput).toBe('function');
    });

    it('should start edit mode for specified timer', () => {
      app.startEditTimer(1);

      expect(app.timers[0].isEditing).toBe(true);
      expect(app.timers[0].editMinutes).toBe('01');
      expect(app.timers[0].editSeconds).toBe('00');
      expect(app.timers[0].editError).toBe('');
    });

    it('should cancel edit mode and restore original value', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '02';
      app.timers[0].editSeconds = '30';
      app.timers[0].editError = 'Invalid input';

      app.cancelEditTimer(1);

      expect(app.timers[0].isEditing).toBe(false);
      expect(app.timers[0].editMinutes).toBe('');
      expect(app.timers[0].editSeconds).toBe('');
      expect(app.timers[0].editError).toBe('');
    });

    it('should validate correct time input format', () => {
      expect(app.validateTimeInput('01:30')).toBe(true);
      expect(app.validateTimeInput('00:01')).toBe(true);
      expect(app.validateTimeInput('59:59')).toBe(true);
    });

    it('should reject invalid time input format', () => {
      expect(app.validateTimeInput('1:30')).toBe(false); // Missing leading zero
      expect(app.validateTimeInput('01:60')).toBe(false); // Invalid seconds
      expect(app.validateTimeInput('60:00')).toBe(false); // Invalid minutes
      expect(app.validateTimeInput('abc')).toBe(false); // Non-numeric
      expect(app.validateTimeInput('')).toBe(false); // Empty
      expect(app.validateTimeInput('1')).toBe(false); // Incomplete format
      expect(app.validateTimeInput('1:')).toBe(false); // Incomplete format
      expect(app.validateTimeInput(':30')).toBe(false); // Incomplete format
      expect(app.validateTimeInput('1:30:45')).toBe(false); // Too many parts
      expect(app.validateTimeInput(' 01:30 ')).toBe(true); // Whitespace should be trimmed and valid
      expect(app.validateTimeInput('01:30.5')).toBe(false); // Decimal
      expect(app.validateTimeInput('-01:30')).toBe(false); // Negative
      expect(app.validateTimeInput('00:00')).toBe(false); // Zero duration
    });

    it('should save valid timer duration', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '02';
      app.timers[0].editSeconds = '30';

      app.saveEditTimer(1);

      expect(app.timers[0].duration).toBe(150); // 2:30 = 150 seconds
      expect(app.timers[0].remainingTime).toBe(150);
      expect(app.timers[0].isEditing).toBe(false);
      expect(app.timers[0].editMinutes).toBe('');
      expect(app.timers[0].editSeconds).toBe('');
      expect(app.timers[0].editError).toBe('');
    });

    it('should not save invalid timer duration', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '01';
      app.timers[0].editSeconds = '60'; // Invalid

      app.saveEditTimer(1);

      expect(app.timers[0].duration).toBe(60); // Should remain unchanged
      expect(app.timers[0].isEditing).toBe(true); // Should remain in edit mode
      expect(app.timers[0].editError).toBe(
        'Invalid time format. Use MM:SS format.'
      );
    });

    it('should handle non-existent timer gracefully', () => {
      expect(() => app.startEditTimer(999)).not.toThrow();
      expect(() => app.cancelEditTimer(999)).not.toThrow();
      expect(() => app.saveEditTimer(999)).not.toThrow();
    });
  });

  describe('timer state management during editing', () => {
    beforeEach(() => {
      app.timers = [
        {
          id: 1,
          duration: 60,
          remainingTime: 60,
          status: 'running',
          startTime: Date.now(),
          pausedTime: 0,
          isEditing: false,
          editMinutes: '',
          editSeconds: '',
          editError: '',
        },
        {
          id: 2,
          duration: 120,
          remainingTime: 120,
          status: 'ready',
          startTime: null,
          pausedTime: 0,
          isEditing: false,
          editMinutes: '',
          editSeconds: '',
          editError: '',
        },
        {
          id: 3,
          duration: 180,
          remainingTime: 0,
          status: 'completed',
          startTime: Date.now() - 200000,
          pausedTime: 0,
          isEditing: false,
          editMinutes: '',
          editSeconds: '',
          editError: '',
        },
      ];
    });

    it('should pause running timer when entering edit mode', () => {
      const originalStatus = app.timers[0].status;
      const originalStartTime = app.timers[0].startTime;
      const originalPausedTime = app.timers[0].pausedTime;

      app.startEditTimer(1);

      expect(app.timers[0].status).toBe('paused');
      expect(app.timers[0].isEditing).toBe(true);
      // With fake timers, pausedTime should remain the same since no time has passed
      expect(app.timers[0].pausedTime).toBe(originalPausedTime);
    });

    it('should preserve ready timer state when entering edit mode', () => {
      app.startEditTimer(2);

      expect(app.timers[1].status).toBe('ready');
      expect(app.timers[1].isEditing).toBe(true);
    });

    it('should preserve completed timer state when entering edit mode', () => {
      app.startEditTimer(3);

      expect(app.timers[2].status).toBe('completed');
      expect(app.timers[2].isEditing).toBe(true);
    });

    it('should restore running timer state when canceling edit', () => {
      app.startEditTimer(1);
      const pausedTime = app.timers[0].pausedTime;

      app.cancelEditTimer(1);

      expect(app.timers[0].status).toBe('running');
      expect(app.timers[0].isEditing).toBe(false);
      expect(app.timers[0].pausedTime).toBe(pausedTime);
    });

    it('should update timer duration and remaining time when saving edit', () => {
      app.startEditTimer(2);
      app.timers[1].editMinutes = '03';
      app.timers[1].editSeconds = '00';

      app.saveEditTimer(2);

      expect(app.timers[1].duration).toBe(180); // 3:00 = 180 seconds
      expect(app.timers[1].remainingTime).toBe(180);
      expect(app.timers[1].status).toBe('running'); // Should auto-start after edit
      expect(app.timers[1].isEditing).toBe(false);
    });

    it('should auto-start timer when saving edit on paused timer', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '02';
      app.timers[0].editSeconds = '00';

      app.saveEditTimer(1);

      expect(app.timers[0].duration).toBe(120); // 2:00 = 120 seconds
      expect(app.timers[0].remainingTime).toBe(120);
      expect(app.timers[0].status).toBe('running'); // Should auto-start after edit
      expect(app.timers[0].isEditing).toBe(false);
    });

    it('should auto-start timer when other timers are running', () => {
      // Set up a scenario where timer 2 is running
      app.timers[1].status = 'running';
      app.timers[1].startTime = Date.now();

      // Edit timer 1 (which is ready)
      app.startEditTimer(1);
      app.timers[0].editMinutes = '01';
      app.timers[0].editSeconds = '30';

      app.saveEditTimer(1);

      expect(app.timers[0].duration).toBe(90); // 1:30 = 90 seconds
      expect(app.timers[0].remainingTime).toBe(90);
      expect(app.timers[0].status).toBe('running'); // Should auto-start because other timer is running
      expect(app.timers[0].isEditing).toBe(false);
    });
  });

  describe('keyboard and focus management', () => {
    beforeEach(() => {
      app.timers = [
        {
          id: 1,
          duration: 60,
          remainingTime: 60,
          status: 'ready',
          startTime: null,
          pausedTime: 0,
          isEditing: false,
          editMinutes: '',
          editSeconds: '',
          editError: '',
        },
      ];
    });

    it('should have focusMinutes and focusSeconds methods for setting focus on edit inputs', () => {
      expect(typeof app.focusMinutes).toBe('function');
      expect(typeof app.focusSeconds).toBe('function');
    });

    it('should handle Enter key to save edit', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '02';
      app.timers[0].editSeconds = '30';

      // Simulate Enter key press
      app.saveEditTimer(1);

      expect(app.timers[0].duration).toBe(150); // 2:30 = 150 seconds
      expect(app.timers[0].isEditing).toBe(false);
    });

    it('should handle Escape key to cancel edit', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '02';
      app.timers[0].editSeconds = '30';

      // Simulate Escape key press
      app.cancelEditTimer(1);

      expect(app.timers[0].duration).toBe(60); // Should remain unchanged
      expect(app.timers[0].isEditing).toBe(false);
      expect(app.timers[0].editMinutes).toBe('');
      expect(app.timers[0].editSeconds).toBe('');
    });

    it('should handle blur event to save edit', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '01';
      app.timers[0].editSeconds = '30';

      // Simulate blur event
      app.saveEditTimer(1);

      expect(app.timers[0].duration).toBe(90); // 1:30 = 90 seconds
      expect(app.timers[0].isEditing).toBe(false);
    });

    it('should have handleTabKey method for tab navigation', () => {
      expect(typeof app.handleTabKey).toBe('function');
    });

    it('should have handleBlur method for blur events', () => {
      expect(typeof app.handleBlur).toBe('function');
    });

    it('should handle tab key to switch between minutes and seconds', () => {
      app.startEditTimer(1);

      // Mock event object
      const mockEvent = {
        preventDefault: vi.fn(),
      };

      // Test tab from minutes to seconds
      app.handleTabKey(1, 'minutes', mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      // Test tab from seconds to minutes
      app.handleTabKey(1, 'seconds', mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle blur event to save edit when not moving to other input', () => {
      app.startEditTimer(1);
      app.timers[0].editMinutes = '02';
      app.timers[0].editSeconds = '15';

      // Mock blur event that's not moving to other input
      const mockEvent = {
        relatedTarget: null,
      };

      app.handleBlur(1, 'minutes', mockEvent);

      // Should save the edit after timeout
      setTimeout(() => {
        expect(app.timers[0].duration).toBe(135); // 2:15 = 135 seconds
        expect(app.timers[0].isEditing).toBe(false);
      }, 150);
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

    it('should initialize with audio testing disabled and metronome enabled', () => {
      expect(app.settings.audioTestingEnabled).toBe(false);
      expect(app.settings.metronomeEnabled).toBe(true);
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

    it('should not play immediate metronome click when starting timers (metronome handles its own timing)', async () => {
      const playMetronomeClickSpy = vi.spyOn(
        audioManager,
        'playMetronomeClick'
      );

      // Enable metronome
      app.metronomeActive = true;
      app.settings.metronomeEnabled = true;

      // Add a ready timer
      app.timers = [{ id: 1, status: 'ready', duration: 60 }];

      // Start the timer
      await app.startAllTimers();

      // Should not play immediate click - metronome handles its own synchronized timing
      expect(playMetronomeClickSpy).not.toHaveBeenCalled();
    });

    it('should not play immediate metronome click when metronome is not active', async () => {
      const playMetronomeClickSpy = vi.spyOn(
        audioManager,
        'playMetronomeClick'
      );

      // Metronome is not active
      app.metronomeActive = false;
      app.settings.metronomeEnabled = false;

      // Add a ready timer
      app.timers = [{ id: 1, status: 'ready', duration: 60 }];

      // Start the timer
      await app.startAllTimers();

      expect(playMetronomeClickSpy).not.toHaveBeenCalled();
    });

    it('should not play immediate metronome click when toggling individual timer (metronome handles its own timing)', async () => {
      const playMetronomeClickSpy = vi
        .spyOn(audioManager, 'playMetronomeClick')
        .mockResolvedValue();

      // Enable metronome
      app.metronomeActive = true;
      app.settings.metronomeEnabled = true;

      // Add a ready timer
      const timer = { id: 1, status: 'ready', duration: 60 };
      app.timers = [timer];

      // Toggle the timer to start it
      await app.toggleTimer(1);

      // Should not play immediate click - metronome handles its own synchronized timing
      expect(playMetronomeClickSpy).not.toHaveBeenCalled();
    });
  });
});
