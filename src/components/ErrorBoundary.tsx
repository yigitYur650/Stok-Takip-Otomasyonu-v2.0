import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Global Error Boundary (React Uygulaması çökmelerinde beyaz ekran yerine Fallback UI gösterir)
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Context Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Üzgünüz, bir şeyler ters gitti.</h2>
          <p>Uygulama çalışırken beklenmedik bir durum gerçekleşti.</p>
          <pre style={{ color: 'red', marginTop: '1rem', marginBottom: '1rem' }}>
            {this.state.errorMessage}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Arayüzü Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
