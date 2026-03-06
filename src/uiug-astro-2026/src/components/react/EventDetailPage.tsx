import React from 'react';
import { ArrowLeft, Calendar, User, Radio, Clock, MapPin, Terminal, Share2, Bookmark, PlayCircle, FileText } from 'lucide-react';
import type { Event } from '../../data/events';

interface EventDetailPageProps {
  event: Event;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ event }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-y-auto">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" />

      <div className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b-4 border-black dark:border-white p-4 md:p-6 flex justify-between items-center plastic-surface relative z-10">
        <div className="flex items-center gap-4">
          <a
            href="/events"
            className="group bg-black text-white dark:bg-white dark:text-black p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-primary hover:text-black transition-colors"
            aria-label="Back to events"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </a>
          <h2 className="text-xl md:text-3xl font-display font-black uppercase text-black dark:text-white leading-none">
            EVENT_INTEL // {event.id}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" className="p-2 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <Share2 className="w-5 h-5 text-black dark:text-white" />
          </button>
          <button type="button" className="p-2 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <Bookmark className="w-5 h-5 text-black dark:text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-12 relative z-10">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`px-4 py-1 font-mono text-sm font-bold border-4 border-black dark:border-white ${
                event.status === 'INCOMING' ? 'bg-primary text-black' : 'bg-black text-white dark:bg-white dark:text-black'
              }`}
            >
              {event.status === 'INCOMING' ? (
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-pulse shrink-0" /> LIVE_SIGNAL_DETECTED
                </span>
              ) : (
                <span>ARCHIVED_DATA_STREAM</span>
              )}
            </div>
            <div className="bg-accent-yellow text-black px-4 py-1 font-mono font-bold text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {event.type}
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-display font-black uppercase text-black dark:text-white leading-[0.85] mb-12 tracking-tighter max-w-5xl">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y-4 border-black dark:border-white py-8">
            <div className="flex items-center gap-4">
              <Calendar className="w-10 h-10 text-primary shrink-0" />
              <div>
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase">DATE_STAMP</span>
                <span className="text-2xl font-display uppercase text-black dark:text-white">{event.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="w-10 h-10 text-primary shrink-0" />
              <div>
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase">TIME_WINDOW</span>
                <span className="text-2xl font-display uppercase text-black dark:text-white">{event.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-10 h-10 text-primary shrink-0" />
              <div>
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase">COORDINATES</span>
                <span className="text-2xl font-display uppercase text-black dark:text-white">{event.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
          <div className="lg:col-span-8">
            <section className="mb-16">
              <h3 className="font-display text-3xl uppercase text-black dark:text-white mb-8 flex items-center gap-4">
                <Terminal className="w-8 h-8 text-primary shrink-0" /> BRIEFING_SUMMARY
              </h3>
              <p className="font-mono text-xl md:text-2xl font-bold text-black dark:text-white leading-relaxed mb-8">
                {event.description}
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-8 font-mono text-gray-700 dark:text-gray-400 leading-relaxed">
                This session covers the architectural evolution of Umbraco in the Indian context. We explore how local development teams are pushing the boundaries of what&apos;s possible with .NET and Umbraco, focusing on performance, scalability, and developer experience.
              </div>
            </section>

            {event.agenda && event.agenda.length > 0 && (
              <section className="mb-16">
                <h3 className="font-display text-3xl uppercase text-black dark:text-white mb-8 flex items-center gap-4">
                  <Clock className="w-8 h-8 text-primary shrink-0" /> MISSION_TIMELINE
                </h3>
                <div className="space-y-4">
                  {event.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-6 p-6 bg-white dark:bg-black border-4 border-black dark:border-white shadow-brutal-black dark:shadow-brutal-white group hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    >
                      <div className="font-display text-2xl text-primary shrink-0">{item.time}</div>
                      <div className="h-1 flex-grow bg-gray-200 dark:bg-gray-800 group-hover:bg-primary transition-colors" />
                      <div className="font-mono font-black uppercase text-lg">{item.task}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-black text-white dark:bg-white dark:text-black p-8 border-4 border-black dark:border-white shadow-brutal-red">
                <h4 className="font-display text-2xl uppercase mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 shrink-0" /> LEAD_OPERATIVE
                </h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 border-2 border-primary overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
                      alt={event.speaker}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                  <div>
                    <h5 className="font-display text-xl uppercase leading-none mb-1">{event.speaker}</h5>
                    <span className="font-mono text-xs text-gray-500 font-bold uppercase">UMBRACO_SPECIALIST</span>
                  </div>
                </div>
                <a
                  href="/speakers"
                  className="block w-full bg-primary text-black py-3 font-display text-sm uppercase border-2 border-black hover:bg-white transition-colors text-center"
                >
                  VIEW_FULL_DOSSIER
                </a>
              </div>

              <div className="bg-gray-100 dark:bg-gray-900 p-8 border-4 border-black dark:border-white">
                <h4 className="font-display text-2xl uppercase mb-6">INTEL_RESOURCES</h4>
                <div className="space-y-4">
                  <button type="button" className="w-full flex items-center justify-between p-4 bg-white dark:bg-black border-2 border-black dark:border-white font-mono font-bold text-sm uppercase hover:bg-primary hover:text-black transition-colors">
                    <span className="flex items-center gap-3">
                      <PlayCircle className="w-5 h-5 shrink-0" /> WATCH_RECORDING
                    </span>
                  </button>
                  <button type="button" className="w-full flex items-center justify-between p-4 bg-white dark:bg-black border-2 border-black dark:border-white font-mono font-bold text-sm uppercase hover:bg-primary hover:text-black transition-colors">
                    <span className="flex items-center gap-3">
                      <FileText className="w-5 h-5 shrink-0" /> DOWNLOAD_SLIDES
                    </span>
                  </button>
                </div>
              </div>

              {event.status === 'INCOMING' && (
                <button
                  type="button"
                  className="w-full bg-primary text-black p-8 font-display text-3xl uppercase border-4 border-black shadow-brutal-black hover:translate-y-1 hover:shadow-none transition-all"
                >
                  SECURE_YOUR_SPOT
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
