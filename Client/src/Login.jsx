import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';

const Login = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Update tab based on route pathname
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // validation states
  const [validated, setValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;


  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (activeTab === 'register') {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setValidated(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let res;
      const payload = { username, password };
      if (activeTab === 'register') {
        payload.email = email || null;
      }
      
      if (activeTab === 'login') {
        res = await axios.post(`${apiBase}/auth/login`, { username, password });
      } else {
        res = await axios.post(`${apiBase}/auth/register`, payload);
      }
      
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('username', username);
      if (res.data.email) {
        localStorage.setItem('email', res.data.email);
      }
      
      const queryParams = new URLSearchParams(location.search);
      const next = queryParams.get('next');
      window.location.href = next || '/';
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setValidated(false);
    setValidationErrors({});
    setApiError(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={`flex justify-center items-center px-4 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`} style={{ minHeight: '65vh' }}>
      <div className={`max-w-md w-full rounded-2xl shadow-lg backdrop-blur-sm border p-8 transition-all ${
        isDark
          ? 'bg-slate-900/50 border-slate-700'
          : 'bg-white/80 border-slate-200'
      }`}>
        
        {/* Tab Headers */}
        <div className={`flex border-b mb-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button 
            type="button"
            className={`font-bold px-4 py-2 text-sm focus:outline-none cursor-pointer border-b-2 transition-all ${
              activeTab === 'login' 
                ? isDark ? 'border-purple-500 text-purple-400' : 'border-indigo-600 text-indigo-600'
                : isDark ? 'border-transparent text-slate-400 hover:text-slate-300' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            style={{ marginBottom: '-1px' }}
            onClick={() => switchTab('login')}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`font-bold px-4 py-2 text-sm focus:outline-none cursor-pointer border-b-2 transition-all ${
              activeTab === 'register' 
                ? isDark ? 'border-purple-500 text-purple-400' : 'border-indigo-600 text-indigo-600'
                : isDark ? 'border-transparent text-slate-400 hover:text-slate-300' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            style={{ marginBottom: '-1px' }}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        {apiError && (
          <div className={`rounded-lg p-4 mb-4 border ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-100 text-red-700'}`}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Username</label>
            <input 
              type="text" 
              className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                validated && validationErrors.username
                  ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                  : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {validated && validationErrors.username && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
            )}
          </div>

          {/* Email (only on Register tab) */}
          {activeTab === 'register' && (
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email (Optional)</label>
              <input 
                type="email" 
                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
            <input 
              type="password" 
              className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                validated && validationErrors.password
                  ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                  : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {validated && validationErrors.password && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password (only on Register tab) */}
          {activeTab === 'register' && (
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Confirm Password</label>
              <input 
                type="password" 
                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                  validated && validationErrors.confirmPassword
                    ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                    : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {validated && validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit button */}
          <button 
            type="submit" 
            className={`w-full py-2.5 rounded-lg font-bold mt-6 transition-colors cursor-pointer flex items-center justify-center shadow-sm ${
              isDark
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:from-indigo-700 hover:to-pink-600'
            }`}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
