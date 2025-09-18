import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de erro
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para monitoramento
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Enviar erro para serviço de monitoramento (se configurado)
    if (process.env.REACT_APP_ERROR_REPORTING_ENABLED === 'true') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error, errorInfo) => {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    console.log('Error report:', errorReport);
    
    // Exemplo de envio para API de monitoramento
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // }).catch(console.error);
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Ícone de erro */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Título e mensagem */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ops! Algo deu errado
            </h1>
            
            <p className="text-gray-600 mb-6">
              Encontramos um problema inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
            </p>

            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {isDevelopment && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Detalhes do Erro:</h3>
                <p className="text-sm text-red-700 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Contador de tentativas */}
            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Tentativas: {this.state.retryCount}
              </p>
            )}

            {/* Botões de ação */}
            <div className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                disabled={this.state.retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.state.retryCount >= 3 ? 'Muitas tentativas' : 'Tentar Novamente'}
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>

            {/* Informações de contato */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Precisa de ajuda?
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <a 
                  href="/contato" 
                  className="text-primary hover:underline"
                >
                  Contato
                </a>
                <a 
                  href="mailto:contato@amigodosamigos.org" 
                  className="text-primary hover:underline"
                >
                  Email
                </a>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para capturar erros em componentes funcionais
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  const captureError = (error, errorInfo = {}) => {
    console.error('Error captured:', error);
    setError({ error, errorInfo });
    
    // Reportar erro
    if (process.env.REACT_APP_ERROR_REPORTING_ENABLED === 'true') {
      // Integração com serviços de monitoramento
    }
  };

  React.useEffect(() => {
    if (error) {
      // Opcional: mostrar toast de erro ou modal
      console.error('Component error:', error);
    }
  }, [error]);

  return { error, captureError, resetError };
};

// Componente de erro para páginas específicas
export const PageError = ({ 
  title = 'Página não encontrada',
  message = 'A página que você está procurando não existe ou foi movida.',
  showRetry = false,
  onRetry,
  children
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-8 h-8 text-gray-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-8">{message}</p>
      
      {children || (
        <div className="space-y-3">
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      )}
    </div>
  </div>
);

export default ErrorBoundary;
