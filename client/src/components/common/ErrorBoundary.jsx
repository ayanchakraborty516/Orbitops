import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log safely without sensitive tokens
    console.error('[OrbitOps ErrorBoundary Catch]:', error?.message || error, errorInfo?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F3EFE7] dark:bg-[#161714] text-[#24251F] dark:text-[#EDE8DF]">
          <div className="w-full max-w-lg p-8 rounded-2xl border border-[#C65D3A]/30 bg-[#FAF7F2] dark:bg-[#20221E] shadow-xl text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#C65D3A]/10 border border-[#C65D3A]/25 flex items-center justify-center text-[#C65D3A]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C65D3A] dark:text-[#D97753]">
                SYSTEM RUNTIME // FAULT RECOVERY
              </span>
              <h2 className="text-xl font-serif font-medium text-[#24251F] dark:text-[#F3EFE7]">
                Interface Render Disruption
              </h2>
              <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] font-sans leading-relaxed">
                An unhandled rendering fault occurred while assembling operational telemetry. Your authentication session and workspace records remain intact.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-[#ECE7DE]/50 dark:bg-[#161714]/60 border border-[#D8D0C3] dark:border-[#353831] text-left">
                <p className="text-[11px] font-mono text-[#7C7E74] dark:text-[#9A9C92] uppercase tracking-wider mb-1">Diagnostic Detail</p>
                <p className="text-xs font-mono text-[#C65D3A] dark:text-[#D97753] break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#24251F] dark:bg-[#FAF7F2] text-[#F3EFE7] dark:text-[#24251F] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Interface</span>
              </button>
              <a
                href="/app/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] text-xs font-medium text-[#24251F] dark:text-[#F3EFE7] hover:bg-[#E5DED2]/50 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Desk</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
