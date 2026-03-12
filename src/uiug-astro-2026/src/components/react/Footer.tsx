import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Terminal, Mail, Zap } from 'lucide-react';
import { SiGithub, SiX, LinkedInIcon } from './SocialIcons';
import type { FooterData, SocialLinks, LayoutLink } from '../../types/layout';

interface SubscribeSubmitResponse {
   success?: boolean;
   message?: string;
   errors?: Record<string, string[]>;
}

const SOCIAL_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
   github: SiGithub,
   linkedin: LinkedInIcon,
   youtube: SiX,
   discord: Mail,
   meetup: Mail,
};

interface FooterProps {
   footer?: FooterData;
   social?: SocialLinks;
}

/** Format text to brutalist style */
function brutalize(text: string): string {
   return text.toUpperCase().replace(/\s+/g, '_');
}

const GIPHY_URL = 'https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif';

const Footer: React.FC<FooterProps> = ({ footer, social }) => {
   const [subscribeEmail, setSubscribeEmail] = useState('');
   const [isSubmittingSubscribe, setIsSubmittingSubscribe] = useState(false);
   const [giphyInView, setGiphyInView] = useState(false);
   const footerRef = useRef<HTMLElement>(null);

   useEffect(() => {
      const el = footerRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(
         ([e]) => {
            if (e?.isIntersecting) setGiphyInView(true);
         },
         { rootMargin: '100px', threshold: 0 }
      );
      obs.observe(el);
      return () => obs.disconnect();
   }, []);
   const [subscribeSuccessMessage, setSubscribeSuccessMessage] = useState<string | null>(null);
   const [subscribeErrorMessage, setSubscribeErrorMessage] = useState<string | null>(null);

   const subscribeSubmitUrl =
      (import.meta.env.PUBLIC_SUBSCRIBE_API_URL as string | undefined)?.trim() ||
      (import.meta.env.DEV ? 'https://localhost:44392/api/subscribe/submit' : '');

   const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const buildSubscribeErrorMessage = (payload: SubscribeSubmitResponse | null, fallback: string): string => {
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

   const handleSubscribeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsSubmittingSubscribe(true);
      setSubscribeSuccessMessage(null);
      setSubscribeErrorMessage(null);

      try {
         const response = await fetch(subscribeSubmitUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: subscribeEmail,
            }),
         });

         const payload = (await response.json().catch(() => null)) as SubscribeSubmitResponse | null;

         if (!response.ok) {
            setSubscribeErrorMessage(buildSubscribeErrorMessage(payload, 'SUBSCRIBE_REQUEST_FAILED'));
            return;
         }

         setSubscribeSuccessMessage(payload?.message || 'SUBSCRIBE_SUBMISSION_SAVED_SUCCESSFULLY');
         setSubscribeEmail('');
      } catch {
         setSubscribeErrorMessage('NETWORK_ERROR_SUBSCRIBE_REQUEST_FAILED');
      } finally {
         setIsSubmittingSubscribe(false);
      }
   };

   // Footer data with fallbacks
   const footerLogo = footer?.footerLogo ?? 'UIUG';
   const description = footer?.description ?? 'The Umbraco India User Group.\nArchitecting the future of CMS.\Kerala Node.';
   const copyright = footer?.copyright ?? `© ${new Date().getFullYear()} UIUG. ALL RIGHTS RESERVED.`;
   const marqueeText = footer?.marquee ?? 'System_Shutdown_Sequence_Initiated // End_of_Line // UIUG_KERALA // Thank_You_For_Visiting //';

   // Footer menu with fallbacks
   const footerMenu: LayoutLink[] = footer?.footerMenu && footer.footerMenu.length > 0
      ? footer.footerMenu
      : [
         { title: 'Manifesto', url: '#manifesto', target: null },
         { title: 'Events', url: '#events', target: null },
         { title: 'Speakers', url: '#speakers', target: null },
         { title: 'Showcase', url: '#showcase', target: null },
         { title: 'Contact', url: '#contact', target: null },
      ];

   // Build social links array
   const socialEntries = social && Object.keys(social).length > 0
      ? Object.entries(social).map(([key, url]) => ({
         key,
         url: url as string,
         Icon: SOCIAL_ICONS[key] || Mail,
      }))
      : [
         { key: 'github', url: '#', Icon: SiGithub },
         { key: 'twitter', url: '#', Icon: SiX },
         { key: 'linkedin', url: '#', Icon: LinkedInIcon },
         { key: 'mail', url: '#', Icon: Mail },
      ];

   return (
      <footer ref={footerRef} className="relative bg-black text-white border-t-8 border-primary overflow-hidden">
         {/* GIPHY background: lazy-loaded when Footer enters viewport */}
         {giphyInView && (
            <div
               className="absolute inset-0 opacity-5 pointer-events-none bg-cover mix-blend-screen"
               style={{ backgroundImage: `url('${GIPHY_URL}')` }}
            />
         )}

         {/* Marquee Border - explicit text-black for WCAG contrast on yellow */}
         <div className="bg-accent-yellow py-2 overflow-hidden border-b-4 border-black relative z-20">
            <div className="animate-marquee-footer whitespace-nowrap font-mono font-bold text-sm uppercase flex gap-8 text-black">
               <span>{marqueeText}</span>
               <span>{marqueeText}</span>
               <span>{marqueeText}</span>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

               {/* Column 1: Identity & Reboot */}
               <div className="lg:col-span-5 flex flex-col justify-between h-full">
                  <div>
                     <h2 className="text-[5rem] md:text-[8rem] font-display font-black leading-[0.8] tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 hover:to-primary transition-all duration-500 cursor-default select-none">
                        {footerLogo}<br /><span className="text-primary text-stroke-white">.EXE</span>
                     </h2>
                     <p className="font-mono text-gray-400 font-bold max-w-sm mb-8 border-l-4 border-white pl-4">
                        {description
                           .replace(/<br\s*\/?>/gi, '\n')
                           .split('\n')
                           .map((line) => line.trim())
                           .filter((line) => line !== '')
                           .map((line, i, lines) => (
                              <React.Fragment key={i}>
                                 {line}
                                 {i < lines.length - 1 && <br />}
                              </React.Fragment>
                           ))}
                     </p>
                  </div>

                  <button
                     onClick={scrollToTop}
                     className="group w-full md:w-auto bg-white text-black border-4 border-transparent hover:border-white hover:bg-black hover:text-white px-6 py-4 font-display text-xl uppercase flex items-center justify-between transition-all duration-300 shadow-[8px_8px_0px_0px_var(--color-primary)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                     <span>REBOOT_SYSTEM</span>
                     <ArrowUp className="w-6 h-6 group-hover:-translate-y-2 transition-transform" />
                  </button>
               </div>

               {/* Column 2: Directory Listing (Links) */}
               <div className="lg:col-span-4 border-4 border-white p-1 relative group">
                  {/* Decorative Corner */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary border-2 border-white z-20"></div>

                  <div className="bg-gray-900 p-6 h-full backdrop-blur-sm relative overflow-hidden">
                     <div className="flex items-center gap-2 mb-6 text-primary border-b-2 border-dashed border-gray-600 pb-2">
                        <Terminal className="w-5 h-5" aria-hidden="true" />
                        <span className="font-mono font-bold text-white">DIRECTORY_LISTING</span>
                     </div>
                     <ul className="space-y-4 font-mono font-bold text-lg relative z-10">
                        {footerMenu.map((item, i) => (
                           <li key={`${item.url}-${i}`} className="group/item flex items-center gap-4 cursor-pointer">
                              <span className="text-gray-300 group-hover/item:text-accent-yellow transition-colors font-mono text-xs">0{i + 1}</span>
                              <a
                                 href={item.url}
                                 target={item.target ?? undefined}
                                 rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                                 className="group-hover/item:translate-x-4 transition-transform duration-300 text-white group-hover/item:text-primary uppercase flex items-center gap-2"
                              >
                                 <span className="opacity-0 group-hover/item:opacity-100 transition-opacity text-xs">&gt;</span> ./{brutalize(item.title)}
                              </a>
                           </li>
                        ))}
                     </ul>

                     {/* Background Code Deco - text-gray-400 on gray-900 for WCAG AA contrast */}
                     <div className="absolute bottom-0 right-0 p-4 pointer-events-none font-mono text-[10px] text-right text-gray-400" aria-hidden="true">
                        {`while(alive) {
  code();
  deploy();
  repeat();
}`}
                     </div>
                  </div>
               </div>

               {/* Column 3: Connect & Newsletter */}
               <div className="lg:col-span-3 flex flex-col gap-8">
                  {/* Social Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     {socialEntries.map(({ key, url, Icon }) => {
                        const label = key === 'youtube' ? 'YouTube' : key === 'meetup' ? 'Meetup' : key === 'twitter' ? 'X (Twitter)' : key === 'mail' ? 'Email' : key.charAt(0).toUpperCase() + key.slice(1);
                        return (
                           <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="aspect-square bg-gray-900 border-2 border-gray-700 flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 group shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                              <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           </a>
                        );
                     })}
                  </div>

                  {/* Newsletter Box */}
                  <div className="bg-accent-yellow p-6 border-4 border-black shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 transition-all relative">
                     <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[10px] font-bold font-mono">NEWS_FEED</div>
                     <h3 className="font-display font-black text-2xl text-black mb-2 uppercase leading-none">
                        STAY_WIRED
                     </h3>
                     <form className="flex flex-col gap-3" onSubmit={handleSubscribeSubmit}>
                        <input
                           type="email"
                           placeholder="USER@HOST"
                           value={subscribeEmail}
                           onChange={(event) => setSubscribeEmail(event.target.value)}
                           className="bg-black text-white border-2 border-black p-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 placeholder:text-gray-600 focus:border-white transition-colors"
                        />
                        <button disabled={isSubmittingSubscribe} className="bg-black text-white font-bold font-mono text-sm py-3 px-4 hover:bg-white hover:text-black border-2 border-black transition-colors uppercase flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                           <Zap className="w-3 h-3" /> {isSubmittingSubscribe ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                        </button>
                        {subscribeSuccessMessage && (
                           <div className="font-mono font-bold text-xs text-green-800">
                              {subscribeSuccessMessage}
                           </div>
                        )}
                        {subscribeErrorMessage && (
                           <div className="font-mono font-bold text-xs text-red-800">
                              {subscribeErrorMessage}
                           </div>
                        )}
                     </form>
                  </div>
               </div>

            </div>

            {/* Bottom Bar - text-gray-400 for WCAG AA contrast on black */}
            <div className="mt-20 pt-8 border-t-2 border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-gray-400 uppercase">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span>ID: UIUG_NODE_01</span>
                  <span className="mx-2 text-gray-500" aria-hidden="true">|</span>
                  <span>LOC: IN_KA_BLR</span>
               </div>
               <div className="flex gap-6">
                  <a href="#" className="text-gray-400 hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4">Privacy_Policy</a>
                  <a href="#" className="text-gray-400 hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4">Code_of_Conduct</a>
               </div>
               <div className="text-gray-400">
                  {copyright}
               </div>
            </div>
         </div>

         <style>{`
        .animate-marquee-footer {
          animation: marquee-footer 30s linear infinite;
        }
        @keyframes marquee-footer {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .text-stroke-white {
            -webkit-text-stroke: 2px white;
            color: transparent;
        }
      `}</style>
      </footer>
   );
};

export default Footer;
