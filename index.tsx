import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('SmartSpend: Booting sequence initiated.');

// Immediate signal to indicate script execution has reached this file
if (typeof (window as any).onAppMounted === 'function') {
  console.log('SmartSpend: Signaling early mount to clear loader.');
  (window as any).onAppMounted();
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('SmartSpend: React tree rendered successfully.');
  } catch (err) {
    console.error("SmartSpend: Bootstrapper Failure:", err);
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.innerText = "Runtime Initialization Failed";
  }
} else {
  console.error("SmartSpend: Critical - Root mount point missing from DOM.");
}