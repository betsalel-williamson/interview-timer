/**
 * Test setup for Multi-Timer Application
 * Configures the testing environment for Alpine.js and Web APIs
 */

import { vi } from 'vitest';

// Mock Web Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
    },
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(),
  close: vi.fn().mockResolvedValue(),
}));

global.webkitAudioContext = global.AudioContext;

// Mock DOM methods that might not be available in jsdom
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// No need to mock the audio manager - use the actual implementation
// The Web Audio API is already mocked above, which is sufficient
