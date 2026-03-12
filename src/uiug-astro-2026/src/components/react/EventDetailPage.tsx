import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Radio,
  Clock,
  MapPin,
  Terminal,
  Share2,
  Bookmark,
  BookmarkCheck,
  PlayCircle,
  FileText,
  Users,
  ArrowUpRight,
  Mail,
  Link2,
} from 'lucide-react';
import type { Event } from '../../types/content';

/** Brand icon components for share menu */
const IconLinkedIn = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const IconFacebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const IconX = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconWhatsApp = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const BOOKMARKS_STORAGE_KEY = 'uiug-bookmarked-event-ids';

function getBookmarkedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function setBookmarkedIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

interface EventDetailPageProps {
  event: Event;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ event }) => {
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<'copied' | null>(null);
  const [shareMenuPosition, setShareMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [bookmarkFeedback, setBookmarkFeedback] = useState<'saved' | 'removed' | null>(null);
  const [bookmarkFeedbackPosition, setBookmarkFeedbackPosition] = useState<{ top: number; right: number } | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareTriggerRef = useRef<HTMLButtonElement>(null);
  const sharePortalRef = useRef<HTMLDivElement>(null);
  const bookmarkTriggerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsBookmarked(getBookmarkedIds().has(event.id));
  }, [event.id]);

  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const updateShareMenuPosition = () => {
    const el = shareTriggerRef.current;
    if (!el || typeof document === 'undefined') return;
    const rect = el.getBoundingClientRect();
    setShareMenuPosition({
      top: rect.bottom + 8,
      right: typeof window !== 'undefined' ? window.innerWidth - rect.right : 0,
    });
  };

  useEffect(() => {
    if (!shareMenuOpen) {
      setShareMenuPosition(null);
      return;
    }
    updateShareMenuPosition();
    const onScrollOrResize = () => updateShareMenuPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [shareMenuOpen]);

  useEffect(() => {
    if (!bookmarkFeedback || typeof document === 'undefined') {
      setBookmarkFeedbackPosition(null);
      return;
    }
    const el = bookmarkTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setBookmarkFeedbackPosition({
      top: rect.bottom + 8,
      right: typeof window !== 'undefined' ? window.innerWidth - rect.right : 0,
    });
  }, [bookmarkFeedback]);

  useEffect(() => {
    if (!shareMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        shareMenuRef.current?.contains(target) ||
        sharePortalRef.current?.contains(target)
      ) return;
      setShareMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [shareMenuOpen]);

  const getShareUrl = () => (typeof window !== 'undefined' ? window.location.href : '');
  const getShareTitle = () => event.title;
  const getShareText = () => event.briefSummary ?? event.title ?? '';

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareFeedback('copied');
        setShareMenuOpen(false);
        setTimeout(() => setShareFeedback(null), 2000);
      }
    } catch {
      // ignore
    }
  };

  const openShareWindow = (href: string) => {
    if (typeof window === 'undefined') return;
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=400');
    setShareMenuOpen(false);
  };

  const handleShareLinkedIn = () => {
    openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`);
  };
  const handleShareFacebook = () => {
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`);
  };
  const handleShareX = () => {
    const url = getShareUrl();
    const text = getShareText();
    openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
  };
  const handleShareWhatsApp = () => {
    const text = `${getShareText()} ${getShareUrl()}`;
    openShareWindow(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };
  const handleShareEmail = () => {
    const subject = getShareTitle();
    const body = `${getShareText()}\n\n${getShareUrl()}`;
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    setShareMenuOpen(false);
  };

  const handleBookmark = () => {
    const ids = getBookmarkedIds();
    if (ids.has(event.id)) {
      ids.delete(event.id);
      setIsBookmarked(false);
      setBookmarkFeedback('removed');
    } else {
      ids.add(event.id);
      setIsBookmarked(true);
      setBookmarkFeedback('saved');
      // Try browser bookmark: Firefox supports sidebar.addPanel; others use Ctrl+D / Cmd+D
      if (typeof window !== 'undefined') {
        const url = window.location.href;
        const title = document.title || event.title;
        try {
          if ('sidebar' in window && typeof (window as Window & { sidebar?: { addPanel?: (u: string, t: string, _: string) => void } }).sidebar?.addPanel === 'function') {
            (window as Window & { sidebar: { addPanel: (u: string, t: string, _: string) => void } }).sidebar.addPanel(url, title, '');
          }
        } catch {
          // ignore
        }
      }
    }
    setBookmarkedIds(ids);
    setTimeout(() => setBookmarkFeedback(null), 3000);
  };
  const eventType = typeof event.type === 'string' ? event.type : (Array.isArray(event.type) ? event.type[0] : 'EVENT');
  const attendeesCount = event.attendees?.length ?? 0;
  const displayAttendees = showAllAttendees ? event.attendees : event.attendees?.slice(0, 8);
  const hasAttendees = attendeesCount > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="absolute inset-0 lego-studs opacity-50 pointer-events-none" />

      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b-4 border-black dark:border-white plastic-surface p-4 md:p-6 flex justify-between items-center"
      >
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

        <div className="flex items-center gap-2 relative" ref={shareMenuRef}>
          <button
            ref={shareTriggerRef}
            type="button"
            onClick={() => setShareMenuOpen((open) => !open)}
            className="relative p-2 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label="Share event"
            aria-expanded={shareMenuOpen}
            aria-haspopup="true"
          >
            <Share2 className="w-5 h-5 text-black dark:text-white" />
            {shareFeedback === 'copied' && !shareMenuOpen && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white dark:bg-white dark:text-black text-xs font-mono whitespace-nowrap border-2 border-black dark:border-white z-[60]">
                LINK_COPIED
              </span>
            )}
          </button>
          {shareMenuOpen &&
            shareMenuPosition &&
            typeof document !== 'undefined' &&
            createPortal(
              <div
                ref={sharePortalRef}
                role="menu"
                className="py-2 w-52 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]"
                style={{
                  position: 'fixed',
                  top: shareMenuPosition.top,
                  right: shareMenuPosition.right,
                  zIndex: 9999,
                }}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase border-b-2 border-gray-200 dark:border-gray-600">
                  SHARE_VIA
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-sm uppercase text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Link2 className="w-4 h-4 shrink-0" />
                  Copy link
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleShareLinkedIn}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-sm uppercase text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <IconLinkedIn className="w-4 h-4 text-[#0A66C2] shrink-0" />
                  LinkedIn
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleShareFacebook}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-sm uppercase text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <IconFacebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                  Facebook
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleShareX}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-sm uppercase text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <IconX className="w-4 h-4 shrink-0" />
                  X (Twitter)
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-sm uppercase text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <IconWhatsApp className="w-4 h-4 text-[#25D366] shrink-0" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleShareEmail}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-sm uppercase text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  Email
                </button>
              </div>,
              document.body
            )}
          <button
            ref={bookmarkTriggerRef}
            type="button"
            onClick={handleBookmark}
            className="p-2 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Bookmark className="w-5 h-5 text-black dark:text-white" />
            )}
          </button>
          {bookmarkFeedback &&
            bookmarkFeedbackPosition &&
            typeof document !== 'undefined' &&
            createPortal(
              <div
                role="status"
                className="px-3 py-2 w-64 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] text-black dark:text-white font-mono text-xs uppercase"
                style={{
                  position: 'fixed',
                  top: bookmarkFeedbackPosition.top,
                  right: bookmarkFeedbackPosition.right,
                  zIndex: 9999,
                }}
              >
                {bookmarkFeedback === 'saved' && (
                  <>
                    <p className="font-bold">Saved to your list</p>
                    <p className="mt-1 text-gray-600 dark:text-gray-400 normal-case">Browser bookmark: Ctrl+D (Cmd+D on Mac)</p>
                  </>
                )}
                {bookmarkFeedback === 'removed' && <p className="font-bold">Removed from list</p>}
              </div>,
              document.body
            )}
        </div>
      </header>

      <div style={{ minHeight: headerHeight || 80 }} aria-hidden="true" />

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
              {eventType}
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-display font-black uppercase text-black dark:text-white leading-[0.85] mb-12 tracking-tighter max-w-5xl">
            {event.title}
          </h1>

          <div className={`grid grid-cols-1 gap-8 border-y-4 border-black dark:border-white py-8 px-6 md:px-8 ${hasAttendees ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <div className="flex items-center gap-4 w-full min-w-0">
              <Calendar className="w-10 h-10 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase">DATE_STAMP</span>
                <span className="text-2xl font-display uppercase text-black dark:text-white break-words">{event.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full min-w-0">
              <Clock className="w-10 h-10 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase">TIME_WINDOW</span>
                <span className="text-2xl font-display uppercase text-black dark:text-white break-words">{event.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full min-w-0">
              <MapPin className="w-10 h-10 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase">COORDINATES</span>
                <span className="text-2xl font-display uppercase text-black dark:text-white break-words">{event.location ?? 'VIRTUAL_STREAM'}</span>
              </div>
            </div>
            {hasAttendees && (
              <div className="flex items-center gap-4 w-full min-w-0">
                <Users className="w-10 h-10 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-mono font-bold text-gray-500 uppercase">ATTENDEES</span>
                  <span className="text-2xl font-display uppercase text-black dark:text-white break-words">{attendeesCount} JOINED</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
          <div className="lg:col-span-8">
            <section className="mb-16">
              <h3 className="font-display text-3xl uppercase text-black dark:text-white mb-8 flex items-center gap-4">
                <Terminal className="w-8 h-8 text-primary shrink-0" /> BRIEFING_SUMMARY
              </h3>
              <div
                className="font-mono text-xl md:text-2xl font-bold text-black dark:text-white leading-relaxed mb-8 prose prose-lg dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: event.briefSummary ?? '' }}
              />
              <div
                className="bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white p-8 font-mono text-gray-700 dark:text-gray-400 leading-relaxed prose dark:prose-invert max-w-none [&_p]:mb-4 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: event.fullSummary || event.briefSummary || 'No summary available.' }}
              />
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

            {event.attendees && event.attendees.length > 0 && (
              <section className="mb-16">
                <h3 className="font-display text-3xl uppercase text-black dark:text-white mb-8 flex items-center gap-4">
                  <Users className="w-8 h-8 text-primary shrink-0" /> ATTENDEES_LOG
                </h3>
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 transition-all duration-500 ${showAllAttendees ? 'max-h-[600px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}
                >
                  {displayAttendees?.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-black border-2 border-black dark:border-white shadow-brutal-black dark:shadow-brutal-white hover:bg-primary hover:text-black transition-all group"
                    >
                      <div className="w-10 h-10 border-2 border-black dark:border-white overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        {attendee.photoUrl ? (
                          <img
                            src={attendee.photoUrl}
                            alt={attendee.name}
                            width={40}
                            height={40}
                            loading="lazy"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-xs font-bold font-mono text-black dark:text-white">
                            {attendee.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-xs uppercase truncate">{attendee.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-4">
                  {hasAttendees && attendeesCount > (displayAttendees?.length ?? 0) && !showAllAttendees && (
                    <button
                      type="button"
                      onClick={() => setShowAllAttendees(true)}
                      className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 border-4 border-black dark:border-white font-mono font-bold text-sm uppercase hover:bg-primary hover:text-black transition-all shadow-brutal-black dark:shadow-brutal-white active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      + {attendeesCount - (displayAttendees?.length ?? 0)} MORE_OPERATIVES_DETECTED
                    </button>
                  )}
                  {showAllAttendees && (
                    <button
                      type="button"
                      onClick={() => setShowAllAttendees(false)}
                      className="flex-1 flex items-center justify-center p-4 bg-primary text-black border-4 border-black dark:border-white font-mono font-bold text-sm uppercase hover:bg-black hover:text-white transition-all shadow-brutal-black dark:shadow-brutal-white active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      COLLAPSE_LOGS
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-black text-white dark:bg-white dark:text-black p-8 border-4 border-black dark:border-white shadow-brutal-red">
                <h4 className="font-display text-2xl uppercase mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 shrink-0" /> {event.speakers?.length === 1 ? 'LEAD_OPERATIVE' : 'LEAD_OPERATIVES'}
                </h4>
                <div className="space-y-6">
                  {event.speakers?.length ? (
                    event.speakers.map((speaker) => (
                      <div key={speaker.id} className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 border-2 border-primary overflow-hidden shrink-0 bg-gray-800 dark:bg-gray-200">
                          {speaker.avatarUrl ? (
                            <img src={speaker.avatarUrl} alt={speaker.name} width={64} height={64} loading="lazy" className="w-full h-full object-cover grayscale" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-display text-2xl text-primary">
                              {speaker.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-display text-xl uppercase leading-none mb-1">{speaker.name}</h5>
                          <span className="font-mono text-xs text-gray-500 font-bold uppercase">
                            {speaker.role ?? speaker.company ?? 'UMBRACO_SPECIALIST'}
                          </span>
                          {speaker.profileUrl && (
                            <a
                              href={speaker.profileUrl}
                              className="block mt-2 w-full bg-primary text-black py-2 font-display text-sm uppercase border-2 border-black hover:bg-white transition-colors text-center"
                            >
                              VIEW_DOSSIER
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 border-2 border-primary overflow-hidden shrink-0 bg-gray-800 dark:bg-gray-200" />
                        <div>
                          <h5 className="font-display text-xl uppercase leading-none mb-1">SPEAKER</h5>
                          <span className="font-mono text-xs text-gray-500 font-bold uppercase">TBA</span>
                        </div>
                      </div>
                      <a
                        href="/speakers"
                        className="block w-full bg-primary text-black py-3 font-display text-sm uppercase border-2 border-black hover:bg-white transition-colors text-center"
                      >
                        VIEW_FULL_DOSSIER
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-900 p-8 border-4 border-black dark:border-white">
                <h4 className="font-display text-2xl uppercase mb-6">INTEL_RESOURCES</h4>
                <div className="space-y-4">
                  <button type="button" className="w-full flex items-center justify-between p-4 bg-white dark:bg-black border-2 border-black dark:border-white font-mono font-bold text-sm uppercase hover:bg-primary hover:text-black transition-colors">
                    <span className="flex items-center gap-3">
                      <PlayCircle className="w-5 h-5 shrink-0" /> WATCH_RECORDING
                    </span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </button>
                  <button type="button" className="w-full flex items-center justify-between p-4 bg-white dark:bg-black border-2 border-black dark:border-white font-mono font-bold text-sm uppercase hover:bg-primary hover:text-black transition-colors">
                    <span className="flex items-center gap-3">
                      <FileText className="w-5 h-5 shrink-0" /> DOWNLOAD_SLIDES
                    </span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>

              {event.status === 'INCOMING' && (
                <a
                  href={event.url ?? '#'}
                  className="block w-full bg-primary text-black p-8 font-display text-3xl uppercase border-4 border-black shadow-brutal-black hover:translate-y-1 hover:shadow-none transition-all text-center"
                >
                  SECURE_YOUR_SPOT
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
