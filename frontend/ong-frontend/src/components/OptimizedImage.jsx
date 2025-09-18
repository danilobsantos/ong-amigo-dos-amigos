import React, { useState, useRef, useEffect } from 'react';
import LazyLoad from 'react-lazyload';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = '/images/placeholder.jpg',
  lazy = true,
  quality = 80,
  sizes,
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef(null);

  // Gerar URLs otimizadas para diferentes tamanhos
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || baseSrc.includes('placeholder') || baseSrc.includes('api/placeholder')) {
      return '';
    }

    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  // Detectar se a imagem está no viewport
  useEffect(() => {
    if (!lazy || priority) {
      loadImage();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, src]);

  const loadImage = () => {
    if (!src || hasError) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      setHasError(true);
      setCurrentSrc(placeholder);
      if (onError) onError();
    };
    
    img.src = src;
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setHasError(true);
    setCurrentSrc(placeholder);
    if (onError) onError();
  };

  const imageClasses = `
    transition-opacity duration-300 ease-in-out
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
    ${className}
  `.trim();

  const ImageComponent = () => (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={imageClasses}
      width={width}
      height={height}
      srcSet={generateSrcSet(src)}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      loading={priority ? 'eager' : 'lazy'}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...props}
    />
  );

  // Se não for lazy loading ou for prioridade, renderizar diretamente
  if (!lazy || priority) {
    return <ImageComponent />;
  }

  // Usar LazyLoad para imagens não prioritárias
  return (
    <LazyLoad
      height={height || 200}
      offset={100}
      placeholder={
        <div 
          className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <svg
            className="w-8 h-8 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      }
    >
      <ImageComponent />
    </LazyLoad>
  );
};

// Componente específico para imagens de cães
export const DogImage = ({ dog, size = 'medium', className = '', ...props }) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-64 h-64',
    full: 'w-full h-48 md:h-64'
  };

  return (
    <OptimizedImage
      src={dog.images?.[0] || '/images/default-dog.jpg'}
      alt={`${dog.name} - ${dog.breed || 'SRD'} para adoção`}
      className={`object-cover rounded-lg ${sizeClasses[size]} ${className}`}
      placeholder="/images/dog-placeholder.jpg"
      {...props}
    />
  );
};

// Componente para imagens do blog
export const BlogImage = ({ post, className = '', ...props }) => {
  return (
    <OptimizedImage
      src={post.image || '/images/blog-default.jpg'}
      alt={post.title}
      className={`object-cover rounded-lg ${className}`}
      placeholder="/images/blog-placeholder.jpg"
      {...props}
    />
  );
};

// Componente para avatar/foto de perfil
export const Avatar = ({ src, alt, size = 'medium', className = '', ...props }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <OptimizedImage
      src={src || '/images/default-avatar.jpg'}
      alt={alt || 'Avatar'}
      className={`object-cover rounded-full ${sizeClasses[size]} ${className}`}
      placeholder="/images/avatar-placeholder.jpg"
      {...props}
    />
  );
};

// Hook para pré-carregar imagens importantes
export const useImagePreloader = (imageUrls) => {
  useEffect(() => {
    if (!Array.isArray(imageUrls)) return;

    const preloadImages = imageUrls.map(url => {
      const img = new Image();
      img.src = url;
      return img;
    });

    return () => {
      preloadImages.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);
};

// Componente para galeria de imagens otimizada
export const ImageGallery = ({ images, alt, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <span className="text-gray-500">Nenhuma imagem disponível</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={images[currentIndex]}
        alt={`${alt} - Imagem ${currentIndex + 1}`}
        className="w-full h-64 object-cover rounded-lg"
        priority={currentIndex === 0}
      />
      
      {images.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            ←
          </button>
          
          <button
            onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            →
          </button>
        </>
      )}
    </div>
  );
};

export default OptimizedImage;
