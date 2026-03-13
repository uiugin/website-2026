import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Terminal, Award, User } from 'lucide-react';
// Social icons on cards commented out: import { SiGithub, SiX, LinkedInIcon } from './SocialIcons';
import type { Speaker } from '../../data/speakers';
import { appendImageCrop } from '../../api/umbraco';

interface FullSpeakerListPageProps {
  speakers?: Speaker[];
}

const FullSpeakerListPage: React.FC<FullSpeakerListPageProps> = ({ speakers = [] }) => {
  const headerRef = useRef<HTMLDivElement>(null);
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

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(speakers.map((s) => s.category).filter(Boolean))].sort();
    return ['ALL', ...categories] as const;
  }, [speakers]);

  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (filter !== 'ALL' && !(categoryOptions as readonly string[]).includes(filter)) {
      setFilter('ALL');
    }
  }, [categoryOptions, filter]);

  const filteredSpeakers = speakers.filter((s) => {
    const matchesFilter = filter === 'ALL' || s.category === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedSpeakers = useMemo(
    () => [...filteredSpeakers].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [filteredSpeakers]
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" aria-hidden />

      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 shrink-0 bg-white dark:bg-black border-b-4 border-black dark:border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]"
      >
        <div className="bg-white/95 dark:bg-black/95 backdrop-blur-md plastic-surface p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="group bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-primary hover:text-black transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </a>
            <h1 className="text-2xl md:text-4xl font-display font-black uppercase text-black dark:text-white leading-none hidden md:block">
              FULL_ROSTER_V2
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 w-64 focus-within:ring-2 ring-primary">
              <Terminal className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="FIND_SPEAKER.EXE"
                className="bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 font-mono text-sm font-bold w-full uppercase text-black dark:text-white placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="bg-primary text-black px-3 py-1 font-mono font-bold text-xs border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              COUNT: {sortedSpeakers.length}
            </div>
          </div>
        </div>

        <div className="w-full px-4 md:px-8 pb-4">
          <h1 className="md:hidden text-4xl font-display font-black uppercase text-black dark:text-white leading-none mb-6">
            FULL_ROSTER_V2
          </h1>

          <div className="md:hidden flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 mb-6 focus-within:ring-2 ring-primary">
            <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="SEARCH_SPEAKERS..."
              className="bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 font-mono text-sm font-bold w-full uppercase text-black dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 border-2 border-black dark:border-white font-display uppercase text-sm md:text-lg transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none ${
                filter === cat
                  ? 'bg-primary text-black'
                  : 'bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
          </div>
        </div>
      </header>

      <div style={{ minHeight: headerHeight || 200 }} aria-hidden="true" />

      <div className="w-full p-4 md:p-8 relative z-0 flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
          {sortedSpeakers.map((speaker) => (
            <div
              key={speaker.id}
              className="group bg-white dark:bg-black border-4 border-black dark:border-white p-2 shadow-brutal-black dark:shadow-brutal-white hover:-translate-y-2 hover:shadow-brutal-red transition-all duration-300 plastic-surface flex flex-col h-full"
            >
              <div className="border-2 border-black dark:border-white p-4 h-full flex flex-col bg-white dark:bg-black relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-2 opacity-20 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1" />
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1" />
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1" />
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1" />
                </div>

                <div className="flex justify-between items-start mb-4 mt-2">
                  <div
                    className={`px-2 py-1 text-xs font-mono font-bold border border-black dark:border-white uppercase ${
                      speaker.category === 'MVP'
                        ? 'bg-accent-yellow text-black'
                        : speaker.category === 'HQ'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
                    }`}
                  >
                    {speaker.category}
                  </div>
                  <div className="text-xs font-mono font-bold text-gray-400">#00{speaker.id}</div>
                </div>

                <div className="relative aspect-square border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-900 mb-6 overflow-hidden flex items-center justify-center">
                  {speaker.image ? (
                    <img
                      src={appendImageCrop(speaker.image, 400, 400)}
                      alt={speaker.name}
                      width={400}
                      height={400}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <span className="text-5xl md:text-7xl font-display font-black text-black dark:text-white uppercase">
                      {speaker.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                </div>

                <div className="flex flex-col flex-grow">
                  <a href={`/speakers/${speaker.id}`} className="block">
                    <h3 className="text-2xl md:text-3xl font-display font-black uppercase text-black dark:text-white leading-[0.9] mb-2 group-hover:text-primary transition-colors">
                      {speaker.name}
                    </h3>
                  </a>
                  <p className="font-mono text-sm font-bold text-gray-500 uppercase mb-6">{speaker.company}</p>

                  <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 flex-grow">
                    <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                      <User className="w-3 h-3 shrink-0" /> BIO_DATA
                    </span>
                    <p className="font-mono text-sm font-medium leading-relaxed text-black dark:text-gray-300">
                      {speaker.bio && speaker.bio.length > 120
                        ? `${speaker.bio.slice(0, 120).trim()}...`
                        : speaker.bio}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {speaker.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold uppercase border border-black dark:border-white px-2 py-1 bg-white dark:bg-black text-black dark:text-white"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t-2 border-dashed border-gray-300 dark:border-gray-700 pt-4">
                    {/* Social icons on cards (commented out for now)
                    <div className="flex gap-3">
                      <SiX className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
                      <LinkedInIcon className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
                      <SiGithub className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
                    </div>
                    */}
                    <Award className="w-5 h-5 text-accent-yellow shrink-0 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedSpeakers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Terminal className="w-16 h-16 mb-4 text-gray-400" />
            <p className="font-mono font-bold text-xl uppercase">NO_SIGNALS_FOUND</p>
            <p className="font-mono text-sm">TRY_ADJUSTING_FILTERS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullSpeakerListPage;
