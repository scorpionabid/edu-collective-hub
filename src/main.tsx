
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Import initialization first
import { initializeApplication } from './lib/init';

// Import error boundary
import { GlobalErrorBoundary } from './components/monitoring/ErrorBoundary';

// Initialize the application
initializeApplication();

// Then continue with normal imports
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
