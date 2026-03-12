import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Home, ArrowLeft } from 'lucide-react';

const sceneUrl = 'https://prod.spline.design/qThvraxcn3H54Udn/scene.splinecode';

const NotFound404: React.FC = () => {
  type SplineProps = {
    scene: string;
    onLoad: (spline: any) => void;
    onError: () => void;
    style: React.CSSProperties;
    renderOnDemand?: boolean;
  };
  const [SplineComponent, setSplineComponent] = useState<React.ComponentType<SplineProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const splineRef = useRef<any>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    import('@splinetool/react-spline').then((mod) => {
      setSplineComponent(mod.default as React.ComponentType<SplineProps>);
    });
  }, []);

  const handleLoad = (spline: any) => {
    splineRef.current = spline;
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
  };

  const handleError = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
    setHasError(true);
  };

  useEffect(() => {
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 2000);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isLoading]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black dark:bg-white overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {!hasError && SplineComponent ? (
          <Suspense fallback={<div className="w-full h-full bg-black dark:bg-white" />}>
            <SplineComponent
              scene={sceneUrl}
              onLoad={handleLoad}
              onError={handleError}
              style={{ width: '100%', height: '100%' }}
              renderOnDemand={false}
            />
          </Suspense>
        ) : hasError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🦕</div>
              <p className="text-xl">Scene failed to load</p>
            </div>
          </div>
        ) : null}
        
        {/* Loading State - Minimal, fades out quickly */}
        {/* {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 dark:bg-white/80 backdrop-blur-sm z-10 transition-opacity duration-300">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-primary border-t-transparent animate-spin mx-auto mb-2"></div>
              <p className="font-mono font-bold text-white dark:text-black uppercase text-xs">LOADING...</p>
            </div>
          </div>
        )} */}
      </div>

      {/* Overlay Content - Top Left, No Background */}
      <div className="absolute top-0 left-0 z-20 pointer-events-none p-6 md:p-8">
        <div className="pointer-events-auto">
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase text-white mb-3 leading-none drop-shadow-[0_0_20px_rgba(0,0,0,0.8),0_0_10px_rgba(168,85,247,0.6)]">
            ARE YOU LOST?
          </h1>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="/"
              className="group bg-white/90 hover:bg-white text-black border-4 border-white px-4 py-2 font-display text-sm uppercase transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(168,85,247,0.6)] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Home className="w-4 h-4" />
              RETURN_HOME
            </a>
            <button
              onClick={() => window.history.back()}
              className="group bg-purple-600/90 hover:bg-purple-500 border-4 border-purple-300 text-white px-4 py-2 font-display text-sm uppercase transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(168,85,247,0.6)] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              GO_BACK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound404;

