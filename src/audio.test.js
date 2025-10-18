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

    it('should set oscillator frequency at different times', async () => {
      await audioManager.playAlert();

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        800,
        0
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        1000,
        0.5
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        1200,
        1.0
      );
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        800,
        1.5
      );
    });

    it('should configure gain envelope for 2-second duration', async () => {
      await audioManager.playAlert();

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
        0.3,
        0.1
      );
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 1.9);
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

  describe('cleanup', () => {
    it('should close audio context and reset state', async () => {
      await audioManager.initialize();

      audioManager.cleanup();

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
