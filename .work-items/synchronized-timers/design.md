# Synchronized Timer Countdown Design

## Objective

Implement system-clock-synchronized timer updates so all countdown displays decrement in unison, creating a visually cohesive and less distracting user experience.

## Technical Design

This design replaces the current 100ms interval-based timer updates with a system-clock-synchronized approach that aligns all timer updates to second boundaries. The solution builds on the existing metronome synchronization pattern already implemented in `audio.js`.

### Key Changes

#### 1. Timer Update Synchronization

**Current Implementation:**

- Uses `setInterval(() => updateTimers(), 100)` for frequent updates
- Each timer calculates remaining time independently based on `Date.now() - startTime`
- Updates can occur at any millisecond, causing visual inconsistency

**New Implementation:**

- Replace `setInterval` with `setTimeout`-based scheduling
- Align all updates to system clock second boundaries (e.g., 12:34:56.000, 12:34:57.000)
- Use the same synchronization pattern as the metronome in `audio.js`

#### 2. Component Responsibilities

**Main Timer Component (`src/main.js`):**

- Replace `startTimerInterval()` with `scheduleNextTimerUpdate()`
- Add system clock boundary calculation logic
- Maintain existing timer state management and completion handling

**Audio Manager (`src/audio.js`):**

- No changes required - metronome already uses system clock synchronization
- Metronome and timer updates will naturally align

#### 3. Data Models

**Timer Object (unchanged):**

- Existing timer properties remain the same
- `startTime`, `duration`, `remainingTime` calculations work with synchronized updates
- No changes to timer state management

### Implementation Details

#### System Clock Synchronization Algorithm

```javascript
scheduleNextTimerUpdate() {
  const now = Date.now();
  const nextSecondBoundary = Math.ceil(now / 1000) * 1000;
  const delay = nextSecondBoundary - now;

  this.intervalId = setTimeout(() => {
    this.updateTimers();
    this.scheduleNextTimerUpdate(); // Recursive scheduling
  }, Math.max(0, delay));
}
```

#### Benefits of This Approach

1. **Visual Consistency**: All timers update simultaneously, reducing visual distraction
2. **System Clock Alignment**: Updates align with actual time boundaries
3. **Proven Pattern**: Uses the same approach as the existing metronome synchronization
4. **Minimal Changes**: Leverages existing timer calculation logic
5. **Acceptable Precision**: Trade-off of millisecond precision for visual consistency is acceptable for the use case

## Alternatives Considered

### Alternative 1: Keep Current 100ms Updates

- **Pros**: Maintains current precision
- **Cons**: Visual inconsistency, distracting user experience
- **Rejected**: Does not address the core UX concern

### Alternative 2: Round All Timer Calculations to Second Boundaries

- **Pros**: Simpler implementation
- **Cons**: Would require changes to timer start/pause logic, more complex state management
- **Rejected**: More invasive changes to existing timer logic

### Alternative 3: Use Web Workers for Precise Timing

- **Pros**: Could maintain precision while synchronizing
- **Cons**: Added complexity, overkill for the use case
- **Rejected**: Unnecessary complexity for the visual consistency goal

## Out of Scope

- Changing timer precision or accuracy requirements
- Modifying timer start/pause/resume logic
- Changing the metronome implementation (already synchronized)
- Performance optimizations beyond the synchronization requirement
- Mobile-specific timing considerations
