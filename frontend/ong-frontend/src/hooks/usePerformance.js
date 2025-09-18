import { useEffect, useState } from 'react';

// Hook para monitorar performance da página
export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    loading: true,
    loadTime: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    cumulativeLayoutShift: null,
    firstInputDelay: null
  });

  useEffect(() => {
    // Aguardar o carregamento completo da página
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          
          setMetrics(prev => ({
            ...prev,
            loading: false,
            loadTime: Math.round(loadTime)
          }));
        }

        // Medir Core Web Vitals
        if ('PerformanceObserver' in window) {
          // First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcp = entries[entries.length - 1];
            setMetrics(prev => ({
              ...prev,
              firstContentfulPaint: Math.round(fcp.startTime)
            }));
          });

          try {
            fcpObserver.observe({ entryTypes: ['paint'] });
          } catch (e) {
            console.warn('FCP observation not supported');
          }

          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            setMetrics(prev => ({
              ...prev,
              largestContentfulPaint: Math.round(lcp.startTime)
            }));
          });

          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            console.warn('LCP observation not supported');
          }

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            setMetrics(prev => ({
              ...prev,
              cumulativeLayoutShift: Math.round(clsValue * 1000) / 1000
            }));
          });

          try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            console.warn('CLS observation not supported');
          }

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fid = entries[0];
            setMetrics(prev => ({
              ...prev,
              firstInputDelay: Math.round(fid.processingStart - fid.startTime)
            }));
          });

          try {
            fidObserver.observe({ entryTypes: ['first-input'] });
          } catch (e) {
            console.warn('FID observation not supported');
          }
        }
      }
    };

    // Executar após o carregamento da página
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  return metrics;
};

// Hook para analytics simples
export const useAnalytics = () => {
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    startTime: null,
    pageViews: 0,
    timeOnSite: 0
  });

  useEffect(() => {
    // Gerar ID da sessão
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    setSessionData({
      sessionId,
      startTime,
      pageViews: 1,
      timeOnSite: 0
    });

    // Atualizar tempo no site a cada 30 segundos
    const interval = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        timeOnSite: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const trackPageView = (page) => {
    setSessionData(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1
    }));

    // Enviar dados para analytics (se configurado)
    if (process.env.REACT_APP_ANALYTICS_ENABLED === 'true') {
      console.log('Page view tracked:', page);
      // Aqui você pode integrar com Google Analytics, etc.
    }
  };

  const trackEvent = (category, action, label, value) => {
    const eventData = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: sessionData.sessionId
    };

    console.log('Event tracked:', eventData);
    
    // Enviar para analytics
    if (process.env.REACT_APP_ANALYTICS_ENABLED === 'true') {
      // Integração com serviços de analytics
    }
  };

  return {
    sessionData,
    trackPageView,
    trackEvent
  };
};

// Hook para detectar conexão lenta
export const useConnectionSpeed = () => {
  const [connectionInfo, setConnectionInfo] = useState({
    effectiveType: 'unknown',
    downlink: null,
    rtt: null,
    saveData: false
  });

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateConnectionInfo = () => {
        setConnectionInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || null,
          rtt: connection.rtt || null,
          saveData: connection.saveData || false
        });
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  const isSlowConnection = () => {
    return connectionInfo.effectiveType === 'slow-2g' || 
           connectionInfo.effectiveType === '2g' ||
           connectionInfo.saveData;
  };

  return {
    ...connectionInfo,
    isSlowConnection: isSlowConnection()
  };
};

// Hook para lazy loading de componentes
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, threshold]);

  return [setRef, isVisible];
};

// Hook para prefetch de recursos
export const usePrefetch = () => {
  const prefetchResource = (url, type = 'fetch') => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    if (type === 'image') {
      link.as = 'image';
    } else if (type === 'script') {
      link.as = 'script';
    } else if (type === 'style') {
      link.as = 'style';
    }

    document.head.appendChild(link);
  };

  const preloadResource = (url, type = 'fetch') => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (type === 'image') {
      link.as = 'image';
    } else if (type === 'script') {
      link.as = 'script';
    } else if (type === 'style') {
      link.as = 'style';
    }

    document.head.appendChild(link);
  };

  return {
    prefetchResource,
    preloadResource
  };
};

// Hook para otimização de imagens
export const useImageOptimization = () => {
  const getOptimizedImageUrl = (originalUrl, width, height, quality = 80) => {
    if (!originalUrl || originalUrl.includes('placeholder')) {
      return originalUrl;
    }

    // Para URLs externas ou CDN, adicionar parâmetros de otimização
    const url = new URL(originalUrl, window.location.origin);
    
    if (width) url.searchParams.set('w', width);
    if (height) url.searchParams.set('h', height);
    if (quality !== 80) url.searchParams.set('q', quality);

    return url.toString();
  };

  const generateSrcSet = (originalUrl, sizes = [320, 640, 768, 1024, 1280]) => {
    if (!originalUrl || originalUrl.includes('placeholder')) {
      return '';
    }

    return sizes
      .map(size => `${getOptimizedImageUrl(originalUrl, size)} ${size}w`)
      .join(', ');
  };

  return {
    getOptimizedImageUrl,
    generateSrcSet
  };
};

export default {
  usePerformance,
  useAnalytics,
  useConnectionSpeed,
  useLazyLoading,
  usePrefetch,
  useImageOptimization
};
