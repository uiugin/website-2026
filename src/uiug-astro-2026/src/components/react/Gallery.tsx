import React, { useState } from 'react';
import { Image as ImageIcon, Play, Maximize2, X, Aperture } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  caption: string;
  location: string;
  date: string;
}

const mediaItems: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
    caption: 'MAIN_STAGE_KEYNOTE',
    location: 'BENGALURU_PRIME',
    date: 'DEC_23'
  },
  {
    id: '2',
    type: 'video',
    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
    caption: 'LIVE_CODING_DEMO',
    location: 'HYDERABAD_HUB',
    date: 'NOV_23'
  },
  {
    id: '3',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop',
    caption: 'COMMUNITY_MIXER',
    location: 'MUMBAI_NORTH',
    date: 'OCT_23'
  },
  {
    id: '4',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1550063873-ab792950096b?q=80&w=1000&auto=format&fit=crop',
    caption: 'HACKATHON_WINNERS',
    location: 'DELHI_NCR',
    date: 'SEP_23'
  },
  {
    id: '5',
    type: 'video',
    src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
    caption: 'AFTER_PARTY_VIBES',
    location: 'GOA_RETREAT',
    date: 'AUG_23'
  },
  {
    id: '6',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop',
    caption: 'WORKSHOP_SESSIONS',
    location: 'PUNE_CAMPUS',
    date: 'JUL_23'
  }
];

const Gallery: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="gallery">
       {/* Header */}
       <div className="flex items-end gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4">
         <div className="h-4 w-4 md:h-8 md:w-8 bg-black dark:bg-white flex items-center justify-center">
            <Aperture className="w-full h-full text-white dark:text-black p-0.5 animate-spin-slow" />
         </div>
         <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
            VISUAL_LOGS
         </h2>
         <span className="font-mono text-xs font-bold text-gray-500 mb-2 ml-auto hidden md:block">
            // MEMORY_DUMP_COMPLETE
         </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaItems.map((item) => (
            <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-900 cursor-pointer overflow-hidden shadow-brutal-black dark:shadow-brutal-white hover:shadow-brutal-red transition-all duration-300 hover:-translate-y-2"
            >
                {/* Image */}
                <img 
                    src={item.src} 
                    alt={item.caption}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                {/* Type Indicator */}
                <div className="absolute top-4 right-4 bg-white dark:bg-black border-2 border-black dark:border-white p-2 z-10">
                    {item.type === 'video' ? <Play className="w-4 h-4 text-black dark:text-white" /> : <ImageIcon className="w-4 h-4 text-black dark:text-white" />}
                </div>
                
                {/* Center Play Button for Video */}
                {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-16 h-16 rounded-full border-4 border-white dark:border-black bg-black/50 dark:bg-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-primary text-black inline-block px-2 py-1 text-xs font-bold border-2 border-black mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {item.location}
                    </div>
                    <h3 className="text-xl font-display font-black uppercase text-white leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        {item.caption}
                    </h3>
                    <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                        <span className="font-mono text-xs font-bold text-white bg-black px-1">
                            DATE: {item.date}
                        </span>
                        <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Modal Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-primary/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl bg-black border-4 border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b-4 border-white bg-black">
                    <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                         <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                         <span className="font-mono text-white font-bold text-sm uppercase ml-2">
                            VIEWING_FILE: {selectedItem.caption}.{selectedItem.type === 'video' ? 'mp4' : 'jpg'}
                         </span>
                    </div>
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="text-white hover:text-primary transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="relative aspect-video bg-gray-900 group">
                    <img 
                        src={selectedItem.src} 
                        alt={selectedItem.caption}
                        className="w-full h-full object-contain"
                    />
                    
                    {selectedItem.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="w-20 h-20 rounded-full border-4 border-white dark:border-black bg-primary/80 dark:bg-primary/80 flex items-center justify-center animate-pulse">
                                 <Play className="w-8 h-8 text-black fill-black ml-1" />
                             </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-white border-t-4 border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-display font-black uppercase text-black mb-1">
                                {selectedItem.caption}
                            </h3>
                            <p className="font-mono text-sm font-bold text-gray-600">
                                LOC: {selectedItem.location} // {selectedItem.date}
                            </p>
                        </div>
                        <button className="hidden md:block px-6 py-2 border-4 border-black bg-accent-yellow text-black font-bold uppercase hover:bg-black hover:text-white transition-colors shadow-brutal-black">
                            DOWNLOAD_ASSET
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Backdrop Close Click Area */}
            <div className="absolute inset-0 -z-10" onClick={() => setSelectedItem(null)}></div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

