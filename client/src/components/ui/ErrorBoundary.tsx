import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // In production, this is where we would send the error to Sentry or another tracking service
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl flex flex-col items-center text-center border border-danger/30 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong.</h1>
            <p className="text-text-secondary mb-8">
              We encountered an unexpected error. Please try reloading the page.
            </p>
            <Button onClick={this.handleReload} variant="primary" className="w-full">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 p-4 bg-black/50 rounded-xl w-full text-left overflow-auto">
                <p className="text-danger font-mono text-xs whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
