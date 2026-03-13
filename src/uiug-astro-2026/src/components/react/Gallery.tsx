import React from 'react';
import { Image as ImageIcon, Play, Maximize2, Aperture } from 'lucide-react';
import type { GalleryProps, MediaItem } from '../../lib/gallery-mapper';
import { appendImageCrop } from '../../api/umbraco';

// Lightbox (commented out): focus trap
// const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Props {
  gallery?: GalleryProps;
}

const Gallery: React.FC<Props> = ({ gallery }) => {
  // Lightbox (commented out for now)
  // const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  // const modalRef = useRef<HTMLDivElement>(null);
  // const previousActiveRef = useRef<HTMLElement | null>(null);

  // useEffect(() => {
  //   if (!selectedItem || !modalRef.current) return;
  //   previousActiveRef.current = document.activeElement as HTMLElement | null;
  //   const focusables = modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);
  //   const first = focusables[0];
  //   if (first) first.focus();

  //   const onKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === 'Escape') {
  //       setSelectedItem(null);
  //       return;
  //     }
  //     if (e.key !== 'Tab') return;
  //     const els = modalRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
  //     if (!els?.length) return;
  //     const firstEl = els[0];
  //     const lastEl = els[els.length - 1];
  //     if (e.shiftKey) {
  //       if (document.activeElement === firstEl) {
  //         e.preventDefault();
  //         lastEl.focus();
  //       }
  //     } else {
  //       if (document.activeElement === lastEl) {
  //         e.preventDefault();
  //         firstEl.focus();
  //       }
  //     }
  //   };

  //   document.addEventListener('keydown', onKeyDown);
  //   return () => {
  //     document.removeEventListener('keydown', onKeyDown);
  //     previousActiveRef.current?.focus?.();
  //   };
  // }, [selectedItem]);

  // Default values
  const defaultTitle = 'VISUAL_LOGS';
  const defaultItems: MediaItem[] = [];
  
  const sectionTitle = gallery?.title || defaultTitle;
  const mediaItems = gallery?.items || defaultItems;

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="gallery" aria-labelledby="gallery-heading">
       {/* Header */}
       <div className="flex items-center gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4">
         <div className="h-4 w-4 md:h-8 md:w-8 inline-flex items-center justify-center border-2 border-black dark:border-white bg-black dark:bg-white shrink-0 [&_svg]:block [&_svg]:shrink-0">
            <Aperture className="w-3 h-3 md:w-5 md:h-5 text-white dark:text-black" />
         </div>
         <h2 id="gallery-heading" className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
            {sectionTitle.toUpperCase()}
         </h2>
         <span className="font-mono text-xs font-bold text-gray-500 mb-2 ml-auto hidden md:block">
            // MEMORY_DUMP_COMPLETE
         </span>
      </div>

      {/* Grid */}
      {mediaItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <div 
                key={item.id}
                // onClick={() => setSelectedItem(item)}
                className="group relative aspect-square border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-900 overflow-hidden shadow-brutal-black dark:shadow-brutal-white hover:shadow-brutal-red transition-all duration-300 hover:-translate-y-2"
            >
                {/* Image */}
                <img 
                    src={appendImageCrop(item.src, 400, 400)} 
                    alt={item.caption}
                    width={400}
                    height={400}
                    loading="lazy"
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
      ) : (
        <div className="text-center py-20 border-4 border-dashed border-gray-400 dark:border-gray-600">
          <p className="font-mono text-lg font-bold text-gray-500 uppercase">
            NO_GALLERY_ITEMS_LOADED
          </p>
        </div>
      )}

      {/* Modal Lightbox (commented out for now) */}
      {/* {selectedItem && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-primary/90 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div className="relative w-full max-w-5xl bg-black border-4 border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b-4 border-white bg-black">
                    <div className="flex items-center gap-2">
                         <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                         <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                         <span className="font-mono text-white font-bold text-sm uppercase ml-2">
                            VIEWING_FILE: {selectedItem.caption}.{selectedItem.type === 'video' ? 'mp4' : 'jpg'}
                         </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        className="text-white hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label="Close gallery modal"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="relative aspect-video bg-gray-900 group">
                    <img 
                        src={appendImageCrop(selectedItem.src, 800, 450)} 
                        alt={selectedItem.caption}
                        width={800}
                        height={450}
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

                <div className="p-6 bg-white border-t-4 border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 id="gallery-modal-title" className="text-3xl font-display font-black uppercase text-black mb-1">
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
            
            <div className="absolute inset-0 -z-10" onClick={() => setSelectedItem(null)}></div>
        </div>
      )} */}
    </section>
  );
};

export default Gallery;

