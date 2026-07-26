import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';
import { SiGithub, LinkedInIcon } from './SocialIcons';
import type { Speaker } from '../../data/speakers';
import type { GithubActivity } from '../../lib/github-activity';
import { appendImageCrop } from '../../api/umbraco-utils';
import GithubActivitySection from './github-activity/GithubActivitySection';

interface SpeakerDetailPageProps {
  speaker: Speaker;
  githubActivity?: GithubActivity | null;
}

const SpeakerDetailPage: React.FC<SpeakerDetailPageProps> = ({ speaker, githubActivity = null }) => {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    const readHeight = () => requestAnimationFrame(() => setHeaderHeight(el.offsetHeight));
    const ro = new ResizeObserver(readHeight);
    ro.observe(el);
    readHeight();
    return () => ro.disconnect();
  }, []);

  const hasActivity =
    githubActivity != null &&
    (githubActivity.repos.length > 0 ||
      githubActivity.events.length > 0 ||
      githubActivity.user != null);

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
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <div className="group relative border-8 border-black dark:border-white p-2 bg-white dark:bg-black shadow-brutal-black dark:shadow-brutal-white mb-8">
              <div className="relative aspect-[4/5] overflow-hidden border-4 border-black dark:border-white bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                {speaker.image ? (
                  <img
                    src={appendImageCrop(speaker.image, 400, 500)}
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

            {(speaker.githubUrl || speaker.linkedinUrl) && (
              <div className="flex flex-col gap-4">
                <h4 className="font-display text-lg uppercase text-black dark:text-white border-b-2 border-black dark:border-white pb-2">
                  CONNECT_CHANNELS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {speaker.githubUrl && (
                    <a
                      href={speaker.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-primary hover:text-black transition-colors font-mono font-bold text-sm uppercase"
                    >
                      <SiGithub className="w-5 h-5 shrink-0" /> REPO_ACCESS
                    </a>
                  )}
                  {speaker.linkedinUrl && (
                    <a
                      href={speaker.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-primary hover:text-black transition-colors font-mono font-bold text-sm uppercase"
                    >
                      <LinkedInIcon className="w-5 h-5 shrink-0" /> LINKEDIN_NET
                    </a>
                  )}
                </div>
              </div>
            )}
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
            </div>
          </div>
        </div>

        {hasActivity && githubActivity && (
          <div className="mt-16 md:mt-20 pt-4">
            <GithubActivitySection activity={githubActivity} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakerDetailPage;
