# Task 2: Add Audio Testing State to Main Component

## Objective

Add state management for audio testing feature in the main Alpine.js component.

## Acceptance Criteria

- Component has `audioTestingEnabled` setting in settings object
- Component has `audioTestingIntervalId` and `audioTestingActive` state properties
- Component has methods to start/stop audio testing
- Audio testing state is properly initialized and cleaned up

## Implementation Steps

### Step 1: Add Audio Testing State Properties

```javascript
// In multiTimerApp() function, update the state object:
return {
  // State
  timers: [],
  newTimer: {
    minutes: 0,
    seconds: 0,
  },
  formError: '',
  settings: {
    audioEnabled: true,
    flashEnabled: true,
    audioTestingEnabled: false, // New property
  },
  intervalId: null,
  isInitialized: false,
  // New audio testing state
  audioTestingActive: false,
  audioTestingError: '',
};
```

### Step 2: Add Audio Testing Methods

```javascript
// Add these methods to the component:

/**
 * Start audio testing
 */
async startAudioTesting() {
  try {
    this.audioTestingError = '';
    await audioManager.startClickTesting();
    this.audioTestingActive = true;
    console.log('Audio testing started');
  } catch (error) {
    this.audioTestingError = `Failed to start audio testing: ${error.message}`;
    console.error('Audio testing failed:', error);
  }
},

/**
 * Stop audio testing
 */
stopAudioTesting() {
  audioManager.stopClickTesting();
  this.audioTestingActive = false;
  this.audioTestingError = '';
  console.log('Audio testing stopped');
},

/**
 * Toggle audio testing based on setting
 */
async toggleAudioTesting() {
  if (this.settings.audioTestingEnabled) {
    await this.startAudioTesting();
  } else {
    this.stopAudioTesting();
  }
},
```

### Step 3: Add Watcher for Settings Change

```javascript
// Add this to the component to watch for settings changes:
async init() {
  console.log('Initializing Interview Timer App');

  // Set up interval for timer updates
  this.startTimerInterval();

  // Watch for audio testing setting changes
  this.$watch('settings.audioTestingEnabled', (newValue) => {
    this.toggleAudioTesting();
  });

  this.isInitialized = true;
  console.log('Interview Timer App initialized successfully');
},
```

### Step 4: Update Cleanup Method

```javascript
// Update the destroy method:
destroy() {
  this.stopTimerInterval();
  this.stopAudioTesting(); // Stop audio testing on cleanup
  audioManager.cleanup();
},
```

## Test Strategy

- Unit tests for audio testing state management methods
- Integration tests for audio testing lifecycle
- Verify state updates trigger UI changes correctly
- Test watcher functionality for settings changes
- Test proper cleanup on component destruction

## Files to Modify

- `src/main.js` - Add state properties and methods to multiTimerApp component
- `src/main.test.js` - Add unit tests for new functionality
