import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Zap, Users, ArrowUpRight, Github } from 'lucide-react';

const JoinUs: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show button after scrolling down a bit
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <div className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <button 
            onClick={() => setIsOpen(true)}
            className="group relative bg-primary text-black border-4 border-black dark:border-white p-4 md:p-5 shadow-brutal-black dark:shadow-brutal-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200"
        >
            {/* Spinning Text Badge Effect using CSS only for simplicity or just icons */}
            <div className="absolute -top-3 -left-3 bg-white text-black text-[10px] font-bold px-2 py-0.5 border-2 border-black transform -rotate-12 group-hover:rotate-0 transition-transform">
                NEW
            </div>
            
            <div className="flex items-center gap-3 font-display font-black text-lg md:text-xl uppercase">
                <Users className="w-6 h-6 md:w-8 md:h-8" />
                <span className="hidden md:block">JOIN_CORPS</span>
            </div>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Brutalist Modal */}
            <div className="relative w-full max-w-md bg-accent-yellow border-4 border-black shadow-[16px_16px_0px_0px_#ffffff] dark:shadow-[16px_16px_0px_0px_#333] p-8 animate-in zoom-in-95 duration-200">
                
                {/* Decorative Window Header */}
                <div className="absolute top-0 left-0 w-full h-8 bg-black flex items-center justify-between px-2">
                    <span className="text-white font-mono text-xs font-bold uppercase">System_Alert.exe</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-white border border-gray-500"></div>
                        <div className="w-3 h-3 bg-white border border-gray-500"></div>
                        <button onClick={() => setIsOpen(false)} className="w-3 h-3 bg-primary border border-white hover:bg-red-600"></button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-block p-4 border-4 border-black bg-white mb-6 rounded-full">
                        <Zap className="w-12 h-12 text-black fill-primary" />
                    </div>
                    
                    <h2 className="text-4xl font-display font-black uppercase text-black mb-2 leading-none">
                        CHOOSE YOUR<br/>PATH
                    </h2>
                    <p className="font-mono text-sm font-bold text-black mb-8 border-b-2 border-black pb-4 border-dashed">
                        CONNECT WITH THE UMBRACO INDIA CORE
                    </p>

                    <div className="space-y-4">
                        <a href="#" className="flex items-center justify-between bg-white border-4 border-black p-4 text-black font-bold font-mono uppercase hover:bg-black hover:text-white transition-colors group">
                            <span className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 group-hover:text-primary transition-colors" />
                                DISCORD_SERVER
                            </span>
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                        
                        <a href="#" className="flex items-center justify-between bg-white border-4 border-black p-4 text-black font-bold font-mono uppercase hover:bg-black hover:text-white transition-colors group">
                            <span className="flex items-center gap-3">
                                <Users className="w-5 h-5 group-hover:text-primary transition-colors" />
                                MEETUP_GROUP
                            </span>
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>

                        <a href="#" className="flex items-center justify-between bg-white border-4 border-black p-4 text-black font-bold font-mono uppercase hover:bg-black hover:text-white transition-colors group">
                            <span className="flex items-center gap-3">
                                <Github className="w-5 h-5 group-hover:text-primary transition-colors" />
                                GITHUB_REPO
                            </span>
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                    </div>

                    <div className="mt-8 text-xs font-mono font-bold text-black opacity-60">
                        // NO_SPAM_GUARANTEED
                    </div>
                </div>

                {/* Close Button Mobile */}
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute -top-6 -right-6 md:-right-8 bg-black text-white p-2 border-2 border-white shadow-brutal-black hover:bg-primary hover:text-black transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default JoinUs;

