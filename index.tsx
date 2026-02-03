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
  } catch (error) {
    console.error("SmartSpend Boot Error:", error);
    const status = document.getElementById('status-text');
    if (status) status.innerText = "System Failure: Handshake Aborted";
  }
} else {
  console.error("SmartSpend Critical: Root element not found.");
}