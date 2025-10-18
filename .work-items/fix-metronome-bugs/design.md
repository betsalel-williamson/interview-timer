# Design Document: Fix Metronome Bugs

## Objective

Fix three critical bugs affecting the metronome functionality and timer editing: metronome timing drift, metronome toggle requiring 3 clicks, and inconsistent timer editing when clicking on numbers.

## Technical Design

This design addresses three interconnected issues in the timer application's metronome and editing systems. The solution involves implementing a system-time-synchronized metronome, fixing toggle logic, and improving timer editing reliability.

### Bug 1: System-Time-Synchronized Metronome

**Current Problem**: The metronome uses `setInterval` which accumulates delays over time and doesn't synchronize with actual system time, causing drift.

**Solution**: Replace the interval-based approach with a self-correcting timer loop that:

- Calculates next tick based on actual system time
- Uses `setTimeout` with adjusted delays to stay synchronized
- Aligns to second boundaries for consistent timing

**Key Changes**:

- Replace `metronomeIntervalId` with `metronomeTimeoutId`
- Add `metronomeStartTime` to track when metronome started
- Create `scheduleNextMetronomeTick()` method that calculates time until next second boundary
- Use recursive `setTimeout` calls with corrected delays

### Bug 2: Fix Metronome Toggle Logic

**Current Problem**: The `isInitialLoad` flag prevents the first manual toggle from working, requiring 3 clicks to stop the metronome.

**Solution**: Refactor the toggle logic to properly handle both initial load prevention and manual toggles.

**Key Changes**:

- Remove the early return in `handleMetronomeToggle()` that blocks the first toggle
- Use a different approach for preventing auto-start on page load
- Ensure checkbox state properly reflects metronome state

### Bug 3: Improve Timer Editing Reliability

**Current Problem**: Clicking on timer numbers to edit them is unreliable due to race conditions between Alpine.js DOM updates and focus management.

**Solution**: Improve the editing flow to be more reliable and provide better user feedback.

**Key Changes**:

- Fix race conditions in focus management
- Improve the pause/resume logic when editing timers
- Ensure edit mode activates consistently
- Better handling of blur events

## Key Changes

### API Contracts

No new API endpoints are required. All changes are internal to the existing components.

### Data Models

**AudioManager class**:

- Add `metronomeTimeoutId` property
- Add `metronomeStartTime` property
- Add `scheduleNextMetronomeTick()` method
- Modify `startMetronome()` to use new timing approach
- Modify `stopMetronome()` to clear timeout

**Main application state**:

- Refactor `isInitialLoad` handling
- Improve `handleMetronomeToggle()` logic
- Enhance timer editing methods for better reliability

### Component Responsibilities

**AudioManager (`src/audio.js`)**:

- Implement system-time-synchronized metronome timing
- Provide reliable metronome start/stop functionality
- Maintain accurate timing regardless of execution delays

**Main Application (`src/main.js`)**:

- Fix metronome toggle logic to work on first click
- Improve timer editing reliability and focus management
- Ensure proper pause/resume behavior during editing

## Alternatives Considered

**For Bug 1 (Timing Drift)**:

- **Alternative**: Use Web Workers for metronome timing
- **Rejected**: Adds complexity without significant benefit for this use case
- **Alternative**: Use `requestAnimationFrame`
- **Rejected**: Not suitable for second-based timing

**For Bug 2 (Toggle Logic)**:

- **Alternative**: Completely remove `isInitialLoad` flag
- **Rejected**: Need to prevent auto-start on page load
- **Alternative**: Use different event handling approach
- **Rejected**: Current approach is simpler once fixed

**For Bug 3 (Editing)**:

- **Alternative**: Use different UI pattern (modal editing)
- **Rejected**: Inline editing is better UX for this use case
- **Alternative**: Use different focus management library
- **Rejected**: Current approach can be fixed with better timing

## Out of Scope

- Changing the overall UI/UX design
- Adding new metronome features (tempo changes, different sounds)
- Implementing undo/redo for timer edits
- Adding keyboard shortcuts for editing
- Performance optimizations beyond fixing the timing issues

## Implementation Notes

The fixes are designed to be minimal and focused on the specific bugs without changing the overall architecture. The system-time-synchronized metronome will provide more accurate timing, the toggle fix will improve user experience, and the editing improvements will make the interface more reliable.

All changes maintain backward compatibility and don't require changes to the existing test suite beyond the new validation tests.
