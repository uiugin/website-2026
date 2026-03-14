import React, { useEffect, useRef, useState } from 'react';
import { Mail, MapPin, Send, ArrowRight, Terminal } from 'lucide-react';
import { LinkedInIcon } from './SocialIcons';
import type { ContactProps } from '../../lib/contact-mapper';

interface Props {
  contact?: ContactProps;
}

interface ContactSubmitResponse {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
}

const Contact: React.FC<Props> = ({ contact }) => {
  // Use dynamic title from props, fallback to default
  const title = contact?.title || 'INITIATE_UPLINK';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const contactSubmitUrl =
        (import.meta.env.PUBLIC_CONTACT_API_URL as string | undefined)?.trim() ||
        (import.meta.env.DEV ? 'https://localhost:44392/api/contact/submit' : '');

  useEffect(() => {
    let mounted = true;
    // Load Leaflet only on client (SSR-safe)
    import('leaflet/dist/leaflet.css');
    import('leaflet').then((LModule) => {
      const L = LModule.default;
      if (!mounted || !mapContainerRef.current || mapInstanceRef.current) return;
      // Initialize Map - Center on India
      const map = L.map(mapContainerRef.current, {
        center: [22.0, 78.0], // Center of India
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      const legoIcon = L.divIcon({
        className: 'lego-pin',
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center">
             <div class="absolute w-full h-full bg-[var(--color-primary)] border-2 border-black animate-bounce"></div>
             <div class="absolute -top-2 w-4 h-2 bg-[var(--color-primary)] border-2 border-black border-b-0 animate-bounce"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([22.0, 78.0], { icon: legoIcon }).addTo(map); // Center of India

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

    const buildErrorMessage = (payload: ContactSubmitResponse | null, fallback: string): string => {
        if (!payload) {
            return fallback;
        }

        if (payload.errors && typeof payload.errors === 'object') {
            const validationMessages = Object.values(payload.errors)
                .flat()
                .filter((value) => value && value.trim().length > 0);

            if (validationMessages.length > 0) {
                return validationMessages.join(' ');
            }
        }

        if (payload.message && payload.message.trim().length > 0) {
            return payload.message;
        }

        return fallback;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSubmitting(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const response = await fetch(contactSubmitUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                }),
            });

            const payload = (await response.json().catch(() => null)) as ContactSubmitResponse | null;

            if (!response.ok) {
                setErrorMessage(buildErrorMessage(payload, 'FAILED_TO_TRANSMIT_PACKET'));
                return;
            }

            setSuccessMessage(payload?.message || 'CONTACT_SUBMISSION_SAVED_SUCCESSFULLY');
            setName('');
            setEmail('');
            setMessage('');
        } catch {
            setErrorMessage('NETWORK_ERROR_FAILED_TO_TRANSMIT_PACKET');
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="join">
      {/* Header */}
       <div className="flex items-center gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4">
         <div className="h-4 w-4 md:h-8 md:w-8 inline-flex items-center justify-center border-2 border-black dark:border-white bg-black dark:bg-white shrink-0 [&_svg]:block [&_svg]:shrink-0">
            <Terminal className="w-3 h-3 md:w-5 md:h-5 text-white dark:text-black" />
         </div>
         <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
            {title.toUpperCase()}
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

            <form className="flex flex-col gap-6 mt-8" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label className="font-mono font-bold text-sm uppercase text-black dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary"></span> IDENTITY_STRING
                    </label>
                    <input 
                        name="name"
                        type="text" 
                        placeholder="ENTER_NAME"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-4 font-mono font-bold text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono font-bold text-sm uppercase text-black dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary"></span> RETURN_ADDRESS
                    </label>
                    <input 
                        name="email"
                        type="email" 
                        placeholder="USER@DOMAIN.COM"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-4 font-mono font-bold text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono font-bold text-sm uppercase text-black dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary"></span> PAYLOAD_DATA
                    </label>
                    <textarea 
                        name="message"
                        rows={5}
                        placeholder="INPUT_MESSAGE..."
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-4 font-mono font-bold text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-primary focus:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all placeholder:text-gray-400 resize-none"
                    ></textarea>
                </div>

                {successMessage && (
                    <div className="font-mono font-bold text-sm text-green-700 dark:text-green-300">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="font-mono font-bold text-sm text-red-700 dark:text-red-300">
                        {errorMessage}
                    </div>
                )}

                <button type="submit" disabled={isSubmitting} className="group mt-4 bg-black text-white dark:bg-white dark:text-black p-4 font-display text-xl uppercase border-4 border-transparent hover:bg-primary hover:text-black hover:border-black transition-colors flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(255,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT_PACKET'}
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
                    <button type="button" onClick={() => { window.location.href = 'mailto:' + ('admin' + '@' + 'uiug.in'); }} className="flex items-center gap-4 text-black font-bold font-mono hover:bg-white p-2 -mx-2 transition-colors border-2 border-transparent hover:border-black dark:hover:border-white w-full text-left">
                        <div className="bg-black dark:bg-white text-white dark:text-black p-2 border-2 border-black dark:border-white">
                            <Mail className="w-5 h-5" />
                        </div>
                        <span className="text-lg">EMAIL_US</span>
                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100" />
                    </button>
                    <a href="https://www.linkedin.com/in/umbraco-india-users-group/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-black font-bold font-mono hover:bg-white p-2 -mx-2 transition-colors border-2 border-transparent hover:border-black dark:hover:border-white">
                        <div className="bg-black dark:bg-white text-white dark:text-black p-2 border-2 border-black dark:border-white">
                            <LinkedInIcon className="w-5 h-5" />
                        </div>
                        <span className="text-lg">JOIN_LINKEDIN</span>
                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100" />
                    </a>
                </div>
            </div>

            {/* Location Box (India Map) */}
            <div className="flex-grow bg-gray-200 dark:bg-gray-800 border-4 border-black dark:border-white relative overflow-hidden group shadow-brutal-black dark:shadow-brutal-white min-h-[300px] h-[320px]">
                 <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full min-h-[300px]" />
                 
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
                                HQ: KERALA | STATUS: ACTIVE
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

