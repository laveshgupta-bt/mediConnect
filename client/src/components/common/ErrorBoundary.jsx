import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-3xl border-2 border-red-300 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-black">
            ⚠
          </div>
          <h2 className="text-xl font-black text-navy-900">
            {this.props.title || 'Component Render Recovery'}
          </h2>
          <p className="text-xs text-navy-600 font-mono bg-red-50 p-3 rounded-xl border border-red-200 text-left overflow-auto max-h-40">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-800 text-xs font-bold transition-all"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
