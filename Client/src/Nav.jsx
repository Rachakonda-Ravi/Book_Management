import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from './ThemeContext';

const Nav = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';

  const handleLogout = () => {
    axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`)
      .finally(() => {
        localStorage.removeItem('is_logged_in');
        navigate('/login');
        window.location.reload();
      });
  };

  return (
    <nav className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} border-b py-4 shadow-sm mb-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Logo - Bookish styled "Library" */}
        <Link 
          to="/" 
          className={`flex items-center gap-2 hover:opacity-90 transition-opacity`}
        >
          <span className="text-3xl">📖</span> 
          <span className={`text-2xl font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`} style={{fontFamily: "'Georgia', 'Garamond', serif", fontStyle: 'italic'}}>
            Library
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`font-semibold transition-colors text-sm ${isDark ? 'text-slate-300 hover:text-purple-400' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            Books
          </Link>
          <Link 
            to="/profile" 
            className={`font-semibold transition-colors text-sm ${isDark ? 'text-slate-300 hover:text-purple-400' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            Profile
          </Link>
          {isLoggedIn && (
            <Link 
              to="/create" 
              className={`font-semibold transition-colors text-sm ${isDark ? 'text-slate-300 hover:text-purple-400' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              Add Book
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:shadow-lg hover:shadow-cyan-500/50' 
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
            }`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <button 
              className={`font-semibold transition-colors text-sm px-4 py-1.5 rounded-full border ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-3">
              <Link 
                to="/login" 
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors text-center border ${
                  isDark
                    ? 'border-purple-500 text-purple-400 hover:bg-purple-500/10'
                    : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors text-center shadow-sm ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
