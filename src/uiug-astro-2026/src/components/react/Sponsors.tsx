import React from 'react';
import { Shield, Globe, Cpu, Gem, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import type { SponsorsProps } from '../../lib/sponsors-mapper';

interface Props {
  sponsors?: SponsorsProps;
}

// Email built in JS so Cloudflare Email Protection doesn't obfuscate the link
const SPONSOR_EMAIL = 'admin' + '@' + 'uiug.in';

const Sponsors: React.FC<Props> = ({ sponsors }) => {
  // Use dynamic data from props
  const title = sponsors?.title || 'SYSTEM_ALLIANCES';
  const platinumSponsors = sponsors?.platinum || [];
  const goldSponsors = sponsors?.gold || [];
  const silverSponsors = sponsors?.silver || [];
  const ctaTitle = sponsors?.ctaTitle || 'SUPPORT_THE_CORE';
  const ctaText = sponsors?.ctaText || 'Join the alliance. Power the community events and server costs.';
  const ctaButtonUrl = sponsors?.ctaButtonUrl;

  const openSponsorEmail = () => {
    window.location.href = 'mailto:' + SPONSOR_EMAIL;
  };

  return (
    <section className="px-4 md:px-10 mb-20 w-full relative z-10" id="sponsors">
       {/* Header */}
       <Reveal width="100%">
        <div className="flex items-center gap-4 mb-10 md:mb-16 border-b-4 border-black dark:border-white pb-4">
            <div className="h-4 w-4 md:h-8 md:w-8 inline-flex items-center justify-center border-2 border-black dark:border-white bg-primary shrink-0 [&_svg]:block [&_svg]:shrink-0">
                <Gem className="w-3 h-3 md:w-5 md:h-5 text-black" />
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-black dark:text-white tracking-tighter leading-none">
                {title.toUpperCase()}
            </h2>
            <span className="font-mono text-xs font-bold text-gray-500 mb-2 ml-auto hidden md:block">
                // FUNDING_NODES_ACTIVE
            </span>
        </div>
       </Reveal>

      <div className="flex flex-col gap-8 md:gap-12">
        
        {/* Platinum Tier - The Monolith */}
        {platinumSponsors.length > 0 && platinumSponsors.map((sponsor, idx) => (
          <Reveal key={idx} width="100%">
            <div className="w-full relative">
              <div className="absolute -top-3 left-4 bg-black text-white dark:bg-white dark:text-black px-3 py-1 font-mono font-bold text-xs uppercase z-20 border-2 border-primary">
                TIER_01: PLATINUM_CORE
              </div>
              
              <div className="bg-accent-yellow border-4 border-black dark:border-white p-8 md:p-16 shadow-brutal-black dark:shadow-brutal-white relative overflow-hidden group">
                {/* Background pattern (CSS only – no external image to avoid cert/blocking issues) */}
                <div className="absolute inset-0 lego-studs opacity-10 pointer-events-none" aria-hidden />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-8 h-8 text-black fill-white dark:fill-black" />
                      <span className="font-mono font-bold text-black uppercase">OFFICIAL_PARTNER</span>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-display font-black text-black uppercase tracking-tighter leading-none mb-2">
                      {sponsor.companyName.toUpperCase()}
                    </h3>{' '}
                    <p className="font-mono font-bold text-black max-w-md border-l-4 border-black dark:border-white pl-4">
                      {sponsor.description}
                    </p>
                  </div>

                  <div className="w-48 h-48 border-4 border-black dark:border-white bg-white dark:bg-black relative flex items-center justify-center p-4 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={`${sponsor.companyName} logo`}
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <Globe className="w-24 h-24 text-black dark:text-white animate-spin-slow" />
                        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-black dark:border-white animate-ping"></div>
                        <div className="absolute bottom-2 left-2 font-mono text-[10px] font-bold text-black dark:text-white">
                          CONNECTED
                        </div>
                      </>
                    )}
                    {sponsor.logoUrl && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-black dark:border-white animate-ping"></div>
                    )}
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-8 h-8 border-l-4 border-b-4 border-black dark:border-white bg-white dark:bg-black"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-t-4 border-r-4 border-black dark:border-white bg-white dark:bg-black"></div>
              </div>
            </div>
          </Reveal>
        ))}

        {/* Gold Tier */}
        {goldSponsors.length > 0 && (
          <div
            className={
              goldSponsors.length === 1
                ? 'grid grid-cols-1 gap-8'
                : 'grid grid-cols-1 md:grid-cols-2 gap-8'
            }
          >
            {goldSponsors.map((sponsor, idx) => (
              <Reveal key={idx} delay={idx * 0.1} width="100%">
                <div className="w-full relative">
                  <div className="absolute -top-3 left-4 bg-[#F0B429] text-black px-3 py-1 font-mono font-bold text-xs uppercase z-20 border-2 border-black dark:border-white">
                    TIER_02: GOLD
                  </div>

                  <div className="relative overflow-hidden border-4 border-black dark:border-white bg-black text-white shadow-[8px_8px_0_0_#F0B429] group hover:shadow-[4px_4px_0_0_#F0B429] hover:translate-x-1 hover:translate-y-1 transition-all duration-300">
                    {/* Gold signal stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#F0B429]" aria-hidden />
                    <div className="absolute inset-0 lego-studs opacity-[0.07] pointer-events-none" aria-hidden />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 md:p-10 pl-8 md:pl-12">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 bg-[#F0B429] text-black border-2 border-black dark:border-white shrink-0">
                            <Gem className="w-5 h-5" aria-hidden />
                          </div>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F0B429]">
                            ALLIED_NODE
                          </span>
                        </div>
                        <h4 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none text-white mb-3">
                          {sponsor.companyName.toUpperCase()}
                        </h4>
                        {sponsor.description && (
                          <p className="font-mono text-sm font-bold text-white/70 border-l-4 border-[#F0B429] pl-4 max-w-md">
                            {sponsor.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 w-40 h-24 md:w-52 md:h-28 border-4 border-[#F0B429] bg-white text-black flex flex-col items-center justify-center p-3 -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                        {sponsor.logoUrl ? (
                          <img
                            src={sponsor.logoUrl}
                            alt={`${sponsor.companyName} logo`}
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <>
                            <Gem className="w-10 h-10 md:w-12 md:h-12" aria-hidden />
                            <span className="font-mono text-[9px] font-bold uppercase tracking-widest mt-1">
                              GOLD
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 w-8 h-8 border-l-4 border-b-4 border-[#F0B429] bg-[#F0B429]" aria-hidden />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-t-4 border-r-4 border-[#F0B429] bg-[#F0B429]" aria-hidden />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* Silver Tier - Rendered conditionally */}
        {silverSponsors.length > 0 && (
            <Reveal width="100%">
                <div className="border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-900 py-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 bg-primary text-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase z-10 border-b-2 border-r-2 border-black dark:border-white">
                        TIER_03: SILVER_STREAM
                    </div>
                    <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
                    <div className="flex overflow-hidden relative z-0">
                        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                            {[...silverSponsors, ...silverSponsors].map((sponsor, idx) => (
                                <span key={idx} className="text-xl md:text-3xl font-display font-black uppercase text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white transition-colors cursor-default select-none">
                                    {sponsor.companyName.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Reveal>
        )}

        {/* Call for Sponsors & Placeholder Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visual Placeholder for Open Slots */}
            <Reveal width="100%" className="h-full">
                <div className="border-4 border-dashed border-gray-400 dark:border-gray-600 p-8 flex flex-col items-center justify-center text-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group h-full min-h-[200px]">
                    <Cpu className="w-12 h-12 text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors animate-pulse" />
                    <div>
                        <h4 className="text-2xl font-display font-black uppercase text-gray-400 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors">
                            GOLD_TIER_OPEN
                        </h4>
                        <p className="font-mono text-xs font-bold text-gray-400 mt-2 group-hover:text-black dark:group-hover:text-white">
                            [INSERT_YOUR_MODULE_HERE]
                        </p>
                    </div>
                </div>
            </Reveal>

            {/* CTA Card */}
            <Reveal width="100%" className="h-full" delay={0.2}>
                <div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 flex flex-col justify-between hover:shadow-brutal-red transition-all cursor-pointer group relative h-full">
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-primary border-r-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                        <h4 className="text-3xl font-display font-black uppercase text-black dark:text-white mb-2">
                            {ctaTitle.toUpperCase()}
                        </h4>
                        <p className="font-mono text-sm font-bold text-gray-500 mb-6">
                            {ctaText}
                        </p>
                    </div>
                  
                      <button type="button" onClick={openSponsorEmail} className="w-full px-6 py-4 border-4 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold uppercase hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black transition-all flex items-center justify-between">
                        BECOME_A_SPONSOR <ArrowRight className="w-5 h-5" />
                      </button>
                    
                </div>
            </Reveal>
        </div>

      </div>
    </section>
  );
};

export default Sponsors;

