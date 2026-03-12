import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Globe, ScanLine, Users } from 'lucide-react';
import { SiX, LinkedInIcon } from './SocialIcons';
import type { SpeakersProps as MappedSpeakersProps } from '../../lib/speakers-mapper';
import { useAppShell } from './AppShell';

interface SpeakersProps {
  speakers?: MappedSpeakersProps;
  onOpenFullList?: () => void;
}

const Speakers: React.FC<SpeakersProps> = ({ speakers: speakersData, onOpenFullList: propOnOpenFullList }) => {
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
  const [_activeSlide, setActiveSlide] = useState(0);

  // Use dynamic speakers from props, fallback to empty array
  const speakers = speakersData?.speakers || [];
  const title = speakersData?.title || 'ELITE_SQUAD';
  const moreButtonUrl = speakersData?.moreButtonUrl;
  const ctaHeading = speakersData?.ctaHeading || 'WANT TO SPEAK?';
  const ctaDescription = speakersData?.ctaDescription || 'WE ARE ALWAYS LOOKING FOR NEW VOICES.';
  const ctaButtonUrl = speakersData?.ctaButtonUrl;

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
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4 relative">
         <div className="flex items-center gap-4">
            <div className="h-4 w-4 md:h-8 md:w-8 inline-flex items-center justify-center border-2 border-black dark:border-white bg-accent-yellow shrink-0 [&_svg]:block [&_svg]:shrink-0">
              <Users className="w-3 h-3 md:w-5 md:h-5 text-black" />
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
                {title.toUpperCase()}
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

      {/* Slider Container: static CTA card on the right above the slider; speaker slides scroll underneath it */}
      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto overflow-y-visible pb-12 pt-2 snap-x snap-mandatory pr-[300px] md:pr-[350px]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            
            {speakers.map((speaker) => (
                <div 
                    key={speaker.id} 
                    className="min-w-[300px] md:min-w-[350px] snap-start bg-white dark:bg-black border-4 border-black dark:border-white p-4 shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-2 hover:shadow-brutal-yellow transition-all duration-300 group relative overflow-hidden plastic-surface"
                >
                    {/* Inner Content - Lifted */}
                    <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-4 relative z-10">
                        {/* Image Frame */}
                        <div className="relative w-full aspect-square border-2 border-black dark:border-white mb-6 overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            {speaker.image ? (
                                <img 
                                    src={speaker.image} 
                                    alt={speaker.name}
                                    width={400}
                                    height={400}
                                    loading="lazy"
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110"
                                />
                            ) : (
                                <span className="text-6xl md:text-8xl font-display font-black text-black dark:text-white uppercase">
                                    {speaker.name.charAt(0).toUpperCase()}
                                </span>
                            )}
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
                                <SiX className="w-4 h-4" />
                            </button>
                            <button className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                <LinkedInIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                <Globe className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Static CTA card - at the very end (right-0) so no slide peeks out to its right; same size as speaker cards */}
        <div className="absolute right-0 top-2 w-[300px] md:w-[350px] h-[498px] flex items-center justify-center z-10 pointer-events-none">
          <div className="pointer-events-auto w-[300px] md:w-[350px] h-[498px] flex flex-col items-center justify-center text-center gap-6 bg-accent-yellow border-4 border-black dark:border-white p-4 shadow-brutal-black dark:shadow-brutal-white plastic-surface lego-studs">
            <h3 className="text-2xl md:text-4xl font-display font-black uppercase leading-none text-black mb-2">
              {ctaHeading.toUpperCase()}
            </h3>
            <p className="font-mono font-bold text-sm text-black mb-4">
              {ctaDescription.toUpperCase()}
            </p>
            {ctaButtonUrl && ctaButtonUrl !== '#' ? (
              <a href={ctaButtonUrl} className="px-6 py-3 bg-black text-white font-bold uppercase border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors w-full flex items-center justify-center gap-2">
                SUBMIT_TALK <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <button className="px-6 py-3 bg-black text-white font-bold uppercase border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors w-full flex items-center justify-center gap-2">
                SUBMIT_TALK <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Full Roster CTA */}
      <div className="mt-12 flex justify-center">
         {moreButtonUrl && moreButtonUrl !== '#' ? (
           <a 
              href={moreButtonUrl}
              className="group bg-transparent border-4 border-black dark:border-white text-black dark:text-white px-8 py-3 font-display text-xl uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-brutal-black dark:shadow-brutal-white active:translate-x-1 active:translate-y-1 active:shadow-none plastic-surface"
           >
              VIEW_FULL_ROSTER
           </a>
         ) : (
           <button 
              onClick={onOpenFullList}
              className="group bg-transparent border-4 border-black dark:border-white text-black dark:text-white px-8 py-3 font-display text-xl uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-brutal-black dark:shadow-brutal-white active:translate-x-1 active:translate-y-1 active:shadow-none plastic-surface"
           >
              VIEW_FULL_ROSTER
           </button>
         )}
      </div>
    </section>
  );
}

export default Speakers;

