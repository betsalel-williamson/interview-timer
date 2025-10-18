# Task 1: Extend AudioManager with Click Sound Capability

## Objective

Add methods to AudioManager for generating click sounds and managing click testing intervals.

## Acceptance Criteria

- AudioManager has a `playClickSound()` method that generates a short click sound
- AudioManager has `startClickTesting()` and `stopClickTesting()` methods
- Click sounds are generated using Web Audio API oscillator
- Click testing interval is properly managed and cleaned up
- All methods handle audio context initialization gracefully

## Implementation Steps

### Step 1: Add Click Sound Generation Method

```javascript
/**
 * Play a short click sound for testing purposes
 */
async playClickSound() {
  if (!this.isEnabled || !this.isInitialized) return;

  try {
    // Ensure context is running
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Create oscillator for click sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configure oscillator (short click at 1000Hz)
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    oscillator.type = 'square'; // Sharp click sound

    // Configure gain (very short duration)
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);

    // Start and stop the sound
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  } catch (error) {
    console.error('Failed to play click sound:', error);
  }
}
```

### Step 2: Add Click Testing Interval Management

```javascript
constructor() {
  this.audioContext = null;
  this.isInitialized = false;
  this.isEnabled = true;
  this.clickTestingIntervalId = null; // New property
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
```

### Step 3: Update Cleanup Method

```javascript
cleanup() {
  // Stop click testing if running
  this.stopClickTesting();

  if (this.audioContext) {
    this.audioContext.close();
    this.audioContext = null;
  }
  this.isInitialized = false;
}
```

## Test Strategy

- Unit tests for `playClickSound()` method
- Unit tests for `startClickTesting()` and `stopClickTesting()` methods
- Integration tests for click testing interval management
- Verify proper cleanup of intervals and audio resources
- Test error handling for audio context initialization failures

## Files to Modify

- `src/audio.js` - Add new methods to AudioManager class
- `src/audio.test.js` - Add unit tests for new functionality
