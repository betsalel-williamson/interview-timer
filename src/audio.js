/**
 * Audio Manager for Multi-Timer Application
 * Handles Web Audio API for timer completion alerts
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    this.isEnabled = true;
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
   * Play a 2-second alert sound when timer completes
   */
  async playAlert() {
    if (!this.isEnabled || !this.isInitialized) return;

    try {
      // Ensure context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create oscillator for the alert sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator (pleasant tone)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        1000,
        this.audioContext.currentTime + 0.5
      );
      oscillator.frequency.setValueAtTime(
        1200,
        this.audioContext.currentTime + 1.0
      );
      oscillator.frequency.setValueAtTime(
        800,
        this.audioContext.currentTime + 1.5
      );

      // Configure gain (volume envelope)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.3,
        this.audioContext.currentTime + 0.1
      );
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + 1.9);
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
   * Clean up audio resources
   */
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// Export for use in main application
export default AudioManager;
