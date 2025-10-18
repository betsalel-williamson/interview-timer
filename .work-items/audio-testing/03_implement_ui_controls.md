# Task 3: Implement Audio Testing UI Controls

## Objective

Add checkbox and visual indicator for audio testing in the settings section.

## Acceptance Criteria

- Settings section has checkbox for "Enable Audio Testing"
- Visual indicator shows when audio testing is active
- Error messages display if audio testing fails to start
- UI updates reflect audio testing state changes

## Implementation Steps

### Step 1: Add Audio Testing Checkbox to Settings

```html
<!-- In index.html, update the settings section in footer: -->
<footer>
  <div class="settings">
    <label>
      <input type="checkbox" x-model="settings.audioEnabled" />
      Enable Audio Alerts
    </label>
    <label>
      <input type="checkbox" x-model="settings.flashEnabled" />
      Enable Visual Flash
    </label>
    <label>
      <input type="checkbox" x-model="settings.audioTestingEnabled" />
      Enable Audio Testing
    </label>
  </div>
</footer>
```

### Step 2: Add Visual Indicator for Testing Status

```html
<!-- Add visual indicator in the settings section: -->
<footer>
  <div class="settings">
    <label>
      <input type="checkbox" x-model="settings.audioEnabled" />
      Enable Audio Alerts
    </label>
    <label>
      <input type="checkbox" x-model="settings.flashEnabled" />
      Enable Visual Flash
    </label>
    <label>
      <input type="checkbox" x-model="settings.audioTestingEnabled" />
      Enable Audio Testing
    </label>

    <!-- Audio testing status indicator -->
    <div x-show="audioTestingActive" class="audio-testing-status">
      <span class="status-indicator">🔊</span>
      <span>Audio testing active - listening for clicks every second</span>
    </div>
  </div>
</footer>
```

### Step 3: Add Error Message Display

```html
<!-- Add error message display: -->
<footer>
  <div class="settings">
    <label>
      <input type="checkbox" x-model="settings.audioEnabled" />
      Enable Audio Alerts
    </label>
    <label>
      <input type="checkbox" x-model="settings.flashEnabled" />
      Enable Visual Flash
    </label>
    <label>
      <input type="checkbox" x-model="settings.audioTestingEnabled" />
      Enable Audio Testing
    </label>

    <!-- Audio testing status indicator -->
    <div x-show="audioTestingActive" class="audio-testing-status">
      <span class="status-indicator">🔊</span>
      <span>Audio testing active - listening for clicks every second</span>
    </div>

    <!-- Error message display -->
    <div x-show="audioTestingError" class="error-message">
      <span x-text="audioTestingError"></span>
    </div>
  </div>
</footer>
```

### Step 4: Add CSS Styling for New Elements

```css
/* Add to src/style.css */

.audio-testing-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: rgb(34, 197, 94);
}

.status-indicator {
  font-size: 1rem;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.settings .error-message {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgb(239, 68, 68);
  padding: 0.5rem;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
```

## Test Strategy

- UI tests for checkbox interaction
- Visual regression tests for settings section
- Error handling tests for audio testing failures
- Test that UI updates reflect state changes correctly
- Test visual indicator shows/hides appropriately

## Files to Modify

- `index.html` - Add checkbox and status indicators to settings section
- `src/style.css` - Add styling for new UI elements
- `src/integration.test.js` - Add integration tests for UI functionality
