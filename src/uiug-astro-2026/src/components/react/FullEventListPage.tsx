import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Terminal, Calendar, User, Tag, ArrowUpRight, Radio, Clock, MapPin, Users } from 'lucide-react';
import type { Event } from '../../types/content';
import { appendImageCrop } from '../../api/umbraco-utils';

interface FullEventListPageProps {
  events?: Event[];
}

const FullEventListPage: React.FC<FullEventListPageProps> = ({ events = [] }) => {
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

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(events.map((e) => e.status).filter(Boolean))].sort();
    return ['ALL', ...statuses] as const;
  }, [events]);

  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (filter !== 'ALL' && !(statusOptions as readonly string[]).includes(filter)) {
      setFilter('ALL');
    }
  }, [statusOptions, filter]);

  const filteredEvents = events.filter((e) => {
    const status = String(e.status ?? '').trim().toUpperCase();
    const matchesFilter = filter === 'ALL' || status === String(filter).trim().toUpperCase();
    const speakerNames = e.speakers?.map((s) => s.name).join(' ') ?? '';
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      speakerNames.toLowerCase().includes(search.toLowerCase()) ||
      String(e.type).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedEvents = useMemo(
    () =>
      [...filteredEvents].sort((a, b) => {
        const da = a.startDateIso ?? '';
        const db = b.startDateIso ?? '';
        if (!da) return 1;
        if (!db) return -1;
        return db.localeCompare(da);
      }),
    [filteredEvents]
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" />

      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b-4 border-black dark:border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]"
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
              EVENT_ARCHIVE_V2
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 w-64 focus-within:ring-2 ring-primary">
              <Terminal className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="SEARCH_LOGS.EXE"
                className="bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 font-mono text-sm font-bold w-full uppercase text-black dark:text-white placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="bg-primary text-black px-3 py-1 font-mono font-bold text-xs border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              LOGS: {filteredEvents.length}
            </div>
          </div>
        </div>

        <div className="w-full px-4 md:px-8 pb-4">
          <h1 className="md:hidden text-4xl font-display font-black uppercase text-black dark:text-white leading-none mb-6">
            EVENT_ARCHIVE
          </h1>

          <div className="md:hidden flex items-center bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-3 py-2 mb-6 focus-within:ring-2 ring-primary">
            <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="SEARCH_EVENTS..."
              className="bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 font-mono text-sm font-bold w-full uppercase text-black dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
          {statusOptions.map((cat) => (
            <button
              type="button"
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

      <div className="w-full p-4 md:p-8 relative z-10">
        <div className="flex flex-col gap-8">
          {sortedEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              className="group bg-white dark:bg-black border-4 border-black dark:border-white p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 shadow-brutal-black dark:shadow-brutal-white hover:shadow-brutal-red relative z-10 hover:z-20"
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
                      <MapPin className="w-4 h-4 shrink-0" /> {event.location ?? 'VIRTUAL_STREAM'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold text-xs bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white px-2 py-1 w-fit text-black dark:text-white">
                    <Tag className="w-4 h-4 shrink-0" /> {typeof event.type === 'string' ? event.type : (Array.isArray(event.type) ? event.type[0] : 'EVENT')}
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <h3 className="text-3xl md:text-5xl font-display uppercase leading-[0.85] mb-4 text-black dark:text-white group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <div
                    className="font-mono text-sm md:text-base font-bold text-black dark:text-white opacity-70 leading-relaxed prose prose-sm dark:prose-invert max-w-none line-clamp-3 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-primary [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: event.briefSummary ?? '' }}
                  />
                </div>

                <div className="lg:col-span-3 flex flex-col gap-6 lg:items-end">
                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    <div className="flex items-center gap-3 font-mono font-bold uppercase text-sm border-4 border-black dark:border-white px-4 py-2 bg-accent-yellow text-black shadow-brutal-black dark:shadow-brutal-white">
                      <User className="w-5 h-5 shrink-0" />
                      <span>{event.speakers?.length ? event.speakers.map((s) => s.name.toUpperCase().replace(/\s+/g, '_')).join(', ') : 'SPEAKER'}</span>
                    </div>

                    {(event.attendees?.length ?? 0) > 0 && (
                      <div className="relative group/attendees flex items-center gap-3 font-mono font-bold uppercase text-sm border-4 border-black dark:border-white px-4 py-2 bg-white dark:bg-black text-black dark:text-white shadow-brutal-black dark:shadow-brutal-white">
                        <div className="flex -space-x-2 mr-2">
                          {event.attendees.slice(0, 3).map((attendee) => (
                            <div key={attendee.id} className="w-6 h-6 border-2 border-black dark:border-white overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              {attendee.photoUrl ? (
                                <img src={appendImageCrop(attendee.photoUrl, 24, 24)} alt={attendee.name} width={24} height={24} loading="lazy" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px] font-bold font-mono text-black dark:text-white">
                                  {attendee.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <Users className="w-5 h-5 text-primary shrink-0" />
                        <span>{event.attendees.length} JOINED</span>

                        {/* Hover Popover */}
                        <div className="invisible group-hover/attendees:visible opacity-0 group-hover/attendees:opacity-100 absolute bottom-full right-0 mb-4 p-4 bg-white dark:bg-black border-4 border-black dark:border-white shadow-brutal-black dark:shadow-brutal-white z-50 min-w-[280px] transition-all duration-200 translate-y-2 group-hover/attendees:translate-y-0 pointer-events-none">
                          <div className="text-[10px] mb-3 border-b-2 border-black dark:border-white pb-1 flex justify-between items-center">
                            <span>ATTENDEE_MANIFEST</span>
                            <span className="text-primary">{event.attendees.length} TOTAL</span>
                          </div>
                          <div className="max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                            <div className="grid grid-cols-6 gap-2">
                              {event.attendees.map((attendee) => (
                                <div key={attendee.id} className="w-8 h-8 border-2 border-black dark:border-white overflow-hidden group/item relative bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                  {attendee.photoUrl ? (
                                    <img
                                      src={appendImageCrop(attendee.photoUrl, 32, 32)}
                                      alt={attendee.name}
                                      width={32}
                                      height={32}
                                      loading="lazy"
                                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold font-mono text-black dark:text-white">
                                      {attendee.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                  <div className="absolute inset-0 bg-primary/0 hover:bg-primary/20 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-black border-r-4 border-b-4 border-black dark:border-white rotate-45" />
                        </div>
                      </div>
                    )}
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
