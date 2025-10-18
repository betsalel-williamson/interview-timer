# Design: Audio System Testing and Metronome Features

## Objective

Add checkbox-controlled audio testing and metronome features that play click sounds every second to allow users to verify the audio system is working and optionally maintain consistent pacing during their interview practice sessions.

## Technical Design

This feature extends the existing audio system by adding two separate periodic click sound generators that can be toggled on/off independently. The design leverages the existing AudioManager class and integrates with the current Alpine.js component structure.

### Key Components

1. **AudioManager Extension**: Add methods for both audio testing and metronome click sounds
2. **Dual State Management**: Add separate state management for audio testing and metronome features
3. **UI Integration**: Add separate checkboxes and visual indicators in the settings section
4. **Interval Management**: Use separate intervals for each feature that don't interfere with timer updates
5. **Sound Differentiation**: Ensure metronome clicks are subtle and distinct from timer completion alerts

### Architecture Alignment

This design follows the existing architecture patterns:

- Extends the AudioManager class without breaking existing functionality
- Uses the same Alpine.js reactive state management
- Follows the existing settings pattern for user preferences
- Maintains separation of concerns between audio logic and UI logic

## Key Changes

### 3.1. API Contracts

**Audio Testing Methods:**

- `AudioManager.playClickSound()` - Plays a short click sound for testing
- `AudioManager.startClickTesting()` - Starts periodic click sounds every 1000ms
- `AudioManager.stopClickTesting()` - Stops periodic click sounds

**Metronome Methods:**

- `AudioManager.playMetronomeClick()` - Plays a subtle metronome click sound
- `AudioManager.startMetronome(hasActiveTimers)` - Starts periodic metronome clicks every 1000ms, only when timers are running
- `AudioManager.stopMetronome()` - Stops periodic metronome clicks

**Enhanced Timer Alert:**

- `AudioManager.playAlert()` - Plays a distinct 2-second ascending tone pattern for timer completion

### 3.2. Data Models

**New State Properties:**

```javascript
settings: {
  audioEnabled: true,
  flashEnabled: true,
  audioTestingEnabled: false,  // Audio testing feature
  metronomeEnabled: false      // Metronome feature
}
```

**New Component State:**

```javascript
audioTestingIntervalId: null,  // Track click testing interval
audioTestingActive: false,     // Visual indicator state
metronomeActive: false         // Metronome visual indicator state
```

### 3.3. Component Responsibilities

**AudioManager:**

- Generate click sounds using oscillator for both testing and metronome
- Manage separate intervals for testing and metronome
- Handle audio context initialization for both features
- Provide distinct sound patterns for metronome vs timer completion alerts
- Only play metronome clicks when timers are actively running

**Main Component (multiTimerApp):**

- Manage separate state for audio testing and metronome features
- Handle UI interactions for both feature toggles
- Coordinate with AudioManager for both feature lifecycles
- Ensure proper cleanup of both features on component destruction

**UI Components:**

- Separate settings checkboxes for audio testing and metronome
- Individual visual indicators showing status of each feature
- Error message display for both feature failures
- Clear distinction between testing and metronome functionality

## Alternatives Considered

1. **Separate Testing Page**: Rejected due to complexity and user friction
2. **Built-in Test Button**: Rejected in favor of continuous testing for better verification
3. **Combined Testing/Metronome**: Rejected to allow independent control of each feature
4. **Different Sound Pattern**: Click sounds chosen for clarity and non-intrusiveness
5. **Same Sound for All Features**: Rejected to ensure clear distinction between metronome and timer alerts

## Out of Scope

- Customizable click sound frequency or volume
- Different sound patterns for testing
- Audio testing during active timers (would be confusing)
- Recording or logging of audio test results
- Metronome tempo adjustment (fixed at 1 second intervals)
- Different metronome sounds or patterns
