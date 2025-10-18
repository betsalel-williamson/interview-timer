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
      metronomeEnabled: false,
    },
    intervalId: null,
    audioTestingIntervalId: null,
    audioTestingActive: false,
    metronomeActive: false,
    isInitialized: false,

    // Initialize the application
    async init() {
      console.log('Initializing Multi-Timer App');

      // Set up interval for timer updates
      this.startTimerInterval();

      this.isInitialized = true;
      console.log('Multi-Timer App initialized successfully');
    },

    // Initialize audio on first user interaction
    async initializeAudio() {
      if (!audioManager.isInitialized) {
        await audioManager.initialize();
        console.log('Audio initialized on user interaction');
      }
    },

    // Start the main timer interval
    startTimerInterval() {
      if (this.intervalId) return;

      this.intervalId = setInterval(() => {
        this.updateTimers();
      }, 100); // Update every 100ms for smooth countdown
    },

    // Stop the main timer interval
    stopTimerInterval() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    // Update all running timers
    updateTimers() {
      const now = Date.now();
      let hasRunningTimers = false;
      let completedTimers = [];

      this.timers.forEach((timer) => {
        if (timer.status === 'running') {
          hasRunningTimers = true;
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

      // Stop interval if no timers are running
      if (!hasRunningTimers && this.intervalId) {
        this.stopTimerInterval();
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

      const timer = createTimer(this.newTimer.minutes, this.newTimer.seconds);
      this.timers.push(timer);

      // Clear form
      this.newTimer.minutes = 0;
      this.newTimer.seconds = 0;
      this.formError = '';

      // Start interval if not already running
      if (!this.intervalId) {
        this.startTimerInterval();
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
      const totalSeconds = this.newTimer.minutes * 60 + this.newTimer.seconds;
      return (
        totalSeconds > 0 &&
        this.newTimer.minutes >= 0 &&
        this.newTimer.seconds >= 0 &&
        this.newTimer.minutes <= 59 &&
        this.newTimer.seconds <= 59
      );
    },

    // Check if all timers can be started
    canStartAll() {
      return this.timers.some((timer) => timer.status === 'ready');
    },

    // Start all ready timers
    startAllTimers() {
      const now = Date.now();
      let startedCount = 0;

      this.timers.forEach((timer) => {
        if (timer.status === 'ready') {
          timer.status = 'running';
          timer.startTime = now;
          timer.pausedTime = 0;
          startedCount++;
        }
      });

      if (startedCount > 0) {
        this.startTimerInterval();
        console.log(`Started ${startedCount} timer(s)`);
      }
    },

    // Toggle individual timer (start/pause)
    toggleTimer(timerId) {
      const timer = this.timers.find((t) => t.id === timerId);
      if (!timer) return;

      const now = Date.now();

      if (timer.status === 'ready' || timer.status === 'paused') {
        timer.status = 'running';
        timer.startTime = now;
        this.startTimerInterval();
        console.log(`Started timer ${timerId}`);
      } else if (timer.status === 'running') {
        timer.status = 'paused';
        timer.pausedTime += (now - timer.startTime) / 1000;
        console.log(`Paused timer ${timerId}`);
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
        // Pass function to check if timers are running
        await audioManager.startMetronome(() => {
          return this.timers.some((timer) => timer.status === 'running');
        });
        this.metronomeActive = true;
        console.log('Metronome started');
      } catch (error) {
        console.error('Failed to start metronome:', error);
        this.metronomeActive = false;
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
