import React from 'react';
import ReactDOM from 'react-dom/client';
import TestApp from './TestApp.jsx';

console.log('main.jsx: Starting app...');

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
        <TestApp />
      </React.StrictMode>
    );
    console.log('main.jsx: App rendered successfully!');
  } catch (error) {
    console.error('CRITICAL ERROR rendering app:', error);
    document.body.innerHTML = `<h1 style="color: red; padding: 50px;">ERROR: ${error.message}</h1>`;
  }
}
