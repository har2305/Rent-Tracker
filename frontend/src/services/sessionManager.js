import authService from './authService';

class SessionManager {
  constructor() {
    this.sessionTimeout = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.warningTimeout = 5 * 60 * 1000; // 5 minutes warning
    this.countdownTimeout = 2 * 60 * 1000; // 2 minutes countdown
    this.timer = null;
    this.warningTimer = null;
    this.countdownTimer = null;
    this.lastActivity = Date.now();
    this.isActive = false;
    this.onLogout = null;
    this.onWarning = null;
    this.onCountdown = null;
    
    this.setupActivityListeners();
  }

  // Start session monitoring
  start() {
    if (!authService.isAuthenticated()) return;
    
    this.isActive = true;
    this.lastActivity = Date.now();
    this.resetTimers();
  }

  // Stop session monitoring
  stop() {
    this.isActive = false;
    this.clearTimers();
  }

  // Reset timers when user activity is detected
  resetTimers() {
    if (!this.isActive) return;
    
    this.clearTimers();
    this.lastActivity = Date.now();
    
    // Set warning timer (5 minutes before logout)
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, this.sessionTimeout - this.warningTimeout);
    
    // Set countdown timer (2 minutes before logout)
    this.countdownTimer = setTimeout(() => {
      this.startCountdown();
    }, this.sessionTimeout - this.countdownTimeout);
    
    // Set logout timer (15 minutes total)
    this.timer = setTimeout(() => {
      this.logout();
    }, this.sessionTimeout);
  }

  // Clear all timers
  clearTimers() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  // Show warning at 5 minutes
  showWarning() {
    if (this.onWarning) {
      this.onWarning();
    }
  }

  // Start countdown at 2 minutes
  startCountdown() {
    if (this.onCountdown) {
      this.onCountdown();
    }
  }

  // Perform logout
  logout() {
    this.stop();
    authService.logout();
    if (this.onLogout) {
      this.onLogout();
    }
  }

  // Get remaining time in seconds
  getRemainingTime() {
    if (!this.isActive) return 0;
    const elapsed = Date.now() - this.lastActivity;
    const remaining = this.sessionTimeout - elapsed;
    return Math.max(0, Math.floor(remaining / 1000));
  }

  // Get remaining time in minutes and seconds
  getRemainingTimeFormatted() {
    const seconds = this.getRemainingTime();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return {
      minutes,
      seconds: remainingSeconds,
      totalSeconds: seconds
    };
  }

  // Check if we're in warning period (last 5 minutes)
  isInWarningPeriod() {
    const remaining = this.getRemainingTime();
    return remaining <= this.warningTimeout / 1000;
  }

  // Check if we're in countdown period (last 2 minutes)
  isInCountdownPeriod() {
    const remaining = this.getRemainingTime();
    return remaining <= this.countdownTimeout / 1000;
  }

  // Setup activity listeners
  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        if (this.isActive) {
          this.resetTimers();
        }
      }, true);
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, pause timers
        this.clearTimers();
      } else if (this.isActive) {
        // Page is visible again, resume timers
        this.resetTimers();
      }
    });

    // Handle beforeunload (page close)
    window.addEventListener('beforeunload', () => {
      if (this.isActive) {
        this.logout();
      }
    });
  }

  // Set callback functions
  setCallbacks({ onLogout, onWarning, onCountdown }) {
    this.onLogout = onLogout;
    this.onWarning = onWarning;
    this.onCountdown = onCountdown;
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
