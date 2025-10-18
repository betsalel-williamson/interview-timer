/**
 * Audio Manager for Multi-Timer Application
 * Handles Web Audio API for timer completion alerts
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    this.isEnabled = true;
    this.clickTestingIntervalId = null;
    this.metronomeIntervalId = null;
  }

  /**
   * Initialize the audio context
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Resume context if it's suspended (common on mobile)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Play a distinct 2-second alert sound when timer completes
   */
  async playAlert() {
    if (!this.isEnabled || !this.isInitialized) return;

    try {
      // Ensure context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create oscillator for the distinct timer completion alert
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator (distinct ascending tone pattern)
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        800,
        this.audioContext.currentTime + 0.4
      );
      oscillator.frequency.setValueAtTime(
        1000,
        this.audioContext.currentTime + 0.8
      );
      oscillator.frequency.setValueAtTime(
        1200,
        this.audioContext.currentTime + 1.2
      );
      oscillator.frequency.setValueAtTime(
        1000,
        this.audioContext.currentTime + 1.6
      );
      oscillator.frequency.setValueAtTime(
        600,
        this.audioContext.currentTime + 2.0
      );

      // Configure gain (volume envelope with emphasis)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.4,
        this.audioContext.currentTime + 0.1
      );
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime + 1.9);
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 2.0
      );

      // Start and stop the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 2.0);
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }

  /**
   * Enable or disable audio alerts
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Check if audio is available and enabled
   */
  isAvailable() {
    return this.isEnabled && this.isInitialized;
  }

  /**
   * Play a subtle metronome-like click sound for testing purposes
   */
  async playClickSound() {
    if (!this.isEnabled || !this.isInitialized) return;

    try {
      // Ensure context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create oscillator for subtle metronome click
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator (subtle metronome click at 800Hz)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine'; // Softer, more subtle sound

      // Configure gain (very short, subtle duration)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.05,
        this.audioContext.currentTime + 0.005
      ); // Very quick attack
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.03
      ); // Quick decay

      // Start and stop the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.03);
    } catch (error) {
      console.error('Failed to play click sound:', error);
    }
  }

  /**
   * Start periodic click sounds for testing
   */
  async startClickTesting() {
    if (this.clickTestingIntervalId) return; // Already running

    // Ensure audio is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isEnabled) {
      throw new Error('Audio is disabled');
    }

    // Play initial click
    await this.playClickSound();

    // Set up interval for subsequent clicks
    this.clickTestingIntervalId = setInterval(async () => {
      await this.playClickSound();
    }, 1000);
  }

  /**
   * Stop periodic click sounds
   */
  stopClickTesting() {
    if (this.clickTestingIntervalId) {
      clearInterval(this.clickTestingIntervalId);
      this.clickTestingIntervalId = null;
    }
  }

  /**
   * Play a subtle metronome click sound
   */
  async playMetronomeClick() {
    if (!this.isEnabled || !this.isInitialized) return;

    try {
      // Ensure context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create oscillator for subtle metronome click
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator (subtle metronome click at 800Hz)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine'; // Softer, more subtle sound

      // Configure gain (very short, subtle duration)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.05,
        this.audioContext.currentTime + 0.005
      ); // Very quick attack
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.03
      ); // Quick decay

      // Start and stop the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.03);
    } catch (error) {
      console.error('Failed to play metronome click:', error);
    }
  }

  /**
   * Start metronome (subtle click every second)
   * @param {Function} hasActiveTimers - Function that returns true if timers are running
   */
  async startMetronome(hasActiveTimers) {
    if (this.metronomeIntervalId) return; // Already running

    // Ensure audio is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isEnabled) {
      throw new Error('Audio is disabled');
    }

    // Store the function to check for active timers
    this.hasActiveTimers = hasActiveTimers;

    // Play initial click if timers are active
    if (this.hasActiveTimers && this.hasActiveTimers()) {
      await this.playMetronomeClick();
    }

    // Set up interval for subsequent clicks
    this.metronomeIntervalId = setInterval(async () => {
      // Only play metronome click if timers are active
      if (this.hasActiveTimers && this.hasActiveTimers()) {
        await this.playMetronomeClick();
      }
    }, 1000);
  }

  /**
   * Stop metronome
   */
  stopMetronome() {
    if (this.metronomeIntervalId) {
      clearInterval(this.metronomeIntervalId);
      this.metronomeIntervalId = null;
    }
  }

  /**
   * Clean up audio resources
   */
  cleanup() {
    // Stop click testing if running
    this.stopClickTesting();
    // Stop metronome if running
    this.stopMetronome();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// Export for use in main application
export default AudioManager;
