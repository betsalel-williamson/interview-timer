# Design: Configurable Audio Testing Visibility

## Objective

Implement a feature flag system to control the visibility of audio testing controls in the settings section, hiding them by default while maintaining full functionality when enabled.

## Technical Design

This design introduces a configuration-based approach to control the visibility of audio testing UI elements. The solution uses a simple boolean flag that can be set at build time or runtime to show/hide the audio testing controls.

### Architecture Alignment

This design aligns with the existing architecture by:

- Maintaining the current component structure and state management
- Preserving all existing audio testing functionality
- Following the established pattern of conditional UI rendering using Alpine.js
- Not introducing new dependencies or architectural changes

### Key Changes

#### 1. Configuration System

**New Configuration Property:**

- Add `showAudioTestingControls` boolean flag to application configuration
- Default value: `false` (audio testing controls hidden)
- Can be overridden via environment variable or build configuration

**Configuration Location:**

- Add to main application configuration object in `src/main.js`
- Accessible throughout the component lifecycle
- Can be modified at build time or runtime

#### 2. UI Component Modifications

**Conditional Rendering:**

- Wrap audio testing checkbox and related UI elements in conditional rendering
- Use Alpine.js `x-show` directive with configuration flag
- Maintain existing functionality when controls are visible

**Settings Section Structure:**

```html
<footer>
  <div class="settings" data-testid="audio-settings">
    <label>
      <input type="checkbox" x-model="settings.audioEnabled" />
      Enable Audio Alerts
    </label>
    <label>
      <input type="checkbox" x-model="settings.flashEnabled" />
      Enable Visual Flash
    </label>

    <!-- Audio Testing Controls - Conditionally Rendered -->
    <template x-if="config.showAudioTestingControls">
      <label>
        <input
          type="checkbox"
          data-testid="audio-testing-checkbox"
          x-model="settings.audioTestingEnabled"
          x-on:change="settings.audioTestingEnabled ? startAudioTesting() : stopAudioTesting()"
        />
        Enable Audio Testing
        <span
          x-show="audioTestingActive"
          class="audio-testing-indicator"
          data-testid="audio-testing-indicator"
          title="Audio testing is active - you should hear click sounds every second"
        >
          🔊 Testing
        </span>
      </label>
    </template>
  </div>
</footer>
```

#### 3. Component State Management

**Configuration Integration:**

- Add configuration object to main component state
- Initialize configuration with default values
- Provide method to update configuration at runtime if needed

**State Structure:**

```javascript
return {
  // Existing state...
  config: {
    showAudioTestingControls: false, // Default: hidden
  },
  // Rest of existing state...
};
```

#### 4. Build-Time Configuration

**Environment Variable Support:**

- Support `VITE_SHOW_AUDIO_TESTING_CONTROLS` environment variable
- Allow build-time configuration override
- Fallback to default value if not specified

**Configuration Loading:**

```javascript
// In main.js initialization
const config = {
  showAudioTestingControls:
    import.meta.env.VITE_SHOW_AUDIO_TESTING_CONTROLS === 'true' || false,
};
```

## Alternatives Considered

### Alternative 1: User Preference Setting

**Approach:** Add a user preference to show/hide audio testing controls
**Rejected Because:** Adds complexity to user interface and doesn't address the core need for a clean default experience

### Alternative 2: Separate Settings Page

**Approach:** Move audio testing controls to a separate advanced settings page
**Rejected Because:** Over-engineers the solution for a simple visibility requirement

### Alternative 3: CSS-Only Hiding

**Approach:** Use CSS to hide elements by default
**Rejected Because:** Doesn't provide programmatic control and makes testing more difficult

## Out of Scope

- **User Interface for Configuration:** No UI controls to change the configuration flag
- **Persistent User Preferences:** Configuration is not saved to localStorage
- **Multiple Configuration Options:** Only audio testing visibility is configurable
- **Runtime Configuration Changes:** Configuration cannot be changed after application load
- **Advanced Feature Flag System:** No complex feature flag infrastructure

## Implementation Considerations

### Testing Strategy

- **Unit Tests:** Test configuration loading and default values
- **Integration Tests:** Verify UI element visibility based on configuration
- **E2E Tests:** Test complete user flows with both configurations
- **Visual Regression Tests:** Ensure UI looks correct with controls hidden

### Backward Compatibility

- **Existing Functionality:** All audio testing functionality remains unchanged when enabled
- **API Compatibility:** No changes to existing component methods or state
- **Test Compatibility:** Existing tests continue to work with appropriate configuration

### Performance Impact

- **Minimal Overhead:** Simple boolean check for conditional rendering
- **No Runtime Cost:** Configuration loaded once at initialization
- **Bundle Size:** No additional dependencies or significant code changes
