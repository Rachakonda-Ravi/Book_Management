import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import axios from 'axios';

console.log('main.jsx: Starting app...');

// Configure axios with credentials
axios.defaults.withCredentials = true;

// Set default API URL
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
console.log('main.jsx: API URL:', apiUrl);
axios.defaults.baseURL = apiUrl;

// Add request interceptor for JWT token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('is_logged_in');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Check if root element exists
const rootElement = document.getElementById('root');
console.log('main.jsx: Root element found:', !!rootElement);

if (!rootElement) {
  console.error('CRITICAL: Root element #root not found!');
  document.body.innerHTML = '<h1 style="color: red; padding: 50px;">ERROR: Root element not found!</h1>';
} else {
  try {
    console.log('main.jsx: Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('main.jsx: Rendering app...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('main.jsx: App rendered successfully!');
  } catch (error) {
    console.error('CRITICAL ERROR rendering app:', error);
    document.body.innerHTML = '<h1 style="color: red; padding: 50px;">ERROR: ' + error.message + '</h1>';
  }
}
