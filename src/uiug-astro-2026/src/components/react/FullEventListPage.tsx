import React, { useState } from 'react';
import { ArrowLeft, Search, Terminal, Calendar, User, Tag, ArrowUpRight, Radio, Clock, MapPin } from 'lucide-react';
import type { Event } from '../../data/events';

interface FullEventListPageProps {
  events?: Event[];
}

const FullEventListPage: React.FC<FullEventListPageProps> = ({ events = [] }) => {
  const [filter, setFilter] = useState<'ALL' | 'INCOMING' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesFilter = filter === 'ALL' || e.status === filter;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.speaker.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-y-auto">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" />

      <div className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b-4 border-black dark:border-white p-4 md:p-6 flex justify-between items-center plastic-surface relative z-10">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="group bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-primary hover:text-black transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </a>
          <h2 className="text-2xl md:text-4xl font-display font-black uppercase text-black dark:text-white leading-none hidden md:block">
            EVENT_ARCHIVE_V2
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 w-64 focus-within:ring-2 ring-primary">
            <Terminal className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="SEARCH_LOGS.EXE"
              className="bg-transparent border-none outline-none font-mono text-sm font-bold w-full uppercase text-black dark:text-white placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-primary text-black px-3 py-1 font-mono font-bold text-xs border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            LOGS: {filteredEvents.length}
          </div>
        </div>
      </div>

      <div className="w-full p-4 md:p-8 relative z-10">
        <h2 className="md:hidden text-4xl font-display font-black uppercase text-black dark:text-white leading-none mb-6">
          EVENT_ARCHIVE
        </h2>

        <div className="md:hidden flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 mb-6 focus-within:ring-2 ring-primary">
          <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="SEARCH_EVENTS..."
            className="bg-transparent border-none outline-none font-mono text-sm font-bold w-full uppercase text-black dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {(['ALL', 'INCOMING', 'ARCHIVED'] as const).map((cat) => (
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

        <div className="flex flex-col gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-white dark:bg-black border-4 border-black dark:border-white p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 shadow-brutal-black dark:shadow-brutal-white hover:shadow-brutal-red relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 px-4 py-1 font-mono text-xs font-bold border-l-4 border-b-4 border-black dark:border-white ${
                  event.status === 'INCOMING' ? 'bg-primary text-black' : 'bg-black text-white dark:bg-white dark:text-black'
                }`}
              >
                {event.status === 'INCOMING' ? (
                  <span className="flex items-center gap-2">
                    <Radio className="w-3 h-3 animate-pulse" /> LIVE_SIGNAL
                  </span>
                ) : (
                  <span>ARCHIVED_DATA</span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="flex items-center gap-3 font-mono font-bold text-2xl text-black dark:text-white">
                    <Calendar className="w-6 h-6 text-primary shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-mono text-sm text-gray-500 font-bold">
                      <Clock className="w-4 h-4 shrink-0" /> {event.time}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm text-gray-500 font-bold">
                      <MapPin className="w-4 h-4 shrink-0" /> {event.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold text-xs bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-2 py-1 w-fit text-black dark:text-white">
                    <Tag className="w-4 h-4 shrink-0" /> {event.type}
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <h3 className="text-3xl md:text-5xl font-display uppercase leading-[0.85] mb-4 text-black dark:text-white group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="font-mono text-sm md:text-base font-bold text-black dark:text-white opacity-70 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="lg:col-span-3 flex flex-col gap-6 lg:items-end">
                  <div className="flex items-center gap-3 font-mono font-bold uppercase text-sm border-4 border-black dark:border-white px-4 py-2 bg-accent-yellow text-black shadow-brutal-black dark:shadow-brutal-white">
                    <User className="w-5 h-5 shrink-0" />
                    <span>{event.speaker}</span>
                  </div>
                            <a
                    href={`/events/${event.id}`}
                    className="w-full lg:w-auto bg-black text-white dark:bg-white dark:text-black px-6 py-3 font-display text-lg uppercase border-2 border-transparent hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3 group/btn"
                  >
                    ACCESS_DATA
                    <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Terminal className="w-16 h-16 mb-4 text-gray-400" />
            <p className="font-mono font-bold text-xl uppercase">NO_EVENTS_FOUND</p>
            <p className="font-mono text-sm">SYSTEM_SCAN_COMPLETE_ZERO_RESULTS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullEventListPage;
