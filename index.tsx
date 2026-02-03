import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical: React mount failed", error);
    const status = document.getElementById('status-text');
    if (status) status.innerText = "Runtime Handshake Failed";
  }
} else {
  console.error("Critical: Root element not found in DOM");
}
