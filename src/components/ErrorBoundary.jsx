import React from 'react';

/**
 * Admin Portal Error Boundary
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 [Admin ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0'
          }}>
            <h2 style={{
              fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#520612',
              marginBottom: '8px'
            }}>
              Admin Dashboard Error
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              An unexpected error occurred while rendering this section.
            </p>
            {this.state.error && (
              <div style={{
                textAlign: 'left',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '20px',
                fontSize: '0.75rem',
                color: '#991B1B',
                overflowX: 'auto',
                fontFamily: 'monospace'
              }}>
                {this.state.error.toString()}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reload
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  backgroundColor: '#520612',
                  border: '1px solid #520612',
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
