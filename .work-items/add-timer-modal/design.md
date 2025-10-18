# Add New Timer Modal - Design Document

## Objective

Implement a modal dialog for adding new timers that can be accessed from the main toolbar, providing quick access to timer creation without disrupting the user's workflow with existing timers.

## Technical Design

This design extends the existing multi-timer application by adding a modal interface for timer creation. The modal will reuse existing timer creation logic while providing a more accessible entry point from the main toolbar.

### Key Components

1. **Add Timer Button**: A new button in the timer controls toolbar next to "Reset All"
2. **Modal Dialog**: A centered overlay dialog containing the timer input form
3. **Modal State Management**: Alpine.js reactive state for modal visibility and form data
4. **Form Reuse**: Leverage existing timer validation and creation logic

### Integration Points

- **Existing Timer Creation Logic**: Reuse `addTimer()` method and validation functions
- **Auto-start Setting**: Respect the existing auto-start toggle setting
- **Audio Initialization**: Maintain existing audio initialization on user interaction
- **Form Validation**: Use existing `isValidTimer()` and error handling

## Key Changes

### 3.1. API Contracts

No new API endpoints required. The modal will use existing client-side timer creation methods.

### 3.2. Data Models

**New State Properties:**

```javascript
{
  showAddTimerModal: false,
  modalTimer: {
    minutes: 0,
    seconds: 0
  },
  modalFormError: ''
}
```

### 3.3. Component Responsibilities

**Frontend Components:**

- **Add Timer Button**: Triggers modal opening, positioned in timer controls toolbar
- **Modal Dialog**: Contains timer input form with validation and submission
- **Modal Backdrop**: Handles click-outside-to-close functionality
- **Form Inputs**: Minutes and seconds input fields with validation
- **Action Buttons**: "Add Timer" and "Cancel" buttons

**Backend Components:**

- No backend changes required

## Alternatives Considered

1. **Dropdown Menu**: Considered adding timer creation to a dropdown menu, but modal provides better focus and prevents accidental dismissal
2. **Inline Form**: Considered expanding the toolbar with inline form fields, but this would clutter the interface
3. **Floating Action Button**: Considered a floating "+" button, but toolbar integration provides better context

## Out of Scope

- Timer editing within the modal (existing inline editing remains)
- Bulk timer creation through the modal
- Timer templates or presets in the modal
- Modal animations or transitions (keeping implementation simple)
- Keyboard shortcuts for modal opening (focus on mouse interaction)
