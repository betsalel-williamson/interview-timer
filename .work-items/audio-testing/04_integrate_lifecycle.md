# Task 4: Integrate Audio Testing with Component Lifecycle

## Objective

Connect audio testing functionality with the main component's initialization and cleanup.

## Acceptance Criteria

- Audio testing starts when checkbox is enabled
- Audio testing stops when checkbox is disabled
- Audio testing is properly cleaned up when component is destroyed
- Audio context is initialized when testing starts if needed

## Implementation Steps

### Step 1: Verify Watcher Integration

Ensure the watcher from Task 2 is properly implemented:

```javascript
// In the init() method:
async init() {
  console.log('Initializing Multi-Timer App');

  // Set up interval for timer updates
  this.startTimerInterval();

  // Watch for audio testing setting changes
  this.$watch('settings.audioTestingEnabled', (newValue) => {
    this.toggleAudioTesting();
  });

  this.isInitialized = true;
  console.log('Multi-Timer App initialized successfully');
},
```

### Step 2: Add Initialization on User Interaction

Update the `initializeAudio` method to handle audio testing:

```javascript
// Update the existing initializeAudio method:
async initializeAudio() {
  if (!audioManager.isInitialized) {
    await audioManager.initialize();
    console.log('Audio initialized on user interaction');
  }

  // If audio testing is enabled, start it after initialization
  if (this.settings.audioTestingEnabled && !this.audioTestingActive) {
    await this.startAudioTesting();
  }
},
```

### Step 3: Update Timer Interaction Methods

Ensure audio testing works with existing timer functionality:

```javascript
// Update addTimer method to handle audio testing:
async addTimer() {
  if (!this.isValidTimer()) {
    this.formError =
      'Please enter valid minutes and seconds (at least 1 second total)';
    return;
  }

  // Initialize audio on first user interaction
  await this.initializeAudio();

  const timer = createTimer(this.newTimer.minutes, this.newTimer.seconds);
  this.timers.push(timer);

  // Clear form
  this.newTimer.minutes = 0;
  this.newTimer.seconds = 0;
  this.formError = '';

  // Start interval if not already running
  if (!this.intervalId) {
    this.startTimerInterval();
  }

  console.log(`Added timer: ${this.formatTime(timer.duration)}`);
},
```

### Step 4: Add Error Recovery

Add method to handle audio testing errors gracefully:

```javascript
// Add error recovery method:
async retryAudioTesting() {
  this.audioTestingError = '';
  try {
    await this.startAudioTesting();
  } catch (error) {
    this.audioTestingError = `Retry failed: ${error.message}`;
  }
},
```

### Step 5: Add UI for Error Recovery

Update the error message display to include retry option:

```html
<!-- Update error message in index.html: -->
<div x-show="audioTestingError" class="error-message">
  <span x-text="audioTestingError"></span>
  <button
    x-on:click="retryAudioTesting()"
    class="retry-btn"
    x-show="audioTestingError"
  >
    Retry
  </button>
</div>
```

### Step 6: Add Retry Button Styling

```css
/* Add to src/style.css */
.retry-btn {
  background-color: rgb(239, 68, 68);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: rgb(220, 38, 38);
}
```

## Test Strategy

- Integration tests for complete audio testing workflow
- Lifecycle tests for proper cleanup
- Error handling tests for audio context initialization failures
- Test that audio testing integrates properly with existing timer functionality
- Test error recovery functionality

## Files to Modify

- `src/main.js` - Update lifecycle methods and add error recovery
- `index.html` - Add retry button to error message
- `src/style.css` - Add retry button styling
- `src/integration.test.js` - Add comprehensive integration tests

## Verification Checklist

- [ ] Audio testing starts when checkbox is enabled
- [ ] Audio testing stops when checkbox is disabled
- [ ] Audio testing is cleaned up on component destruction
- [ ] Audio context initializes properly when testing starts
- [ ] Error messages display correctly
- [ ] Retry functionality works
- [ ] Audio testing doesn't interfere with timer functionality
- [ ] All existing functionality remains intact
