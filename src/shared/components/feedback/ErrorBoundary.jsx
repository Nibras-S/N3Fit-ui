import React from 'react';

/**
 * Top-level Error Boundary.
 *
 * Wraps the whole application so that an uncaught render error in any
 * child component shows a recoverable fallback instead of a blank screen.
 *
 * In production we just log to console; wire this up to Sentry / Datadog
 * later by replacing the body of `componentDidCatch`.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Surface in dev; replace with proper observability in prod.
        // eslint-disable-next-line no-console
        console.error('[ErrorBoundary] Caught:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        // Hard reload as a recovery option.
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            The page hit an unexpected error. You can try reloading.
                            If it keeps happening, please contact support.
                        </p>
                        {process.env.NODE_ENV !== 'production' && this.state.error && (
                            <pre className="text-xs text-left text-zinc-900 bg-zinc-50 p-3 rounded mb-6 overflow-auto max-h-40">
                                {String(this.state.error?.message || this.state.error)}
                            </pre>
                        )}
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="inline-flex items-center px-6 py-2 bg-zinc-900 text-white font-medium rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
