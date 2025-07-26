import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/login';
import Dashboard from './pages/dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app start
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  // Public Route component (redirects to dashboard if already authenticated)
  const PublicRoute = ({ children }) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Login onLoginSuccess={() => setIsAuthenticated(true)} />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard onLogout={() => setIsAuthenticated(false)} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
