import React, { useState, useEffect } from 'react';
import sessionManager from '../services/sessionManager';

const SessionWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set up callbacks
    sessionManager.setCallbacks({
      onLogout: () => {
        // Redirect to login page
        window.location.href = '/login';
      },
      onWarning: () => {
        setShowWarning(true);
      },
      onCountdown: () => {
        setShowCountdown(true);
        setShowWarning(false);
      }
    });

    // Start session monitoring
    sessionManager.start();

    // Update countdown timer every second when in countdown mode
    const countdownInterval = setInterval(() => {
      if (sessionManager.isInCountdownPeriod()) {
        const remaining = sessionManager.getRemainingTimeFormatted();
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, []);

  const handleStayLoggedIn = () => {
    sessionManager.resetTimers();
    setShowWarning(false);
    setShowCountdown(false);
  };

  const handleLogout = () => {
    sessionManager.logout();
  };

  // Don't render anything if no warnings are active
  if (!showWarning && !showCountdown) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {showWarning && (
          <div className="text-center">
            <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Session Timeout Warning
            </h3>
            <p className="text-gray-600 mb-6">
              Your session will expire in 5 minutes due to inactivity. 
              Would you like to stay logged in?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Logout Now
              </button>
            </div>
          </div>
        )}

        {showCountdown && (
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⏰</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Session Expiring Soon
            </h3>
            <div className="text-3xl font-bold text-red-600 mb-4">
              {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <p className="text-gray-600 mb-6">
              Your session will expire in {timeLeft.minutes} minute{timeLeft.minutes !== 1 ? 's' : ''} and {timeLeft.seconds} second{timeLeft.seconds !== 1 ? 's' : ''}.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Logout Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionWarning;
