import { inject } from '@vercel/analytics';
import Alpine from 'alpinejs';
import AudioManager from './audio.js';

// Initialize Alpine.js
window.Alpine = Alpine;

// Create audio manager instance
const audioManager = new AudioManager();

// Timer factory function
export function createTimer(minutes, seconds) {
  const duration = minutes * 60 + seconds;
  const id = Date.now() + Math.random();

  return {
    id,
    duration,
    remainingTime: duration,
    status: 'ready', // ready, running, paused, completed
    startTime: null,
    pausedTime: 0,
    isEditing: false,
    editMinutes: '',
    editSeconds: '',
    editError: '',
  };
}

// Main Alpine.js component
function multiTimerApp() {
  return {
    // State
    timers: [],
    newTimer: {
      minutes: 0,
      seconds: 0,
    },
    formError: '',
    settings: {
      audioEnabled: true,
      flashEnabled: true,
      audioTestingEnabled: false,
      metronomeEnabled: true,
      autoStartNewTimers: false,
    },
    // Track if this is the initial load to prevent auto-starting metronome
    isInitialLoad: true,
    intervalId: null,
    timerStartTime: null,
    audioTestingIntervalId: null,
    audioTestingActive: false,
    metronomeActive: false,
    isInitialized: false,

    // Initialize the application
    async init() {
      console.log('Initializing Interview Timer App');

      // Set up interval for timer updates
      this.startTimerInterval();

      this.isInitialized = true;
      console.log('Interview Timer App initialized successfully');

      // Set up a one-time listener to mark that initial load is complete
      // after the first user interaction (only in browser environment)
      if (typeof document !== 'undefined' && document.addEventListener) {
        const markInitialLoadComplete = () => {
          this.isInitialLoad = false;
          document.removeEventListener('click', markInitialLoadComplete);
          document.removeEventListener('keydown', markInitialLoadComplete);
          document.removeEventListener('touchstart', markInitialLoadComplete);
        };

        document.addEventListener('click', markInitialLoadComplete, {
          once: true,
        });
        document.addEventListener('keydown', markInitialLoadComplete, {
          once: true,
        });
        document.addEventListener('touchstart', markInitialLoadComplete, {
          once: true,
        });
      } else {
        // In test environment, just set the flag immediately
        this.isInitialLoad = false;
      }
    },

    // Initialize audio on first user interaction
    async initializeAudio() {
      if (!audioManager.isInitialized) {
        await audioManager.initialize();
        console.log('Audio initialized on user interaction');

        // Start metronome if it's enabled but not active yet
        if (this.settings.metronomeEnabled && !this.metronomeActive) {
          try {
            await this.startMetronome();
            console.log('Metronome started after audio initialization');
          } catch (error) {
            console.error(
              'Failed to start metronome after audio initialization:',
              error
            );
          }
        }
      }
    },

    // Schedule the next timer update based on system time
    // This ensures all timer displays update simultaneously at second boundaries
    scheduleNextTimerUpdate() {
      if (!this.timerStartTime) return;

      const now = Date.now();
      const elapsed = now - this.timerStartTime;
      const nextUpdateTime = Math.ceil(elapsed / 1000) * 1000;
      const delay = nextUpdateTime - elapsed;

      console.log(
        `[TIMER] Scheduling next update in ${delay}ms (aligned to second boundary)`
      );

      this.intervalId = setTimeout(
        () => {
          this.updateTimers();

          // Schedule the next update if there are still running timers
          if (this.timers.some((timer) => timer.status === 'running')) {
            this.scheduleNextTimerUpdate();
          } else {
            this.intervalId = null;
          }
        },
        Math.max(0, delay)
      );
    },

    // Start the main timer interval with system clock synchronization
    startTimerInterval() {
      if (this.intervalId) return;

      // Record start time for system-time synchronization
      this.timerStartTime = Date.now();

      console.log(
        `[TIMER] Starting synchronized timer updates at ${new Date().toISOString()}`
      );

      // Schedule the first update aligned to the next second boundary
      this.scheduleNextTimerUpdate();
    },

    // Stop the main timer interval
    stopTimerInterval() {
      if (this.intervalId) {
        clearTimeout(this.intervalId);
        this.intervalId = null;
      }
      this.timerStartTime = null;
    },

    // Update all running timers
    updateTimers() {
      const now = Date.now();
      let completedTimers = [];

      this.timers.forEach((timer) => {
        if (timer.status === 'running') {
          const elapsed = (now - timer.startTime) / 1000;
          timer.remainingTime = Math.max(
            0,
            timer.duration - elapsed - timer.pausedTime
          );

          if (timer.remainingTime <= 0) {
            timer.status = 'completed';
            timer.remainingTime = 0;
            completedTimers.push(timer);
          }
        }
      });

      // Handle completed timers
      if (completedTimers.length > 0) {
        this.handleTimerCompletion(completedTimers);
      }
    },

    // Handle timer completion
    async handleTimerCompletion(completedTimers) {
      console.log(`${completedTimers.length} timer(s) completed`);

      // Play audio alert if enabled
      if (this.settings.audioEnabled) {
        try {
          await audioManager.playAlert();
        } catch (error) {
          console.warn('Audio alert failed:', error.message);
        }
      }

      // Flash screen if enabled
      if (this.settings.flashEnabled) {
        this.flashScreen();
      }
    },

    // Flash the screen
    flashScreen() {
      const flashDiv = document.createElement('div');
      flashDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(255, 255, 255, 0.8);
        z-index: 9999;
        pointer-events: none;
        animation: flash 0.5s ease-out;
      `;

      // Add flash animation CSS if not already added
      if (!document.getElementById('flash-animation')) {
        const style = document.createElement('style');
        style.id = 'flash-animation';
        style.textContent = `
          @keyframes flash {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(flashDiv);

      // Remove flash element after animation
      setTimeout(() => {
        if (flashDiv.parentNode) {
          flashDiv.parentNode.removeChild(flashDiv);
        }
      }, 500);
    },

    // Add a new timer
    async addTimer() {
      if (!this.isValidTimer()) {
        this.formError =
          'Please enter valid minutes and seconds (at least 1 second total)';
        return;
      }

      // Initialize audio on first user interaction
      await this.initializeAudio();

      const timer = createTimer(
        Number(this.newTimer.minutes),
        Number(this.newTimer.seconds)
      );
      this.timers.push(timer);

      // Clear form
      this.newTimer.minutes = 0;
      this.newTimer.seconds = 0;
      this.formError = '';

      // Start interval if not already running
      if (!this.intervalId) {
        this.startTimerInterval();
      }

      // Auto-start the timer if the toggle is enabled
      if (this.settings.autoStartNewTimers) {
        timer.status = 'running';
        timer.startTime = Date.now();
        timer.pausedTime = 0;
        console.log(`Auto-started timer: ${this.formatTime(timer.duration)}`);
      }

      console.log(`Added timer: ${this.formatTime(timer.duration)}`);
    },

    // Add multiple timers quickly
    addQuickTimers(durationsInSeconds) {
      durationsInSeconds.forEach((duration) => {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const timer = createTimer(minutes, seconds);
        this.timers.push(timer);
      });

      // Start interval if not already running
      if (!this.intervalId) {
        this.startTimerInterval();
      }

      console.log(`Added ${durationsInSeconds.length} quick timers`);
    },

    // Validate timer input
    isValidTimer() {
      const minutes = Number(this.newTimer.minutes);
      const seconds = Number(this.newTimer.seconds);
      const totalSeconds = minutes * 60 + seconds;
      return (
        totalSeconds > 0 &&
        minutes >= 0 &&
        seconds >= 0 &&
        minutes <= 59 &&
        seconds <= 59
      );
    },

    // Check if all timers can be started
    canStartAll() {
      return this.timers.some(
        (timer) =>
          timer.status === 'ready' ||
          timer.status === 'paused' ||
          timer.status === 'completed'
      );
    },

    // Check if any timers are running
    hasRunningTimers() {
      return this.timers.some((timer) => timer.status === 'running');
    },

    // Get the appropriate button text
    getStartStopAllButtonText() {
      return this.hasRunningTimers() ? 'Stop All' : 'Start All';
    },

    // Get the appropriate toggle label
    getToggleLabel() {
      if (this.hasRunningTimers()) {
        return 'Pause All';
      } else if (this.timers.some((timer) => timer.status === 'paused')) {
        return 'Resume All';
      } else {
        return 'Start All';
      }
    },

    // Get the appropriate button text for individual timers
    getTimerButtonText(status) {
      switch (status) {
        case 'running':
          return 'Pause';
        case 'paused':
          return 'Resume';
        case 'ready':
          return 'Start';
        case 'completed':
          return 'Restart';
        default:
          return 'Start';
      }
    },

    // Check if the start/stop all button should be disabled
    isStartStopAllButtonDisabled() {
      return !this.canStartAll() && !this.hasRunningTimers();
    },

    // Toggle between pause all and resume all
    async togglePauseResumeAll() {
      if (this.hasRunningTimers()) {
        this.pauseAllTimers();
      } else {
        // If there are paused timers, it's a resume operation (don't restart completed timers)
        // If there are only ready timers, it's a start operation (include completed timers)
        const hasPausedTimers = this.timers.some(
          (timer) => timer.status === 'paused'
        );
        const includeCompleted = !hasPausedTimers;
        await this.startAllTimers(includeCompleted);
      }
    },

    // Handle toggle switch change
    async handleToggleChange() {
      await this.togglePauseResumeAll();
    },

    // Start all ready and paused timers
    async startAllTimers(includeCompleted = true) {
      // Initialize audio on first user interaction
      await this.initializeAudio();

      const now = Date.now();
      let startedCount = 0;

      this.timers.forEach((timer) => {
        const shouldStart = includeCompleted
          ? timer.status === 'ready' ||
            timer.status === 'paused' ||
            timer.status === 'completed'
          : timer.status === 'ready' || timer.status === 'paused';

        if (shouldStart) {
          const originalStatus = timer.status;
          timer.status = 'running';
          timer.startTime = now;
          // For ready and completed timers, reset paused time; for paused timers, keep accumulated paused time
          if (originalStatus === 'ready' || originalStatus === 'completed') {
            timer.pausedTime = 0;
            timer.remainingTime = timer.duration;
          }
          startedCount++;
        }
      });

      if (startedCount > 0) {
        this.startTimerInterval();
        console.log(`Started ${startedCount} timer(s)`);
      }
    },

    // Pause all running timers
    pauseAllTimers() {
      const now = Date.now();
      let pausedCount = 0;

      this.timers.forEach((timer) => {
        if (timer.status === 'running') {
          timer.status = 'paused';
          timer.pausedTime += (now - timer.startTime) / 1000;
          pausedCount++;
        }
      });

      if (pausedCount > 0) {
        console.log(`Paused ${pausedCount} timer(s)`);
      }
    },

    // Resume all paused timers
    async resumeAllTimers() {
      // Initialize audio on first user interaction
      await this.initializeAudio();

      const now = Date.now();
      let resumedCount = 0;

      this.timers.forEach((timer) => {
        if (timer.status === 'paused') {
          timer.status = 'running';
          timer.startTime = now;
          resumedCount++;
        } else if (timer.status === 'completed') {
          // Restart completed timers
          timer.status = 'running';
          timer.remainingTime = timer.duration;
          timer.startTime = now;
          timer.pausedTime = 0;
          resumedCount++;
        } else if (timer.status === 'ready') {
          // Start ready timers that haven't been started yet
          timer.status = 'running';
          timer.startTime = now;
          timer.pausedTime = 0;
          resumedCount++;
        }
      });

      if (resumedCount > 0) {
        this.startTimerInterval();
        console.log(`Resumed ${resumedCount} timer(s)`);
      }
    },

    // Toggle individual timer (start/pause/restart)
    async toggleTimer(timerId) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      const now = Date.now();

      if (timer.status === 'ready' || timer.status === 'paused') {
        // Initialize audio on first user interaction
        await this.initializeAudio();

        timer.status = 'running';
        timer.startTime = now;
        this.startTimerInterval();
        console.log(`Started timer ${timerId}`);
      } else if (timer.status === 'running') {
        timer.status = 'paused';
        timer.pausedTime += (now - timer.startTime) / 1000;
        console.log(`Paused timer ${timerId}`);
      } else if (timer.status === 'completed') {
        // Initialize audio on first user interaction
        await this.initializeAudio();

        // Restart the timer from the beginning
        timer.status = 'running';
        timer.remainingTime = timer.duration;
        timer.startTime = now;
        timer.pausedTime = 0;
        this.startTimerInterval();
        console.log(`Restarted timer ${timerId}`);
      }
    },

    // Remove a timer
    removeTimer(timerId) {
      const index = this.timers.findIndex((t) => t.id === timerId);
      if (index !== -1) {
        this.timers.splice(index, 1);
        console.log(`Removed timer ${timerId}`);
      }
    },

    // Reset all timers
    resetAllTimers() {
      this.timers.forEach((timer) => {
        timer.status = 'ready';
        timer.remainingTime = timer.duration;
        timer.startTime = null;
        timer.pausedTime = 0;
      });

      this.stopTimerInterval();
      console.log('Reset all timers');
    },

    // Format time in MM:SS format
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Start audio testing
    async startAudioTesting() {
      try {
        await audioManager.startClickTesting();
        this.audioTestingActive = true;
        console.log('Audio testing started');
      } catch (error) {
        console.error('Failed to start audio testing:', error);
        this.audioTestingActive = false;
      }
    },

    // Stop audio testing
    async stopAudioTesting() {
      try {
        audioManager.stopClickTesting();
        this.audioTestingActive = false;
        console.log('Audio testing stopped');
      } catch (error) {
        console.error('Failed to stop audio testing:', error);
      }
    },

    // Start metronome
    async startMetronome() {
      try {
        // Initialize audio context if needed
        if (!audioManager.isInitialized) {
          await audioManager.initialize();
        }

        // Set up callback for when metronome stops automatically
        audioManager.onMetronomeStop = () => {
          this.metronomeActive = false;
        };

        // Pass function to check if timers are running
        await audioManager.startMetronome(() => {
          return this.timers.some((timer) => timer.status === 'running');
        });
        this.metronomeActive = true;
        console.log('Metronome started');
      } catch (error) {
        console.error('Failed to start metronome:', error);
        this.metronomeActive = false;
        // If audio initialization failed, disable metronome setting
        this.settings.metronomeEnabled = false;
      }
    },

    // Stop metronome
    async stopMetronome() {
      try {
        audioManager.stopMetronome();
        this.metronomeActive = false;
        console.log('Metronome stopped');
      } catch (error) {
        console.error('Failed to stop metronome:', error);
      }
    },

    // Handle metronome toggle with proper audio initialization
    async handleMetronomeToggle() {
      if (this.settings.metronomeEnabled) {
        try {
          await this.startMetronome();
        } catch (error) {
          console.error('Failed to start metronome on toggle:', error);
          // If audio initialization failed, disable the setting
          this.settings.metronomeEnabled = false;
        }
      } else {
        await this.stopMetronome();
      }
    },

    // Timer editing methods
    startEditTimer(timerId, focusField = 'minutes') {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      // Pause running timer when entering edit mode
      if (timer.status === 'running') {
        timer.status = 'paused';
        const now = Date.now();
        timer.pausedTime += (now - timer.startTime) / 1000;
      }

      timer.isEditing = true;
      const formattedTime = this.formatTime(timer.duration);
      const [minutes, seconds] = formattedTime.split(':');
      timer.editMinutes = minutes;
      timer.editSeconds = seconds;
      timer.editError = '';

      // Focus the specified input field
      if (focusField === 'seconds') {
        this.focusSeconds(timerId);
      } else {
        this.focusMinutes(timerId);
      }
    },

    cancelEditTimer(timerId) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      // Restore running timer state when canceling edit
      if (timer.status === 'paused' && timer.startTime) {
        timer.status = 'running';
        timer.startTime = Date.now();
      }

      timer.isEditing = false;
      timer.editMinutes = '';
      timer.editSeconds = '';
      timer.editError = '';
    },

    saveEditTimer(timerId) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      const minutes = parseInt(timer.editMinutes, 10) || 0;
      const seconds = parseInt(timer.editSeconds, 10) || 0;

      if (
        !this.validateTimeInput(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
      ) {
        timer.editError = 'Invalid time format. Use MM:SS format.';
        return;
      }

      const newDuration = minutes * 60 + seconds;
      const wasPaused = timer.status === 'paused';
      const hasRunningTimers = this.timers.some(
        (t) => t.id !== timerId && t.status === 'running'
      );

      timer.duration = newDuration;
      timer.remainingTime = newDuration;
      timer.isEditing = false;
      timer.editMinutes = '';
      timer.editSeconds = '';
      timer.editError = '';

      // Auto-start the timer if:
      // 1. It was previously paused (was running before editing), OR
      // 2. Other timers are currently running (to stay in sync)
      if (wasPaused || hasRunningTimers) {
        timer.status = 'running';
        timer.startTime = Date.now();
        timer.pausedTime = 0;
        this.startTimerInterval();
      } else {
        timer.status = 'ready';
        timer.startTime = null;
        timer.pausedTime = 0;
      }
    },

    validateTimeInput(input) {
      if (!input || typeof input !== 'string') return false;

      // Trim whitespace
      input = input.trim();

      // Must be exactly MM:SS format
      const timeRegex = /^(\d{2}):(\d{2})$/;
      const match = input.match(timeRegex);

      if (!match) return false;

      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);

      // Validate ranges and ensure non-zero duration
      return (
        minutes >= 0 &&
        minutes <= 59 &&
        seconds >= 0 &&
        seconds <= 59 &&
        (minutes > 0 || seconds > 0)
      );
    },

    // Focus management for edit inputs
    focusMinutes(timerId) {
      const focusInput = () => {
        const input = document.querySelector(
          `[data-timer-id="${timerId}"] .timer-edit-minutes`
        );
        if (input) {
          input.focus();
          input.select();
        }
      };

      // Use requestAnimationFrame for better timing with DOM updates
      requestAnimationFrame(() => {
        requestAnimationFrame(focusInput);
      });
    },

    focusSeconds(timerId) {
      const focusInput = () => {
        const input = document.querySelector(
          `[data-timer-id="${timerId}"] .timer-edit-seconds`
        );
        if (input) {
          input.focus();
          input.select();
        }
      };

      // Use requestAnimationFrame for better timing with DOM updates
      requestAnimationFrame(() => {
        requestAnimationFrame(focusInput);
      });
    },

    // Format input values with leading zeros
    formatInputValue(value) {
      const num = parseInt(value, 10) || 0;
      return num.toString().padStart(2, '0');
    },

    // Input handlers for auto-advancement and formatting
    handleMinutesInput(timerId, event) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      let value = event.target.value;

      // Only allow digits
      value = value.replace(/\D/g, '');

      // Limit to 2 digits
      if (value.length > 2) {
        value = value.slice(0, 2);
      }

      // Update the timer's edit value
      timer.editMinutes = value;

      // Auto-advance to seconds when 2 digits are entered
      if (value.length === 2) {
        this.focusSeconds(timerId);
      }
    },

    handleSecondsInput(timerId, event) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      let value = event.target.value;

      // Only allow digits
      value = value.replace(/\D/g, '');

      // Limit to 2 digits
      if (value.length > 2) {
        value = value.slice(0, 2);
      }

      // Update the timer's edit value
      timer.editSeconds = value;

      // Auto-save when 2 digits are entered
      if (value.length === 2) {
        this.saveEditTimer(timerId);
      }
    },

    // Handle tab key navigation
    handleTabKey(timerId, currentField, event) {
      event.preventDefault(); // Prevent default tab behavior

      if (currentField === 'minutes') {
        this.focusSeconds(timerId);
      } else {
        this.focusMinutes(timerId);
      }
    },

    // Handle blur events (when input loses focus)
    handleBlur(timerId, field, event) {
      // Check if focus is moving to the other input field
      const relatedTarget = event.relatedTarget;
      const isMovingToOtherInput =
        relatedTarget &&
        (relatedTarget.classList.contains('timer-edit-minutes') ||
          relatedTarget.classList.contains('timer-edit-seconds'));

      // Only save if we're not moving to the other input field
      if (!isMovingToOtherInput) {
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
          this.saveEditTimer(timerId);
        });
      }
    },

    // Get formatted display values for inputs
    getFormattedMinutes(timerId) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return '';
      return timer.editMinutes;
    },

    getFormattedSeconds(timerId) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return '';
      return timer.editSeconds;
    },

    // Cleanup when component is destroyed
    destroy() {
      this.stopTimerInterval();
      this.stopAudioTesting();
      this.stopMetronome();
      audioManager.cleanup();
    },
  };
}

// Make the component available globally
window.multiTimerApp = multiTimerApp;

// Export for testing
export { multiTimerApp, audioManager };

// Start Alpine.js
Alpine.start();
inject();
