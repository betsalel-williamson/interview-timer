# Task Plan: Fix Metronome Bugs

## Task 1: Implement System-Time-Synchronized Metronome

**Objective**: Replace interval-based metronome with system-time-synchronized timing to eliminate drift.

**Acceptance Criteria**:

- Metronome ticks align to actual system time (second boundaries)
- No accumulation of timing drift over extended periods
- Metronome continues running accurately even with execution delays
- All existing metronome functionality preserved

**Requirements Traceability**: Addresses Bug 1 from the design document - metronome timing drift

**Test Strategy**:

- Run metronome for extended periods and verify timing accuracy
- Test with system under load to ensure timing correction works
- Verify metronome stops/starts correctly with timer state changes

**Implementation Steps**:

### Step 1.1: Add New Properties to AudioManager

- Add `metronomeTimeoutId` property to replace `metronomeIntervalId`
- Add `metronomeStartTime` property to track when metronome started
- Add `metronomeBaseTime` property to track the base time for calculations

### Step 1.2: Create scheduleNextMetronomeTick Method

- Calculate time until next second boundary
- Use `setTimeout` with corrected delay
- Recursively schedule next tick
- Handle edge cases (system time changes, etc.)

### Step 1.3: Update startMetronome Method

- Record start time
- Calculate initial delay to next second boundary
- Use new scheduling method instead of setInterval

### Step 1.4: Update stopMetronome Method

- Clear timeout instead of interval
- Reset timing properties

## Task 2: Fix Metronome Toggle Logic

**Objective**: Fix the metronome checkbox to work on first click instead of requiring 3 clicks.

**Acceptance Criteria**:

- First click on metronome checkbox properly toggles metronome state
- Checkbox state accurately reflects metronome state
- Auto-start prevention on page load still works
- No regression in existing metronome functionality

**Requirements Traceability**: Addresses Bug 2 from the design document - metronome toggle requiring 3 clicks

**Test Strategy**:

- Test first click toggles metronome immediately
- Test checkbox state reflects actual metronome state
- Test page load doesn't auto-start metronome
- Test metronome starts/stops with timer state changes

**Implementation Steps**:

### Step 2.1: Refactor isInitialLoad Logic

- Remove early return in `handleMetronomeToggle()`
- Use different approach for preventing auto-start on page load
- Consider using `x-init` or component lifecycle methods

### Step 2.2: Fix handleMetronomeToggle Method

- Remove the `isInitialLoad` check that blocks first toggle
- Ensure proper state management
- Maintain existing functionality for auto-start prevention

### Step 2.3: Update Initialization Logic

- Ensure metronome state is properly initialized
- Fix any race conditions in initialization

## Task 3: Improve Timer Editing Reliability

**Objective**: Fix inconsistent timer editing when clicking on numbers and improve pause/resume behavior.

**Acceptance Criteria**:

- Clicking on timer numbers consistently activates edit mode
- Focus is properly set on the correct input field
- Timer pauses when entering edit mode
- Timer resumes on blur if other timers are running
- No race conditions between DOM updates and focus management

**Requirements Traceability**: Addresses Bug 3 from the design document - timer editing inconsistency

**Test Strategy**:

- Test clicking on minutes/seconds consistently activates edit mode
- Test focus is set correctly
- Test pause/resume behavior during editing
- Test editing works with multiple timers running
- Test blur handling doesn't interfere with editing

**Implementation Steps**:

### Step 3.1: Fix Focus Management Race Conditions

- Improve timing of focus calls after DOM updates
- Use proper Alpine.js lifecycle methods
- Remove or reduce setTimeout delays that cause issues

### Step 3.2: Improve startEditTimer Method

- Ensure reliable activation of edit mode
- Fix focus timing issues
- Improve pause logic when entering edit mode

### Step 3.3: Fix handleBlur Method

- Remove or reduce the 100ms delay that interferes with editing
- Improve logic for detecting focus movement between inputs
- Ensure proper save timing

### Step 3.4: Enhance saveEditTimer Method

- Improve resume logic when other timers are running
- Better handling of timer state transitions
- Ensure proper timing updates

## Task 4: Update Tests

**Objective**: Update existing tests and add new tests to validate the fixes.

**Acceptance Criteria**:

- All existing tests pass
- New tests validate the bug fixes
- Tests cover edge cases and error conditions
- Test coverage maintained or improved

**Requirements Traceability**: Ensures all fixes are properly validated

**Test Strategy**:

- Run existing test suite to ensure no regressions
- Add specific tests for each bug fix
- Test edge cases and error conditions
- Verify e2e tests pass after fixes

**Implementation Steps**:

### Step 4.1: Fix Existing Test Issues

- Fix syntax errors in bug validation tests
- Ensure tests properly capture the bugs
- Update any tests that may be affected by changes

### Step 4.2: Add Unit Tests

- Add tests for new metronome timing logic
- Add tests for improved toggle logic
- Add tests for enhanced editing functionality

### Step 4.3: Update E2E Tests

- Ensure bug validation tests pass after fixes
- Add additional test cases for edge conditions
- Verify all browser compatibility

## Implementation Order

1. **Task 1** (Metronome Timing) - Core functionality fix
2. **Task 2** (Toggle Logic) - User experience fix
3. **Task 3** (Editing Reliability) - User experience fix
4. **Task 4** (Tests) - Validation and regression prevention

Each task builds on the previous ones and can be implemented independently while maintaining system stability.
