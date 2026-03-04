import React, { useState, useRef, useEffect } from 'react';
import { Heart, Zap, ThumbsUp, Star, MousePointer2, Hand } from 'lucide-react';

interface Pop {
  id: number;
  x: number;
  y: number;
  icon: React.ReactNode;
  color: string;
}

const Appreciation: React.FC = () => {
  const [count, setCount] = useState(() => {
     if (typeof window !== 'undefined') {
         return parseInt(localStorage.getItem('uiug_h5yr_count') || '0');
     }
     return 0;
  });
  const [pops, setPops] = useState<Pop[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const icons = [
    <Hand key="hand" className="w-8 h-8 md:w-12 md:h-12 fill-current" />,
    <ThumbsUp key="thumbs" className="w-8 h-8 md:w-12 md:h-12 fill-current" />,
    <Heart key="heart" className="w-8 h-8 md:w-12 md:h-12 fill-current" />,
    <Zap key="zap" className="w-8 h-8 md:w-12 md:h-12 fill-current" />,
    <Star key="star" className="w-8 h-8 md:w-12 md:h-12 fill-current" />
  ];

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Update Count
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem('uiug_h5yr_count', newCount.toString());

    // Get coordinates
    let clientX, clientY;
    if ('touches' in (e as any)) {
        // e.preventDefault(); // removed to allow scrolling on mobile if they drag, but tap works
        clientX = (e as React.TouchEvent).touches[0].clientX;
        clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Create Pop visual
    const id = Date.now();
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    // Using tailwind classes for colors that map to CSS variables or utility colors
    const colorClasses = ['text-primary', 'text-accent-yellow', 'text-black dark:text-white'];
    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

    const newPop: Pop = {
        id,
        x,
        y,
        icon: randomIcon,
        color: randomColor
    };

    setPops(prev => [...prev, newPop]);

    // Cleanup individual pop
    setTimeout(() => {
        setPops(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10 mt-32" id="appreciation">
        <div className="w-full bg-white dark:bg-black border-4 border-black dark:border-white p-2 md:p-4 shadow-brutal-black dark:shadow-brutal-white relative">
            
            {/* Header Strip */}
            <div className="flex justify-between items-center mb-4 border-b-4 border-black dark:border-white pb-2 bg-gray-100 dark:bg-gray-900 px-2 -mx-2 md:-mx-4 md:px-4 md:-mt-4 md:pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-black"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-black"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
                <span className="font-mono text-xs font-bold uppercase text-gray-500">H5YR_MODULE.exe</span>
            </div>

            {/* Main Interactive Area */}
            <div 
                ref={containerRef}
                onClick={handleInteraction}
                className="w-full min-h-[300px] md:min-h-[400px] bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white cursor-crosshair relative overflow-hidden group select-none active:bg-gray-200 dark:active:bg-gray-800 transition-colors"
            >
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', 
                         backgroundSize: '20px 20px' 
                     }}>
                </div>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 p-4">
                    <MousePointer2 className="w-12 h-12 mb-4 text-black dark:text-white animate-bounce" />
                    <h3 className="text-6xl md:text-9xl font-display font-black uppercase text-center mb-4 text-black dark:text-white drop-shadow-md leading-none">
                        H5YR
                    </h3>
                    <p className="font-mono text-xs md:text-sm font-bold text-gray-500 mb-8 uppercase bg-white dark:bg-black px-2 py-1 border-2 border-black dark:border-white">
                        HIGH_FIVE_YOU_ROCK
                    </p>
                    
                    <div className="bg-black dark:bg-white text-accent-yellow dark:text-black border-4 border-white dark:border-black shadow-[8px_8px_0px_0px_rgba(255,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-2 hover:rotate-0 transition-transform duration-200">
                        <div className="border-2 border-accent-yellow px-6 py-2">
                            <span className="font-mono text-4xl md:text-6xl font-bold tabular-nums tracking-widest">
                                {count.toString().padStart(6, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pop Animations */}
                {pops.map(pop => (
                    <div
                        key={pop.id}
                        className={`absolute pointer-events-none animate-float-up ${pop.color}`}
                        style={{ left: pop.x, top: pop.y }}
                    >
                        {pop.icon}
                    </div>
                ))}
            </div>

            {/* Instruction Footer */}
             <div className="mt-4 flex justify-between items-center font-mono text-[10px] md:text-xs font-bold uppercase text-gray-500">
                <span>STATUS: WAITING_FOR_HIGH_FIVES</span>
                <span>H5YRS_SENT: {count}</span>
            </div>
        </div>
        
        <style>{`
            @keyframes float-up {
                0% { transform: translate(-50%, -50%) scale(0.5) rotate(0deg); opacity: 1; }
                50% { transform: translate(-50%, -100px) scale(1.5) rotate(10deg); opacity: 0.8; }
                100% { transform: translate(-50%, -200px) scale(1) rotate(-10deg); opacity: 0; }
            }
            .animate-float-up {
                animation: float-up 0.8s ease-out forwards;
            }
        `}</style>
    </section>
  );
};

export default Appreciation;

