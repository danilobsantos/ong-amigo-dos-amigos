import React from 'react';
import { Heart } from 'lucide-react';

const LoadingSpinner = ({ size = 'medium', message = 'Carregando...', showHeart = true }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-8',
    xl: 'p-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      <div className="relative">
        {/* Spinner principal */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin`}></div>
        
        {/* Coração no centro (opcional) */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-3 h-3 text-primary animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Mensagem de loading */}
      {message && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Componente de loading para páginas inteiras
export const PageLoader = ({ message = 'Carregando página...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" message={message} />
      <div className="mt-8 space-y-2">
        <div className="h-2 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-2 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-2 bg-gray-200 rounded w-40 animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Componente de loading para cards
export const CardLoader = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-300"></div>
        <div className="p-6 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

// Componente de loading para listas
export const ListLoader = ({ count = 5 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
        <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Componente de loading inline
export const InlineLoader = ({ text = 'Carregando...' }) => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

// Componente de loading para botões
export const ButtonLoader = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;
