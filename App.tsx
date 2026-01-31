
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import About from './pages/About';
import { UserProfile, AuthState } from './types';

const App: React.FC = () => {
  // Synchronous initialization to prevent "flash" of logout on refresh
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('hireflow_user');
    if (saved) {
      try {
        return { user: JSON.parse(saved), isAuthenticated: true };
      } catch (e) {
        return { user: null, isAuthenticated: false };
      }
    }
    return { user: null, isAuthenticated: false };
  });

  // Keep state and localStorage in sync if user profile updates
  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('hireflow_user', JSON.stringify(authState.user));
    }
  }, [authState.user]);

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    const newUser: UserProfile = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name || 'User',
      email: userData.email,
      cvsGenerated: 0,
      jobsApplied: 0,
      plan: 'free',
    };
    setAuthState({ user: newUser, isAuthenticated: true });
  };

  const handleLoginSuccess = (email: string) => {
    const mockUser: UserProfile = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: email,
      cvsGenerated: 0,
      jobsApplied: 0,
      plan: 'free',
    };
    setAuthState({ user: mockUser, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('hireflow_user');
    setAuthState({ user: null, isAuthenticated: false });
  };

  const incrementStats = () => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, cvsGenerated: prev.user.cvsGenerated + 1 } : null
      }));
    }
  };

  return (
    <Router>
      <Layout 
        isAuthenticated={authState.isAuthenticated} 
        user={authState.user} 
        onLogout={logout}
      >
        <div className="page-wrapper min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/login" 
              element={!authState.isAuthenticated ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/signup" 
              element={!authState.isAuthenticated ? <SignUp onSignUp={handleAuthSuccess} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={authState.isAuthenticated ? <Dashboard user={authState.user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/generator" 
              element={authState.isAuthenticated ? <Generator user={authState.user} onAssetCreated={incrementStats} /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
};

export default App;
