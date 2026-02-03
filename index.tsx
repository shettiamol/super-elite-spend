import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Signal readiness to the loading screen in index.html
    if (typeof (window as any).onAppMounted === 'function') {
      (window as any).onAppMounted();
    }
  } catch (err) {
    console.error("Bootstrapper Failure:", err);
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.innerText = "Runtime Initialization Failed";
  }
} else {
  console.error("Critical: Root mount point missing from DOM.");
}