import React from 'react';
import { ArrowUp, Terminal, Mail, Github, Twitter, Linkedin, Zap } from 'lucide-react';
import type { FooterData, SocialLinks, LayoutLink } from '../../types/layout';

// Lucide icon mapping for social platforms
const SOCIAL_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
   github: Github,
   linkedin: Linkedin,
   youtube: Twitter,
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

const Footer: React.FC<FooterProps> = ({ footer, social }) => {
   const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   // Footer data with fallbacks
   const footerLogo = footer?.footerLogo ?? 'UIUG';
   const description = footer?.description ?? 'The Umbraco India User Group.\nArchitecting the future of CMS.\nBengaluru Node.';
   const copyright = footer?.copyright ?? `© ${new Date().getFullYear()} UIUG. ALL RIGHTS RESERVED.`;
   const marqueeText = footer?.marquee ?? 'System_Shutdown_Sequence_Initiated // End_of_Line // UIUG_Bengaluru // Thank_You_For_Visiting //';

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
         { key: 'github', url: '#', Icon: Github },
         { key: 'twitter', url: '#', Icon: Twitter },
         { key: 'linkedin', url: '#', Icon: Linkedin },
         { key: 'mail', url: '#', Icon: Mail },
      ];

   return (
      <footer className="relative bg-black text-white border-t-8 border-primary overflow-hidden">
         {/* Glitch Overlay Effect */}
         <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover mix-blend-screen"></div>

         {/* Marquee Border */}
         <div className="bg-accent-yellow text-black py-2 overflow-hidden border-b-4 border-black relative z-20">
            <div className="animate-marquee-footer whitespace-nowrap font-mono font-bold text-sm uppercase flex gap-8">
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
                        {description.split('\n').map((line, i) => (
                           <React.Fragment key={i}>
                              {line}{i < description.split('\n').length - 1 && <br />}
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

                  <div className="bg-white/5 p-6 h-full backdrop-blur-sm relative overflow-hidden">
                     <div className="flex items-center gap-2 mb-6 text-primary border-b-2 border-dashed border-gray-700 pb-2">
                        <Terminal className="w-5 h-5" />
                        <span className="font-mono font-bold">DIRECTORY_LISTING</span>
                     </div>
                     <ul className="space-y-4 font-mono font-bold text-lg relative z-10">
                        {footerMenu.map((item, i) => (
                           <li key={`${item.url}-${i}`} className="group/item flex items-center gap-4 cursor-pointer">
                              <span className="text-gray-600 group-hover/item:text-accent-yellow transition-colors font-mono text-xs">0{i + 1}</span>
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

                     {/* Background Code Deco */}
                     <div className="absolute bottom-0 right-0 p-4 opacity-10 pointer-events-none font-mono text-[10px] text-right text-white">
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
                     {socialEntries.map(({ key, url, Icon }) => (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square bg-gray-900 border-2 border-gray-700 flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 group shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                           <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </a>
                     ))}
                  </div>

                  {/* Newsletter Box */}
                  <div className="bg-accent-yellow p-6 border-4 border-black shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 transition-all relative">
                     <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[10px] font-bold font-mono">NEWS_FEED</div>
                     <h3 className="font-display font-black text-2xl text-black mb-2 uppercase leading-none">
                        STAY_WIRED
                     </h3>
                     <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                        <input
                           type="email"
                           placeholder="USER@HOST"
                           className="bg-black text-white border-2 border-black p-3 font-mono text-sm focus:outline-none placeholder:text-gray-600 focus:border-white transition-colors"
                        />
                        <button className="bg-black text-white font-bold font-mono text-sm py-3 px-4 hover:bg-white hover:text-black border-2 border-black transition-colors uppercase flex items-center justify-center gap-2">
                           <Zap className="w-3 h-3" /> SUBSCRIBE
                        </button>
                     </form>
                  </div>
               </div>

            </div>

            {/* Bottom Bar */}
            <div className="mt-20 pt-8 border-t-2 border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-gray-500 uppercase">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>ID: UIUG_NODE_01</span>
                  <span className="mx-2 text-gray-700">|</span>
                  <span>LOC: IN_KA_BLR</span>
               </div>
               <div className="flex gap-6">
                  <a href="#" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4">Privacy_Policy</a>
                  <a href="#" className="hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4">Code_of_Conduct</a>
               </div>
               <div>
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
