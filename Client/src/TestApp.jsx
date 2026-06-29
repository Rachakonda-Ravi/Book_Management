import { useState } from 'react';

function TestApp() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0F172A' : '#fff',
      color: isDark ? '#fff' : '#000',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Library App - Debug Test</h1>
      <p>If you see this text, React is rendering correctly!</p>
      
      <button 
        onClick={() => setIsDark(!isDark)}
        style={{
          padding: '10px 20px',
          background: isDark ? '#fff' : '#000',
          color: isDark ? '#000' : '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Toggle Theme ({isDark ? 'Dark' : 'Light'})
      </button>
      
      <div style={{ marginTop: '40px', border: '1px solid #ccc', padding: '20px' }}>
        <h2>Debug Info:</h2>
        <p>- React is loaded: YES</p>
        <p>- App component rendering: YES</p>
        <p>- Button is clickable: YES</p>
      </div>
    </div>
  );
}

export default TestApp;
