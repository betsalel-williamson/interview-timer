import { describe, it, expect, beforeEach, vi } from 'vitest';
import AudioManager from './audio.js';

describe('AudioManager', () => {
  let audioManager;
  let mockAudioContext;
  let mockOscillator;
  let mockGainNode;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create fresh audio manager
    audioManager = new AudioManager();

    // Mock oscillator
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
      },
    };

    // Mock gain node
    mockGainNode = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    };

    // Mock audio context
    mockAudioContext = {
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGainNode),
      destination: {},
      currentTime: 0,
      state: 'running',
      resume: vi.fn().mockResolvedValue(),
      close: vi.fn(),
    };

    // Replace global AudioContext
    global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
    global.webkitAudioContext = global.AudioContext;
  });

  describe('constructor', () => {
    it('should initialize with correct default state', () => {
      expect(audioManager.audioContext).toBeNull();
      expect(audioManager.isInitialized).toBe(false);
      expect(audioManager.isEnabled).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should initialize audio context successfully', async () => {
      await audioManager.initialize();

      expect(mockAudioContext).toBeDefined();
      expect(audioManager.isInitialized).toBe(true);
      expect(audioManager.isEnabled).toBe(true);
    });

    it('should resume suspended audio context', async () => {
      mockAudioContext.state = 'suspended';

      await audioManager.initialize();

      expect(mockAudioContext.resume).toHaveBeenCalled();
      expect(audioManager.isInitialized).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      global.AudioContext = vi.fn().mockImplementation(() => {
        throw new Error('Audio context creation failed');
      });

      await audioManager.initialize();

      expect(audioManager.isInitialized).toBe(false);
      expect(audioManager.isEnabled).toBe(false);
    });

    it('should not reinitialize if already initialized', async () => {
      await audioManager.initialize();
      const firstContext = audioManager.audioContext;

      await audioManager.initialize();

      expect(audioManager.audioContext).toBe(firstContext);
    });
  });

  describe('playAlert', () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    it('should create and configure oscillator correctly', async () => {
      await audioManager.playAlert();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );
    });

    it('should set oscillator frequency at different times for distinct alert pattern', async () => {
      await audioManager.playAlert();

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        600,
        0
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        800,
        0.4
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        1000,
        0.8
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        1200,
        1.2
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        1000,
        1.6
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        600,
        2.0
      );
    });

    it('should configure gain envelope for 2-second duration with emphasis', async () => {
      await audioManager.playAlert();

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.4,
        0.1
      );
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.4, 1.9);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0,
        2.0
      );
    });

    it('should start and stop oscillator with correct timing', async () => {
      await audioManager.playAlert();

      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(2.0);
    });

    it('should resume suspended context before playing', async () => {
      mockAudioContext.state = 'suspended';

      await audioManager.playAlert();

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should not play if audio is disabled', async () => {
      audioManager.setEnabled(false);

      await audioManager.playAlert();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should not play if not initialized', async () => {
      audioManager.isInitialized = false;

      await audioManager.playAlert();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Oscillator creation failed');
      });

      // Should not throw
      await expect(audioManager.playAlert()).resolves.toBeUndefined();
    });
  });

  describe('setEnabled', () => {
    it('should enable audio when set to true', () => {
      audioManager.setEnabled(true);
      expect(audioManager.isEnabled).toBe(true);
    });

    it('should disable audio when set to false', () => {
      audioManager.setEnabled(false);
      expect(audioManager.isEnabled).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when enabled and initialized', async () => {
      await audioManager.initialize();
      expect(audioManager.isAvailable()).toBe(true);
    });

    it('should return false when disabled', async () => {
      await audioManager.initialize();
      audioManager.setEnabled(false);
      expect(audioManager.isAvailable()).toBe(false);
    });

    it('should return false when not initialized', () => {
      expect(audioManager.isAvailable()).toBe(false);
    });
  });

  describe('playClickSound', () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    it('should create and configure oscillator for click sound', async () => {
      await audioManager.playClickSound();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );
    });

    it('should set oscillator frequency to 800Hz and type to sine', async () => {
      await audioManager.playClickSound();

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        800,
        0
      );
      expect(mockOscillator.type).toBe('sine');
    });

    it('should configure gain envelope for subtle metronome click duration', async () => {
      await audioManager.playClickSound();

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        0.005
      );
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0,
        0.03
      );
    });

    it('should start and stop oscillator with correct timing', async () => {
      await audioManager.playClickSound();

      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.03);
    });

    it('should not play if audio is disabled', async () => {
      audioManager.setEnabled(false);

      await audioManager.playClickSound();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should not play if not initialized', async () => {
      audioManager.isInitialized = false;

      await audioManager.playClickSound();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Oscillator creation failed');
      });

      // Should not throw
      await expect(audioManager.playClickSound()).resolves.toBeUndefined();
    });
  });

  describe('startClickTesting', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should initialize audio context if not already initialized', async () => {
      audioManager.isInitialized = false;
      const initializeSpy = vi.spyOn(audioManager, 'initialize');

      await audioManager.startClickTesting();

      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should play initial click sound', async () => {
      const playClickSoundSpy = vi.spyOn(audioManager, 'playClickSound');

      await audioManager.startClickTesting();

      expect(playClickSoundSpy).toHaveBeenCalled();
    });

    it('should set up interval for subsequent clicks', async () => {
      await audioManager.startClickTesting();

      expect(audioManager.clickTestingIntervalId).toBeDefined();
    });

    it('should play click sound every second', async () => {
      const playClickSoundSpy = vi.spyOn(audioManager, 'playClickSound');

      await audioManager.startClickTesting();
      playClickSoundSpy.mockClear(); // Clear initial call

      vi.advanceTimersByTime(1000);
      expect(playClickSoundSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(playClickSoundSpy).toHaveBeenCalledTimes(2);
    });

    it('should not start if already running', async () => {
      await audioManager.startClickTesting();
      const firstIntervalId = audioManager.clickTestingIntervalId;

      await audioManager.startClickTesting();

      expect(audioManager.clickTestingIntervalId).toBe(firstIntervalId);
    });

    it('should throw error if audio is disabled', async () => {
      audioManager.setEnabled(false);

      await expect(audioManager.startClickTesting()).rejects.toThrow(
        'Audio is disabled'
      );
    });
  });

  describe('stopClickTesting', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clear the click testing interval', async () => {
      await audioManager.startClickTesting();
      const intervalId = audioManager.clickTestingIntervalId;

      audioManager.stopClickTesting();

      expect(audioManager.clickTestingIntervalId).toBeNull();
    });

    it('should handle stopping when not running', () => {
      // Should not throw
      expect(() => audioManager.stopClickTesting()).not.toThrow();
    });
  });

  describe('playMetronomeClick', () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    it('should create and configure oscillator for metronome click', async () => {
      await audioManager.playMetronomeClick();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );
    });

    it('should set oscillator frequency to 800Hz and type to sine', async () => {
      await audioManager.playMetronomeClick();

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        800,
        0
      );
      expect(mockOscillator.type).toBe('sine');
    });

    it('should configure gain envelope for subtle metronome click duration', async () => {
      await audioManager.playMetronomeClick();

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.05,
        0.005
      );
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0,
        0.03
      );
    });

    it('should start and stop oscillator with correct timing', async () => {
      await audioManager.playMetronomeClick();

      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.03);
    });

    it('should not play if audio is disabled', async () => {
      audioManager.setEnabled(false);

      await audioManager.playMetronomeClick();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should not play if not initialized', async () => {
      audioManager.isInitialized = false;

      await audioManager.playMetronomeClick();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Oscillator creation failed');
      });

      // Should not throw
      await expect(audioManager.playMetronomeClick()).resolves.toBeUndefined();
    });
  });

  describe('startMetronome', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should initialize audio context if not already initialized', async () => {
      audioManager.isInitialized = false;
      const initializeSpy = vi.spyOn(audioManager, 'initialize');

      await audioManager.startMetronome();

      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should play initial metronome click when timers are active', async () => {
      const playMetronomeClickSpy = vi.spyOn(
        audioManager,
        'playMetronomeClick'
      );
      const hasActiveTimers = vi.fn().mockReturnValue(true);

      await audioManager.startMetronome(hasActiveTimers);

      expect(playMetronomeClickSpy).toHaveBeenCalled();
    });

    it('should not play initial metronome click when no timers are active', async () => {
      const playMetronomeClickSpy = vi.spyOn(
        audioManager,
        'playMetronomeClick'
      );
      const hasActiveTimers = vi.fn().mockReturnValue(false);

      await audioManager.startMetronome(hasActiveTimers);

      expect(playMetronomeClickSpy).not.toHaveBeenCalled();
    });

    it('should set up interval for subsequent metronome clicks', async () => {
      const hasActiveTimers = vi.fn().mockReturnValue(true);
      await audioManager.startMetronome(hasActiveTimers);

      expect(audioManager.metronomeIntervalId).toBeDefined();
    });

    it('should play metronome click every second when timers are active', async () => {
      const playMetronomeClickSpy = vi.spyOn(
        audioManager,
        'playMetronomeClick'
      );
      const hasActiveTimers = vi.fn().mockReturnValue(true);

      await audioManager.startMetronome(hasActiveTimers);
      playMetronomeClickSpy.mockClear(); // Clear initial call

      vi.advanceTimersByTime(1000);
      expect(playMetronomeClickSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(playMetronomeClickSpy).toHaveBeenCalledTimes(2);
    });

    it('should not play metronome click when timers are not active', async () => {
      const playMetronomeClickSpy = vi.spyOn(
        audioManager,
        'playMetronomeClick'
      );
      const hasActiveTimers = vi.fn().mockReturnValue(false);

      await audioManager.startMetronome(hasActiveTimers);
      playMetronomeClickSpy.mockClear(); // Clear initial call

      vi.advanceTimersByTime(1000);
      expect(playMetronomeClickSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(playMetronomeClickSpy).not.toHaveBeenCalled();
    });

    it('should not start if already running', async () => {
      const hasActiveTimers = vi.fn().mockReturnValue(true);
      await audioManager.startMetronome(hasActiveTimers);
      const firstIntervalId = audioManager.metronomeIntervalId;

      await audioManager.startMetronome(hasActiveTimers);

      expect(audioManager.metronomeIntervalId).toBe(firstIntervalId);
    });

    it('should throw error if audio is disabled', async () => {
      audioManager.setEnabled(false);
      const hasActiveTimers = vi.fn().mockReturnValue(true);

      await expect(
        audioManager.startMetronome(hasActiveTimers)
      ).rejects.toThrow('Audio is disabled');
    });
  });

  describe('stopMetronome', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clear the metronome interval', async () => {
      const hasActiveTimers = vi.fn().mockReturnValue(true);
      await audioManager.startMetronome(hasActiveTimers);
      const intervalId = audioManager.metronomeIntervalId;

      audioManager.stopMetronome();

      expect(audioManager.metronomeIntervalId).toBeNull();
    });

    it('should handle stopping when not running', () => {
      // Should not throw
      expect(() => audioManager.stopMetronome()).not.toThrow();
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should stop click testing, metronome and close audio context', async () => {
      const hasActiveTimers = vi.fn().mockReturnValue(true);
      await audioManager.startClickTesting();
      await audioManager.startMetronome(hasActiveTimers);
      const stopClickTestingSpy = vi.spyOn(audioManager, 'stopClickTesting');
      const stopMetronomeSpy = vi.spyOn(audioManager, 'stopMetronome');

      audioManager.cleanup();

      expect(stopClickTestingSpy).toHaveBeenCalled();
      expect(stopMetronomeSpy).toHaveBeenCalled();
      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(audioManager.audioContext).toBeNull();
      expect(audioManager.isInitialized).toBe(false);
    });

    it('should handle cleanup when not initialized', () => {
      // Should not throw
      expect(() => audioManager.cleanup()).not.toThrow();
    });
  });
});
