import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical Failure: Root element not found");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Signal success immediately after render call
    if ((window as any).onAppMounted) {
      (window as any).onAppMounted();
    }
  } catch (err) {
    console.error("Mounting Error:", err);
  }
};

// Handle both direct execution and late DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
