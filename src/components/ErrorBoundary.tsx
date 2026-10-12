import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Terjadi Kendala Memuat Aplikasi
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Aplikasi mendeteksi kendala pada sistem. Silakan muat ulang halaman atau bersihkan cache browser untuk melanjutkan.
            </p>
            {this.state.error && (
              <div className="bg-slate-100 rounded-xl p-3 text-left text-xs font-mono text-slate-700 mb-6 overflow-x-auto max-h-32">
                {this.state.error.message || 'Unknown error'}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                onClick={this.handleClearCache}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Reset Cache & Buka</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
