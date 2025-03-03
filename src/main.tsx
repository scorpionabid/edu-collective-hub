
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Import initialization first
import { initializeApplication } from './lib/init';
import { loadPolyfillsIfNeeded } from './lib/browser/featureDetection';

// Import error boundary
import { GlobalErrorBoundary } from './components/monitoring/ErrorBoundary';

// Initialize the application and load polyfills if needed
const startApp = async () => {
  // Initialize the application
  initializeApplication();
  
  // Load polyfills if needed
  await loadPolyfillsIfNeeded();
  
  // Then continue with normal rendering
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <GlobalErrorBoundary>
              <App />
            </GlobalErrorBoundary>
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

// Start the application
startApp().catch(error => {
  console.error('Failed to start application:', error);
  
  // Fallback rendering in case of startup error
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1 style="color: #e11d48;">Application Error</h1>
        <p>Sorry, the application failed to start. Please try reloading the page.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
});
