import { useState, useEffect, useCallback, useRef } from 'react';
import { buildApiUrl } from '../config/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const logoutRef = useRef(null);

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Set new timeout for 1 hour (60 minutes)
    inactivityTimeoutRef.current = setTimeout(() => {
      console.log('User inactive for 1 hour, logging out...');
      if (logoutRef.current) {
        logoutRef.current();
      }
      // Redirect to login page
      window.location.href = '/';
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    // Update last activity time
    lastActivityRef.current = Date.now();
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch(buildApiUrl('/users/verify'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        // Token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    // Clear inactivity timer
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Store logout function in ref to avoid dependency issues
  logoutRef.current = logout;

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    // Start inactivity timer after login
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up periodic auth check and inactivity monitoring
  useEffect(() => {
    if (isAuthenticated) {
      // Start inactivity timer
      resetInactivityTimer();

      // Set up activity listeners
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      const handleActivity = () => {
        resetInactivityTimer();
      };

      // Add event listeners
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      // Periodic auth check (every 5 minutes)
      const authInterval = setInterval(() => {
        checkAuth();
      }, 5 * 60 * 1000); // 5 minutes

      // Cleanup function
      return () => {
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
        clearInterval(authInterval);
      };
    }
  }, [isAuthenticated, checkAuth, resetInactivityTimer]);

  return {
    isAuthenticated,
    user,
    isLoading,
    checkAuth,
    logout,
    login,
    resetInactivityTimer, // Expose this for manual reset if needed
  };
}; 