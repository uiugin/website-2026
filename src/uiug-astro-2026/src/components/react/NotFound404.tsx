import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound404: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const splineRef = useRef<any>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spline 404 scene
  const sceneUrl = 'https://prod.spline.design/qThvraxcn3H54Udn/scene.splinecode';

  const handleLoad = (spline: any) => {
    splineRef.current = spline;
    // Clear any timeout
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

  // Set a maximum loading time - if scene takes too long, hide loader
  useEffect(() => {
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 2000); // Hide loader after 2 seconds max

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isLoading]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black dark:bg-white overflow-hidden">
      {/* Spline Scene Container */}
      <div className="absolute inset-0 w-full h-full">
        {!hasError ? (
          <Spline
            scene={sceneUrl}
            onLoad={handleLoad}
            onError={handleError}
            style={{ width: '100%', height: '100%' }}
            // Optimize rendering
            renderOnDemand={false}
          />
        ) : (
          // Fallback if scene fails to load
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🦕</div>
              <p className="text-xl">Scene failed to load</p>
            </div>
          </div>
        )}
        
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

