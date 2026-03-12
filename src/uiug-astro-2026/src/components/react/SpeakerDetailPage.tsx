import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';
// Connect/collaborate sections commented out: Mail, Globe, SiGithub, SiX, LinkedInIcon
import type { Speaker } from '../../data/speakers';

interface SpeakerDetailPageProps {
  speaker: Speaker;
}

const SpeakerDetailPage: React.FC<SpeakerDetailPageProps> = ({ speaker }) => {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" />

      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b-4 border-black dark:border-white plastic-surface p-4 md:p-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <a
            href="/speakers"
            className="group bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-primary hover:text-black transition-colors"
            aria-label="Back to speakers"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </a>
          <h2 className="text-xl md:text-3xl font-display font-black uppercase text-black dark:text-white leading-none">
            SPEAKER_PROFILE // ID_{speaker.id}
          </h2>
        </div>

        <div className="bg-primary text-black px-3 py-1 font-mono font-bold text-xs border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hidden md:block">
          STATUS: ACTIVE_SIGNAL
        </div>
      </header>

      <div style={{ minHeight: headerHeight || 80 }} aria-hidden="true" />

      <div className="max-w-7xl mx-auto p-4 md:p-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
          <div className="lg:col-span-5">
            <div className="group relative border-8 border-black dark:border-white p-2 bg-white dark:bg-black shadow-brutal-black dark:shadow-brutal-white mb-8">
              <div className="relative aspect-[4/5] overflow-hidden border-4 border-black dark:border-white bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                {speaker.image ? (
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    width={400}
                    height={500}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <span className="text-6xl md:text-8xl font-display font-black text-black dark:text-white uppercase">
                    {speaker.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-30" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-accent-yellow text-black px-6 py-2 font-display text-xl border-4 border-black shadow-brutal-black">
                {speaker.category}
              </div>
            </div>

            {/* Contribution count and session count (commented out)
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-100 dark:bg-gray-900 border-4 border-black dark:border-white p-4">
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">CONTRIBUTIONS</span>
                <span className="text-2xl font-display font-black text-black dark:text-white">150+</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 border-4 border-black dark:border-white p-4">
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">SESSIONS</span>
                <span className="text-2xl font-display font-black text-black dark:text-white">24</span>
              </div>
            </div>
            */}

            {/* Connect channels section (commented out)
            <div className="flex flex-col gap-4">
              <h4 className="font-display text-lg uppercase text-black dark:text-white border-b-2 border-black dark:border-white pb-2">CONNECT_CHANNELS</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="#" className="flex items-center gap-3 p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-primary hover:text-black transition-colors font-mono font-bold text-sm uppercase">
                  <SiX className="w-5 h-5 shrink-0" /> TWITTER_FEED
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-primary hover:text-black transition-colors font-mono font-bold text-sm uppercase">
                  <LinkedInIcon className="w-5 h-5 shrink-0" /> LINKEDIN_NET
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-primary hover:text-black transition-colors font-mono font-bold text-sm uppercase">
                  <SiGithub className="w-5 h-5 shrink-0" /> REPO_ACCESS
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-primary hover:text-black transition-colors font-mono font-bold text-sm uppercase">
                  <Globe className="w-5 h-5 shrink-0" /> WEB_PORTAL
                </a>
              </div>
            </div>
            */}
          </div>

          <div className="lg:col-span-7">
            <div className="mb-12">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-primary uppercase mb-4">
                <Terminal className="w-5 h-5 shrink-0" /> // SYSTEM_IDENTIFICATION_SUCCESS
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-black uppercase text-black dark:text-white leading-[0.85] mb-6 tracking-tighter">
                {speaker.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 font-display text-xl uppercase border-2 border-black dark:border-white">
                  {speaker.role}
                </div>
                <div className="font-mono text-xl font-bold text-gray-500 uppercase">@ {speaker.company}</div>
              </div>
            </div>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 flex-grow bg-black dark:bg-white" />
                  <h3 className="font-display text-2xl uppercase text-black dark:text-white shrink-0">BIOGRAPHICAL_DATA</h3>
                  <div className="h-1 w-12 bg-primary" />
                </div>
                <p className="font-mono text-lg md:text-xl font-medium leading-relaxed text-black dark:text-gray-300">
                  {speaker.bio}
                </p>
              </section>

              {/* CORE_EXPERTISE section (commented out)
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 flex-grow bg-black dark:bg-white" />
                  <h3 className="font-display text-2xl uppercase text-black dark:text-white shrink-0">CORE_EXPERTISE</h3>
                  <div className="h-1 w-12 bg-primary" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(speaker.topics && speaker.topics.length > 0 ? speaker.topics : ['.NET 8', 'HEADLESS']).map((topic, idx) => (
                    <div
                      key={topic}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-2 border-black dark:border-white group hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    >
                      <div className="bg-primary text-black w-8 h-8 flex items-center justify-center font-display text-lg shrink-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-display text-lg uppercase mb-1">{topic}</h4>
                        <p className="font-mono text-xs opacity-70">
                          Advanced implementation and architectural patterns for {topic} within the Umbraco ecosystem.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              */}

              {/* Want to collaborate section (commented out)
              <section className="bg-primary border-4 border-black p-8 shadow-brutal-black">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <Mail className="w-12 h-12 text-black shrink-0" />
                    <div>
                      <h3 className="font-display text-2xl uppercase text-black leading-none mb-1">WANT_TO_COLLABORATE?</h3>
                      <p className="font-mono text-sm font-bold text-black/70 uppercase">SEND_ENCRYPTED_MESSAGE_TO_NODE</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-black text-white px-8 py-4 font-display text-xl uppercase border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"
                  >
                    INITIATE_CONTACT
                  </button>
                </div>
              </section>
              */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerDetailPage;
