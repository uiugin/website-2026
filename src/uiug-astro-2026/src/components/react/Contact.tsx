import React, { useEffect, useRef } from 'react';
import { Mail, MapPin, Send, MessageSquare, ArrowRight, Terminal } from 'lucide-react';

const Contact: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Check if Leaflet is loaded and map container exists
    const L = (window as any).L;
    if (L && mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize Map - Center on India
      const map = L.map(mapContainerRef.current, {
        center: [22.0000, 78.0000], // Center of India
        zoom: 4, // Zoom out slightly more to show context
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false // Keep it static-ish like a lego baseplate, or true if we want interaction
      });

      // Add Tile Layer - Using CartoDB Light which has clear borders and labels
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom Icon for the Pin (Lego Minifigure Head style or just a block)
      const legoIcon = L.divIcon({
        className: 'lego-pin',
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center">
             <div class="absolute w-full h-full bg-primary border-2 border-black animate-bounce"></div>
             <div class="absolute -top-2 w-4 h-2 bg-primary border-2 border-black border-b-0 animate-bounce"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // Marker for Bengaluru Node
      L.marker([12.9716, 77.5946], { icon: legoIcon }).addTo(map);

      mapInstanceRef.current = map;
      
      // Force map invalidation on load to ensure tiles render correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, []);

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="join">
      {/* Header */}
       <div className="flex items-end gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4">
         <div className="h-4 w-4 md:h-8 md:w-8 bg-black dark:bg-white flex items-center justify-center">
            <Terminal className="w-3 h-3 md:w-5 md:h-5 text-white dark:text-black" />
         </div>
         <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
            INITIATE_UPLINK
         </h2>
         <span className="font-mono text-xs font-bold text-gray-500 mb-2 ml-auto hidden md:block">
            // CONNECTION_SECURE
         </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form Section */}
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 md:p-10 shadow-brutal-black dark:shadow-brutal-white relative">
            <div className="absolute top-0 left-0 bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs font-mono font-bold border-r-4 border-b-4 border-white dark:border-black">
                // TRANSMISSION_FORM
            </div>

            <form className="flex flex-col gap-6 mt-8" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                    <label className="font-mono font-bold text-sm uppercase text-black dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary"></span> IDENTITY_STRING
                    </label>
                    <input 
                        type="text" 
                        placeholder="ENTER_NAME"
                        className="w-full bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-4 font-mono font-bold text-black dark:text-white focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono font-bold text-sm uppercase text-black dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary"></span> RETURN_ADDRESS
                    </label>
                    <input 
                        type="email" 
                        placeholder="USER@DOMAIN.COM"
                        className="w-full bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-4 font-mono font-bold text-black dark:text-white focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono font-bold text-sm uppercase text-black dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary"></span> PAYLOAD_DATA
                    </label>
                    <textarea 
                        rows={5}
                        placeholder="INPUT_MESSAGE..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-4 font-mono font-bold text-black dark:text-white focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all placeholder:text-gray-400 resize-none"
                    ></textarea>
                </div>

                <button type="submit" className="group mt-4 bg-black text-white dark:bg-white dark:text-black p-4 font-display text-xl uppercase border-4 border-transparent hover:bg-primary hover:text-black hover:border-black transition-colors flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(255,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    TRANSMIT_PACKET
                    <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
            </form>
        </div>

        {/* Info / Map Section */}
        <div className="flex flex-col gap-8">
            {/* Direct Connect Box */}
            <div className="bg-accent-yellow border-4 border-black dark:border-white p-8 shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-1 transition-transform relative">
                <div className="absolute top-4 right-4 animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <h3 className="text-3xl font-display font-black uppercase mb-6 text-black">
                    DIRECT_LINE
                </h3>
                <div className="space-y-4">
                    <a href="mailto:hello@uiug.in" className="flex items-center gap-4 text-black font-bold font-mono hover:bg-white p-2 -mx-2 transition-colors border-2 border-transparent hover:border-black dark:hover:border-white">
                        <div className="bg-black dark:bg-white text-white dark:text-black p-2 border-2 border-black dark:border-white">
                            <Mail className="w-5 h-5" />
                        </div>
                        <span className="text-lg">HELLO@UIUG.IN</span>
                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100" />
                    </a>
                    <a href="#" className="flex items-center gap-4 text-black font-bold font-mono hover:bg-white p-2 -mx-2 transition-colors border-2 border-transparent hover:border-black dark:hover:border-white">
                        <div className="bg-black dark:bg-white text-white dark:text-black p-2 border-2 border-black dark:border-white">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className="text-lg">JOIN_DISCORD</span>
                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100" />
                    </a>
                </div>
            </div>

            {/* Location Box (Lego Map) */}
            <div className="flex-grow bg-gray-200 dark:bg-gray-800 border-4 border-black dark:border-white relative overflow-hidden group shadow-brutal-black dark:shadow-brutal-white min-h-[300px]">
                 
                 {/* Map Container - Removed Grayscale for better visibility */}
                 <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full"></div>
                 
                 {/* Lego Stud Overlay - Reduced opacity for better map visibility */}
                 <div 
                    className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply opacity-20"
                    style={{
                        backgroundImage: `
                          radial-gradient(circle at center, rgba(0,0,0,0.5) 25%, transparent 26%),
                          radial-gradient(circle at center, rgba(255,255,255,0.4) 10%, transparent 11%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 1px 1px' // Slight offset for highlight
                    }}
                 ></div>
                 
                 {/* Lego Grid Lines (Brick edges) */}
                 <div 
                    className="absolute inset-0 z-10 pointer-events-none opacity-20"
                    style={{
                         backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 1px)`,
                         backgroundSize: '20px 20px'
                    }}
                 ></div>
                 
                 {/* Overlay Info */}
                 <div className="absolute bottom-0 left-0 w-full z-20 bg-black/80 backdrop-blur-sm p-4 border-t-4 border-black dark:border-white">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="inline-block bg-primary text-black px-3 py-1 font-mono font-bold text-xs mb-2 border-2 border-white dark:border-black">
                                PHYSICAL_NODE
                            </div>
                            <h3 className="text-3xl font-display font-black uppercase text-white leading-none">
                                INDIA_REGION
                            </h3>
                            <div className="font-mono text-gray-400 font-bold text-xs mt-1">
                                HQ: BENGALURU | STATUS: ACTIVE
                            </div>
                        </div>
                        <MapPin className="w-10 h-10 text-white group-hover:text-primary transition-colors" />
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

