# Automatic Logout System

## Overview

The RentTracker application now includes an automatic logout system that enhances security by logging out users after periods of inactivity.

## Features

### ⏰ Session Timeout
- **15 minutes** of inactivity triggers automatic logout
- **5 minutes** before logout: Warning dialog appears
- **2 minutes** before logout: Countdown timer with seconds display

### 🔄 Activity Detection
The system monitors user activity through:
- Mouse movements and clicks
- Keyboard input
- Scrolling
- Touch events
- Page interactions

### 🚨 Warning System
1. **5-minute warning**: Yellow warning dialog with "Stay Logged In" option
2. **2-minute countdown**: Red countdown timer showing remaining time
3. **Automatic logout**: User is logged out and redirected to login page

### 📱 Page Management
- **Tab switching**: Timers pause when page is hidden
- **Page close**: Immediate logout when user closes the page
- **Return to page**: Timers resume when user returns to the page

## How It Works

### Session Manager (`sessionManager.js`)
- Manages all timer logic and activity detection
- Handles warning and countdown callbacks
- Integrates with authentication service

### Session Warning Component (`SessionWarning.js`)
- Displays warning and countdown dialogs
- Provides user interaction options
- Updates countdown timer in real-time

### Integration Points
- **Login**: Session monitoring starts automatically
- **Logout**: Session monitoring stops
- **Protected Routes**: Session monitoring restarts
- **Activity**: Timers reset on any user interaction

## Testing

### Manual Testing
1. **Login** to the application
2. **Stop interacting** with the page
3. **Wait 5 minutes** to see the warning dialog
4. **Wait 2 more minutes** to see the countdown
5. **Wait for automatic logout** or click "Stay Logged In"

### Background Operation
The session management runs completely in the background:
- No visible indicators during normal operation
- Warnings only appear when necessary
- Seamless user experience

## Configuration

### Timeout Settings
```javascript
// In sessionManager.js
this.sessionTimeout = 15 * 60 * 1000; // 15 minutes
this.warningTimeout = 5 * 60 * 1000;  // 5 minutes
this.countdownTimeout = 2 * 60 * 1000; // 2 minutes
```

### Activity Events
```javascript
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
```

## Security Benefits

1. **Prevents unauthorized access** to user accounts
2. **Protects sensitive data** when users forget to logout
3. **Complies with security best practices**
4. **Handles edge cases** like page close and tab switching

## User Experience

- **Non-intrusive**: Only shows warnings when necessary
- **User-friendly**: Clear options to stay logged in or logout
- **Visual feedback**: Color-coded warnings and countdown
- **Responsive**: Works on desktop and mobile devices

## Browser Compatibility

- **Modern browsers**: Full functionality
- **Mobile browsers**: Touch events supported
- **Page visibility API**: Tab switching detection
- **Beforeunload event**: Page close detection

## Troubleshooting

### Session not starting
- Check if user is authenticated
- Verify sessionManager.start() is called
- Check browser console for errors

### Warnings not showing
- Verify activity detection is working
- Check timer calculations
- Ensure callbacks are properly set

### Countdown not updating
- Check setInterval is running
- Verify time formatting functions
- Ensure component is re-rendering

## Future Enhancements

- **Configurable timeouts** via user preferences
- **Remember me** functionality
- **Session extension** via API calls
- **Multiple tab synchronization**
- **Custom warning messages**
