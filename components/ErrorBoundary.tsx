import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-royalblue flex items-center justify-center p-4 font-sans text-swanwing">
          <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-md shadow-2xl">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
               <AlertTriangle className="text-red-400" size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-swanwing mb-2">Spilled the drink!</h1>
            <p className="text-shellstone mb-6 text-sm">Something went wrong while mixing that request. We've logged the spill and are cleaning it up.</p>
            
            {this.state.error && (
                <div className="bg-black/20 p-4 rounded-lg text-left mb-6 overflow-auto max-h-32 border border-white/5">
                    <p className="text-[10px] text-shellstone uppercase font-bold mb-1">Error Details:</p>
                    <code className="text-xs text-red-300 font-mono break-words">{this.state.error.message}</code>
                </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-quicksand text-royalblue font-bold py-3 rounded-xl hover:bg-quicksand/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}