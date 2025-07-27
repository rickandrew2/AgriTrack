import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const InactivityTimer = () => {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const { resetInactivityTimer } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reset timer when user is active
  useEffect(() => {
    const handleActivity = () => {
      setTimeLeft(3600); // Reset to 1 hour
      resetInactivityTimer();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetInactivityTimer]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Only show warning when less than 10 minutes remaining
  if (timeLeft > 600) {
    return null;
  }

  const getWarningColor = () => {
    if (timeLeft <= 300) return 'text-red-600'; // 5 minutes or less
    if (timeLeft <= 600) return 'text-orange-600'; // 10 minutes or less
    return 'text-yellow-600';
  };

  const getBackgroundColor = () => {
    if (timeLeft <= 300) return 'bg-red-50 border-red-200'; // 5 minutes or less
    if (timeLeft <= 600) return 'bg-orange-50 border-orange-200'; // 10 minutes or less
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className={`fixed top-4 right-4 rounded-lg shadow-lg border p-3 z-50 ${getBackgroundColor()}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${timeLeft <= 300 ? 'bg-red-500' : 'bg-orange-500'} animate-pulse`}></div>
        <span className={`text-sm font-semibold ${getWarningColor()}`}>
          ⚠️ Session expires in: {formatTime(timeLeft)}
        </span>
      </div>
      {timeLeft <= 300 && (
        <div className="text-xs text-red-600 mt-1">
          Click anywhere to extend your session
        </div>
      )}
    </div>
  );
};

export default InactivityTimer; 