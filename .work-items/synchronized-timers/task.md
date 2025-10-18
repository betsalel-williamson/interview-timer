# Synchronized Timer Countdown Tasks

## Task Overview

Implement system-clock-synchronized timer updates to ensure all countdown displays decrement in unison, creating a visually cohesive user experience.

## Task Breakdown

### Task 1: Replace Interval-Based Updates with System Clock Synchronization

**Objective:** Replace the current 100ms interval-based timer updates with system-clock-synchronized updates that align to second boundaries.

**Acceptance Criteria:**

- [ ] `startTimerInterval()` method is replaced with `scheduleNextTimerUpdate()`
- [ ] Timer updates are scheduled to align with system clock second boundaries
- [ ] Updates occur at consistent intervals (every 1000ms aligned to clock)
- [ ] Existing timer calculation logic remains unchanged
- [ ] All running timers update simultaneously

**Requirements Traceability:** User Story - Primary Success Metric: "all timer displays SHALL decrement simultaneously at system clock second boundaries"

**Test Strategy:**

- Unit test: Verify `scheduleNextTimerUpdate()` calculates correct delays
- Integration test: Start multiple timers and verify simultaneous countdown changes
- Visual test: Observe that all timer displays change at the same moment

### Task 2: Update Timer Interval Management

**Objective:** Modify the timer interval management to work with the new timeout-based approach instead of intervals.

**Acceptance Criteria:**

- [ ] `stopTimerInterval()` properly clears timeout-based scheduling
- [ ] Timer interval state management works with `setTimeout` instead of `setInterval`
- [ ] No memory leaks from uncanceled timeouts
- [ ] Proper cleanup when no timers are running

**Requirements Traceability:** User Story - Secondary Success Metric: "synchronization SHALL be maintained consistently over time"

**Test Strategy:**

- Unit test: Verify timeout cleanup in `stopTimerInterval()`
- Integration test: Start and stop timers multiple times, verify no memory leaks
- Test timer completion scenarios to ensure proper cleanup

### Task 3: Add Synchronization Logging and Debugging

**Objective:** Add appropriate logging to help debug synchronization behavior and verify correct operation.

**Acceptance Criteria:**

- [ ] Console logging shows when timer updates are scheduled
- [ ] Logging includes delay calculations for system clock alignment
- [ ] Debug information helps verify synchronization is working correctly
- [ ] Logging can be easily disabled for production

**Requirements Traceability:** User Story - Verification Requirements: "System clock alignment can be verified by checking that updates occur at second boundaries"

**Test Strategy:**

- Manual test: Verify console logs show correct scheduling information
- Test with browser dev tools to confirm timing accuracy

### Task 4: Update Tests for Synchronized Behavior

**Objective:** Update existing tests to work with the new synchronized timer approach and add new tests for synchronization behavior.

**Acceptance Criteria:**

- [ ] Existing timer tests continue to pass with synchronized updates
- [ ] New tests verify simultaneous countdown behavior
- [ ] Tests verify system clock boundary alignment
- [ ] Integration tests cover multiple timer synchronization scenarios

**Requirements Traceability:** User Story - Verification Requirements: "All metrics can be verified through visual observation and automated testing"

**Test Strategy:**

- Update existing timer tests to account for synchronized updates
- Add new test cases for multiple timer synchronization
- Add tests for system clock boundary alignment
- Verify all tests pass consistently

## Implementation Notes

### Key Files to Modify

- `src/main.js` - Replace interval-based updates with synchronized scheduling
- `tests/main.test.js` - Update existing tests and add synchronization tests

### Dependencies

- No external dependencies required
- Builds on existing timer calculation logic
- Leverages same pattern as metronome synchronization in `audio.js`

### Risk Mitigation

- Minimal changes to existing timer logic reduce risk of regressions
- Proven synchronization pattern already used by metronome
- Comprehensive testing ensures behavior is maintained
