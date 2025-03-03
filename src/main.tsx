
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
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
    <QueryProvider>
      <AuthProvider>
        <GlobalErrorBoundary>
          <App />
          <Toaster />
        </GlobalErrorBoundary>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>
);
