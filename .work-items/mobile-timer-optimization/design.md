# Mobile Timer Optimization Design

## Objective

Optimize the mobile timer display to show at least 8 timers simultaneously on large iPhone screens and implement modal-based timer editing for mobile devices to improve usability and touch interaction.

## Technical Design

This design extends the existing timer application with mobile-specific optimizations that maintain the current desktop functionality while providing an enhanced mobile experience. The solution leverages the existing modal infrastructure and responsive design patterns.

### Architecture Reference

This design adheres to the system architecture defined in `docs/architecture/system-overview.md` and extends the existing Alpine.js component structure with mobile-specific enhancements.

## Key Changes

### 3.1. Responsive Grid Layout

**Current State**: Mobile displays timers in single column (1fr) at 768px and below
**New State**: Implement multi-column grid for mobile screens with optimized spacing

```css
/* Mobile-optimized timer grid */
@media (max-width: 768px) {
  .timers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .timers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.375rem;
  }
}

/* Large mobile screens (iPhone Pro Max, etc.) */
@media (min-width: 430px) and (max-width: 768px) {
  .timers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}
```

### 3.2. Mobile Timer Card Optimization

**Compact Timer Cards**: Reduce padding and font sizes for mobile while maintaining readability

```css
/* Mobile timer card optimizations */
@media (max-width: 768px) {
  .timer-card {
    padding: 0.75rem;
    min-height: auto;
  }

  .timer-time {
    font-size: 1.75rem;
  }

  .timer-status {
    font-size: 0.625rem;
    margin-bottom: 0.5rem;
  }

  .timer-controls {
    gap: 0.25rem;
  }

  .timer-controls button {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}
```

### 3.3. Mobile Timer Editing Modal

**New Component**: Extend existing modal system for timer editing

```javascript
// Mobile timer editing modal component
export function createMobileTimerEditModal() {
  return {
    // Modal state
    showEditTimerModal: false,
    editingTimer: null,
    editFormError: '',

    // Modal methods
    openEditTimerModal(timerId) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      this.editingTimer = {
        id: timer.id,
        minutes: Math.floor(timer.duration / 60),
        seconds: timer.duration % 60,
      };
      this.showEditTimerModal = true;
      this.editFormError = '';
    },

    closeEditTimerModal() {
      this.showEditTimerModal = false;
      this.editingTimer = null;
      this.editFormError = '';
    },

    saveEditTimerModal() {
      if (!this.editingTimer) return;

      const timer = this.timers.find((t) => t.id === this.editingTimer.id);
      if (!timer) return;

      const newDuration =
        this.editingTimer.minutes * 60 + this.editingTimer.seconds;
      if (newDuration <= 0) {
        this.editFormError = 'Timer duration must be at least 1 second';
        return;
      }

      timer.duration = newDuration;
      timer.remainingTime = newDuration;

      this.closeEditTimerModal();
    },
  };
}
```

### 3.4. Touch-Optimized Interactions

**Mobile-Specific Event Handlers**: Replace click-to-edit with modal-based editing on mobile

```javascript
// Mobile detection and conditional behavior
isMobileDevice() {
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
},

handleTimerClick(timerId, event) {
  if (this.isMobileDevice()) {
    event.preventDefault();
    this.openEditTimerModal(timerId);
  } else {
    // Existing desktop inline editing behavior
    this.startEditTimer(timerId);
  }
}
```

### 3.5. Component Responsibilities

#### Frontend Components

**Mobile Timer Card Component**:

- Detect mobile environment
- Render compact timer display
- Handle touch interactions for modal opening
- Maintain existing timer functionality (start/stop/remove)

**Mobile Edit Modal Component**:

- Extend existing modal infrastructure
- Provide touch-friendly input controls
- Handle timer duration validation
- Integrate with existing timer state management

**Responsive Grid Component**:

- Implement multi-column layout for mobile
- Optimize spacing and sizing for different screen sizes
- Maintain accessibility and touch target requirements

#### Backend Components

No backend changes required - all functionality remains client-side.

## 4. Alternatives Considered

### Alternative 1: Inline Editing on Mobile

**Approach**: Keep existing click-to-edit functionality on mobile
**Rejected Because**:

- Touch targets too small for reliable interaction
- Input fields difficult to use on mobile keyboards
- Poor user experience with mobile form interactions

### Alternative 2: Separate Mobile App

**Approach**: Create dedicated mobile application
**Rejected Because**:

- Significant development overhead
- Maintenance complexity for multiple codebases
- User prefers single responsive web application

### Alternative 3: Swipe Gestures for Editing

**Approach**: Use swipe gestures to reveal edit controls
**Rejected Because**:

- Not discoverable for users
- Conflicts with native mobile scrolling
- Adds complexity without clear benefit

### Chosen Approach: Modal-Based Mobile Editing

**Selected Because**:

- Leverages existing modal infrastructure
- Provides clear, discoverable editing interface
- Maintains consistent user experience
- Easy to implement and maintain

## 5. Out of Scope

- Desktop timer editing changes (existing inline editing preserved)
- Advanced mobile gestures (swipe, pinch, etc.)
- Mobile-specific animations or transitions
- Offline functionality or data persistence
- Mobile app store distribution
- Push notifications for timer completion
- Mobile-specific accessibility features beyond touch targets
- Integration with mobile calendar or reminder apps
- Mobile-specific timer templates or presets
- Cross-device timer synchronization
