# Design: Timer Editing Functionality

## 1. Objective

Enable users to edit timer durations by clicking on the timer display and entering new values directly, providing a quick and intuitive way to adjust timer settings without removing and recreating timers.

## 2. Technical Design

This design extends the existing Alpine.js-based Interview Timer application to support inline editing of timer durations. The solution leverages Alpine.js's reactive data system and DOM manipulation capabilities to provide a seamless editing experience.

### Architecture Alignment

This design aligns with the existing system architecture documented in `docs/architecture/system-overview.md`:

- **Alpine.js State Management**: Extends the existing timer state model to include editing state
- **Component-Based Approach**: Adds editing functionality to individual timer components
- **Event-Driven Updates**: Uses Alpine.js directives for DOM manipulation and state updates
- **Client-Side Only**: Maintains the static web application approach with no backend dependencies

### High-Level Solution

The timer editing functionality will be implemented through:

1. **Edit Mode State**: Add editing state to individual timer objects
2. **Click Handler**: Implement click-to-edit functionality on timer displays
3. **Inline Input**: Replace timer display with input field during editing
4. **Validation**: Client-side validation for time format and duration limits
5. **State Management**: Handle timer state transitions during editing

### Component Interaction Flow

```
User clicks timer display
    ↓
Alpine.js sets editing state to true
    ↓
DOM updates to show input field
    ↓
User enters new time value
    ↓
Validation occurs on input
    ↓
On valid input: Update timer duration, exit edit mode
On invalid input: Show error, remain in edit mode
On cancel: Restore original value, exit edit mode
```

## 3. Key Changes

### 3.1. API Contracts

No new API endpoints are required as this is a client-side only application. The functionality uses existing Alpine.js reactive data patterns.

### 3.2. Data Models

#### Extended Timer Object

```javascript
// Existing timer object extended with editing state
{
  id: string,
  duration: number,        // Total duration in seconds
  remainingTime: number,   // Remaining time in seconds
  status: 'ready' | 'running' | 'paused' | 'completed',
  startTime: number | null,
  pausedTime: number,

  // New editing properties
  isEditing: boolean,      // Whether timer is in edit mode
  editValue: string,       // Current input value during editing
  editError: string        // Validation error message
}
```

#### New Alpine.js Methods

```javascript
// Methods to be added to main app component
{
  // Timer editing methods
  startEditTimer(timerId) { ... },     // Enter edit mode
  cancelEditTimer(timerId) { ... },    // Cancel edit and restore original
  saveEditTimer(timerId) { ... },      // Save edit and update timer
  validateTimeInput(input) { ... },    // Validate time format

  // Enhanced timer management
  updateTimerDuration(timerId, newDuration) { ... }, // Update timer duration
  pauseTimerForEditing(timerId) { ... }              // Pause running timer for editing
}
```

### 3.3. Component Responsibilities

#### Frontend Components

**Main App Component (`multiTimerApp`)**

- Manage global editing state
- Provide timer editing methods
- Handle validation logic
- Coordinate timer state transitions

**Individual Timer Components**

- Display timer in normal or edit mode
- Handle click events to enter edit mode
- Manage input field during editing
- Display validation errors

**HTML Template Updates**

- Add click handlers to timer displays
- Implement conditional rendering for edit mode
- Add input field with proper validation attributes
- Include error message display

#### CSS Styling

- Edit mode visual indicators
- Input field styling to match timer display
- Error message styling
- Transition animations for mode changes

## 4. Alternatives Considered

### Alternative 1: Modal Dialog Editing

**Approach**: Open a modal dialog when clicking timer to edit duration
**Rejected Because**:

- Breaks the inline editing user experience
- Requires additional modal component complexity
- Less intuitive than direct inline editing

### Alternative 2: Separate Edit Button

**Approach**: Add a dedicated "Edit" button to each timer
**Rejected Because**:

- Adds UI clutter
- Less discoverable than click-to-edit
- Requires additional button management

### Alternative 3: Double-Click to Edit

**Approach**: Require double-click to enter edit mode
**Rejected Because**:

- Less intuitive than single-click
- May conflict with other double-click behaviors
- Reduces accessibility

### Chosen Approach: Single-Click Inline Editing

**Selected Because**:

- Most intuitive user experience
- Minimal UI changes required
- Leverages existing Alpine.js patterns
- Maintains clean, uncluttered interface

## 5. Out of Scope

- Bulk editing of multiple timers simultaneously
- Keyboard shortcuts for entering edit mode
- Undo/redo functionality for timer edits
- Auto-save of timer edits
- History tracking of timer duration changes
- Editing timer names or labels
- Drag-and-drop reordering of timers
- Copy/paste timer configurations
- Import/export of timer settings
- Advanced time format support (hours, milliseconds)
- Timer templates or presets
