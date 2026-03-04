import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Linkedin, Twitter, Globe, ScanLine, Pause, Play } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
}

const speakers: Speaker[] = [
  {
    id: '1',
    name: 'RAVI KUMAR',
    role: 'MVP / ARCHITECT',
    company: 'UMBRACO HQ',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'ANITA SHARMA',
    role: 'TECH LEAD',
    company: 'DIGITAL AGENCY',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'VIKRAM SINGH',
    role: 'CORE CONTRIBUTOR',
    company: 'OPEN SOURCE CO',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'PRIYA PATEL',
    role: 'DEV REL',
    company: 'CLOUD CORP',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'ARJUN REDDY',
    role: 'FULL STACK',
    company: 'STARTUP INC',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop'
  }
];

import { useAppShell } from './AppShell';

interface SpeakersProps {
  onOpenFullList?: () => void;
}

const Speakers: React.FC<SpeakersProps> = ({ onOpenFullList: propOnOpenFullList }) => {
  // Use context if prop is not provided (for Astro usage)
  let contextOnOpenFullList: (() => void) | undefined;
  try {
    const context = useAppShell();
    contextOnOpenFullList = context?.onOpenFullSpeakerList;
  } catch {
    // Context not available, use prop only
  }
  const onOpenFullList = propOnOpenFullList || contextOnOpenFullList;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  // Constants
  const SLIDE_DURATION = 3000;
  const UPDATE_INTERVAL = 50;

  useEffect(() => {
    let timer: number;
    
    if (!isPaused) {
      timer = window.setInterval(() => {
        setProgress((prev) => {
          const step = 100 / (SLIDE_DURATION / UPDATE_INTERVAL);
          const nextProgress = prev + step;
          
          if (nextProgress >= 100) {
            handleAutoScroll();
            return 0;
          }
          return nextProgress;
        });
      }, UPDATE_INTERVAL);
    }

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleAutoScroll = () => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Calculate next scroll position
      // Check if we are at the end
      const maxScroll = current.scrollWidth - current.clientWidth;
      const tolerance = 10;
      
      if (current.scrollLeft >= maxScroll - tolerance) {
        // Reset to start
        current.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveSlide(0);
      } else {
        // Scroll to next card
        const cardWidth = current.children[0].clientWidth; // Get width of first card
        const gap = 32; // Gap is 2rem = 32px
        const scrollAmount = cardWidth + gap;
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setActiveSlide(prev => prev + 1);
      }
    }
  };

  const manualScroll = (direction: 'left' | 'right') => {
    setProgress(0); // Reset timer on manual interaction
    if (scrollRef.current) {
      const { current } = scrollRef;
      const cardWidth = current.children[0].clientWidth;
      const gap = 32;
      const scrollAmount = cardWidth + gap;

      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="speakers_02">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4 relative">
         <div className="flex items-end gap-4">
            <div className="h-4 w-4 md:h-8 md:w-8 bg-accent-yellow animate-pulse"></div>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
                ELITE_SQUAD
            </h2>
         </div>
         
         <div className="flex items-center gap-6">
            {/* Auto-scroll Indicator */}
            <div className="hidden md:flex flex-col gap-1 w-32">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-gray-500">
                    <span>{isPaused ? 'PAUSED' : 'AUTO_SCAN'}</span>
                    <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 border border-black dark:border-white relative overflow-hidden">
                    <div 
                        className={`h-full ${isPaused ? 'bg-gray-400' : 'bg-primary'} transition-all duration-75 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => manualScroll('left')}
                    className="p-3 border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-brutal-black dark:shadow-brutal-white active:translate-x-1 active:translate-y-1 active:shadow-none"
                    aria-label="Scroll Left"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => manualScroll('right')}
                    className="p-3 border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-brutal-black dark:shadow-brutal-white active:translate-x-1 active:translate-y-1 active:shadow-none"
                    aria-label="Scroll Right"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
         </div>
      </div>

      {/* Slider Container with Hover Pause */}
      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            
            {speakers.map((speaker, index) => (
                <div 
                    key={speaker.id} 
                    className="min-w-[300px] md:min-w-[350px] snap-start bg-white dark:bg-black border-4 border-black dark:border-white p-4 shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-2 hover:shadow-brutal-yellow transition-all duration-300 group relative overflow-hidden plastic-surface"
                >
                    {/* Inner Content - Lifted */}
                    <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-4 relative z-10">
                        {/* Image Frame */}
                        <div className="relative w-full aspect-square border-2 border-black dark:border-white mb-6 overflow-hidden bg-gray-200">
                            <img 
                                src={speaker.image} 
                                alt={speaker.name}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 mix-blend-multiply transition-opacity duration-300 pointer-events-none"></div>
                            
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white dark:border-black z-10"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white dark:border-black z-10"></div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-1 mb-4 relative z-10">
                            <h3 className="text-2xl font-display font-black uppercase text-black dark:text-white leading-none group-hover:text-primary transition-colors">
                                {speaker.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <ScanLine className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">
                                    {speaker.role}
                                </p>
                            </div>
                            <p className="font-mono text-sm font-bold text-black dark:text-white uppercase mt-1">
                                @{speaker.company}
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex gap-3 pt-4 border-t-4 border-black dark:border-white">
                            <button className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                <Twitter className="w-4 h-4" />
                            </button>
                            <button className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </button>
                            <button className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                <Globe className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Call to action card at end */}
             <div className="min-w-[300px] md:min-w-[350px] snap-start bg-accent-yellow border-4 border-black dark:border-white p-8 shadow-brutal-black dark:shadow-brutal-white flex flex-col items-center justify-center text-center gap-6 group hover:-translate-y-2 transition-transform duration-300 plastic-surface lego-studs">
                 <div className="relative z-10">
                    <h3 className="text-4xl font-display font-black uppercase leading-none text-black mb-4">
                        WANT TO SPEAK?
                    </h3>
                    <p className="font-mono font-bold text-sm text-black mb-6">
                        WE ARE ALWAYS LOOKING FOR NEW VOICES.
                    </p>
                    <button className="px-6 py-3 bg-black text-white font-bold uppercase border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors w-full flex items-center justify-center gap-2">
                        SUBMIT_TALK <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
             </div>

        </div>
      </div>
      
      {/* Full Roster CTA */}
      <div className="mt-12 flex justify-center">
         <button 
            onClick={onOpenFullList}
            className="group bg-transparent border-4 border-black dark:border-white text-black dark:text-white px-8 py-3 font-display text-xl uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-brutal-black dark:shadow-brutal-white active:translate-x-1 active:translate-y-1 active:shadow-none plastic-surface"
         >
            VIEW_FULL_ROSTER
         </button>
      </div>
    </section>
  );
}

export default Speakers;

