# Add New Timer Modal - Task Breakdown

## Overview

Implement a modal dialog for adding new timers accessible from the main toolbar. This feature will provide quick access to timer creation without disrupting the user's workflow with existing timers.

## Task Breakdown

### Task 1: Add Modal State Management

**Objective**: Add reactive state properties for modal visibility and form data

**Acceptance Criteria**:

- Add `showAddTimerModal: false` to main component state
- Add `modalTimer: { minutes: 0, seconds: 0 }` for modal form data
- Add `modalFormError: ''` for modal-specific error handling
- State properties are properly initialized and reactive

**Test Strategy**:

- Verify state properties exist and have correct initial values
- Test that state changes trigger UI updates

### Task 2: Create Add Timer Button

**Objective**: Add "Add New Timer" button to the timer controls toolbar

**Acceptance Criteria**:

- Button appears next to "Reset All" button in timer controls
- Button text is "Add New Timer" or displays a "+" icon
- Button click opens the modal (`showAddTimerModal = true`)
- Button is visible when timers exist (same visibility as timer controls)

**Test Strategy**:

- Verify button appears in correct location
- Test button click opens modal
- Verify button visibility matches timer controls visibility

### Task 3: Implement Modal Dialog Structure

**Objective**: Create the modal dialog HTML structure with proper accessibility

**Acceptance Criteria**:

- Modal appears as centered overlay when `showAddTimerModal` is true
- Modal has proper backdrop that can be clicked to close
- Modal contains form with minutes and seconds input fields
- Modal has "Add Timer" and "Cancel" buttons
- Modal is properly accessible with ARIA attributes

**Test Strategy**:

- Verify modal appears and disappears correctly
- Test backdrop click closes modal
- Verify form inputs are present and functional
- Test keyboard navigation and accessibility

### Task 4: Implement Modal Form Logic

**Objective**: Add methods for modal form handling and timer creation

**Acceptance Criteria**:

- `openAddTimerModal()` method sets modal state and resets form
- `closeAddTimerModal()` method closes modal and clears form data
- `addTimerFromModal()` method validates and creates timer from modal data
- Form validation reuses existing `isValidTimer()` logic
- Error handling displays messages in modal without closing

**Test Strategy**:

- Test modal opening and closing methods
- Verify form validation works correctly
- Test timer creation from modal
- Verify error handling doesn't close modal

### Task 5: Add Modal Styling

**Objective**: Style the modal dialog to match application design

**Acceptance Criteria**:

- Modal has proper z-index to appear above other content
- Modal is centered on screen with appropriate sizing
- Backdrop has semi-transparent overlay
- Form styling matches existing form elements
- Modal is responsive for different screen sizes

**Test Strategy**:

- Verify modal appears above all other content
- Test modal positioning and sizing
- Verify responsive behavior on different screen sizes
- Check visual consistency with existing design

### Task 6: Add Keyboard and Accessibility Support

**Objective**: Implement keyboard shortcuts and accessibility features

**Acceptance Criteria**:

- Escape key closes modal
- Tab navigation works within modal
- Focus management: focus moves to modal when opened, returns when closed
- Proper ARIA labels and roles for screen readers
- Form submission works with Enter key

**Test Strategy**:

- Test Escape key closes modal
- Verify tab navigation within modal
- Test focus management
- Verify screen reader compatibility
- Test keyboard form submission

### Task 7: Integration Testing

**Objective**: Test complete modal workflow and integration with existing features

**Acceptance Criteria**:

- Modal timer creation works with auto-start setting
- Modal respects existing audio initialization
- Created timers appear in timer list correctly
- Modal doesn't interfere with existing timer operations
- All existing functionality remains unchanged

**Test Strategy**:

- Test complete timer creation workflow through modal
- Verify integration with auto-start feature
- Test that existing functionality is unaffected
- Perform end-to-end testing of modal workflow

## Implementation Notes

- Reuse existing timer creation logic to maintain consistency
- Ensure modal doesn't interfere with existing timer management
- Maintain existing form validation and error handling patterns
- Keep modal implementation simple and focused on core functionality
- Test thoroughly to ensure no regression in existing features
