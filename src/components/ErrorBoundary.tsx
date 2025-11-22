import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#000',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    minHeight: '100vh'
                }}>
                    <h1 style={{ color: '#f87171' }}>⚠️ Application Error</h1>
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
                        <summary style={{ cursor: 'pointer', color: '#60a5fa' }}>
                            Click for error details
                        </summary>
                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#1f2937', borderRadius: '4px' }}>
                            <strong>Error:</strong>
                            <pre>{this.state.error && this.state.error.toString()}</pre>
                            <strong>Stack:</strong>
                            <pre>{this.state.error && this.state.error.stack}</pre>
                            <strong>Component Stack:</strong>
                            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </div>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
