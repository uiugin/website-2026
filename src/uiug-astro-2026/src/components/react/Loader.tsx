import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, Zap } from 'lucide-react';

interface LoaderProps {
  onComplete: () => void;
}

const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const messages = [
    "INITIALIZING_CORE...",
    "CALIBRATING_STUDS...",
    "CONNECTING_TO_INDIA_NODE...",
    "ALLOCATING_PLASTIC_MEMORY...",
    "BUILDING_DOM_STRUCTURE...",
    "RENDERING_BRICKS...",
    "SYSTEM_READY."
  ];

  useEffect(() => {
    // Message cycling
    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 450);

    // Progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(msgInterval);
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 800); // Wait for exit animation
          return 100;
        }
        // Random increments for realistic "loading" feel
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 50);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  // Generate a grid of blocks based on progress
  // 5x4 grid = 20 blocks. Each 5% progress fills one block.
  const totalBlocks = 20;
  const filledBlocks = Math.floor((progress / 100) * totalBlocks);

  return (
    <div className={`fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] ${isExiting ? '-translate-y-full' : 'translate-y-0'}`}>
      
      {/* Background Texture */}
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none"></div>
      
      {/* Main Loader Card */}
      <div className="relative w-full max-w-md p-2">
        <div className="bg-accent-yellow border-4 border-black dark:border-white p-6 md:p-10 shadow-brutal-black dark:shadow-brutal-white plastic-surface relative overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-4">
                <div className="flex flex-col">
                    <span className="font-display font-black text-4xl uppercase text-black leading-none">UIUG</span>
                    <span className="font-mono text-xs font-bold text-black">SYSTEM_BOOT_SEQUENCE</span>
                </div>
                <Cpu className="w-8 h-8 text-black animate-spin-slow" />
            </div>

            {/* The Brick Grid Visualization */}
            <div className="grid grid-cols-5 gap-2 mb-8">
                {Array.from({ length: totalBlocks }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`aspect-square border-2 border-black transition-all duration-100 ${
                            i < filledBlocks 
                            ? 'bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform scale-100' 
                            : 'bg-white opacity-20 transform scale-90'
                        }`}
                    >
                        {/* Tiny Stud Detail */}
                        {i < filledBlocks && (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-1/2 h-1/2 rounded-full border border-black/20 bg-black/10"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Terminal Output */}
            <div className="bg-black p-4 border-2 border-black mb-4 min-h-[80px] flex flex-col justify-end">
                <div className="font-mono text-xs text-green-500 font-bold flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    <span className="uppercase">{messages[Math.min(messageIndex, messages.length - 1)]}</span>
                </div>
                <div className="w-full bg-gray-800 h-1 mt-2 overflow-hidden">
                    <div 
                        className="h-full bg-green-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Percentage Big Number */}
            <div className="absolute bottom-4 right-6 opacity-20 pointer-events-none">
                <span className="font-display font-black text-8xl text-black">{progress}%</span>
            </div>

            {/* Corner Deco */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-primary border border-black rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-10 font-mono text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse">
        /// ASSEMBLING_COMPONENTS ///
      </div>

    </div>
  );
};

export default Loader;

