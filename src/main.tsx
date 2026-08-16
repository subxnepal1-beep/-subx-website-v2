import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety catch for any transient unhandled exceptions in browser/iframe sandbox
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    try {
      if (event?.reason) {
        console.warn('Suppressed unhandled promise rejection:', event.reason);
      }
    } catch {}
    event.preventDefault?.();
    return true;
  });

  window.addEventListener('error', (event) => {
    try {
      if (event?.message) {
        console.warn('Suppressed window error:', event.message);
      }
    } catch {}
    event.preventDefault?.();
    return true;
  });
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('RootErrorBoundary caught an issue:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 text-2xl font-bold">
            SubX
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-100">Something interrupted the preview</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            Click reload below to refresh the SubX Store application cleanly.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reload Store
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);



