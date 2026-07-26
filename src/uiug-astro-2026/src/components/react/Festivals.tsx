import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';
import type { FestivalImage, FestivalsProps } from '../../lib/festivals-mapper';
import { appendImageCrop } from '../../api/umbraco-utils';

interface Props {
  festivals?: FestivalsProps | null;
}

/** LinkedIn-style portrait poster crop (4:5) */
const POSTER_W = 480;
const POSTER_H = 600;
const VISIBLE = 3;
const GAP = 12;

function resolveImageSrc(url: string): string {
  return url.includes('/media/') ? appendImageCrop(url, POSTER_W, POSTER_H) : url;
}

const Festivals: React.FC<Props> = ({ festivals: festivalsData }) => {
  const data = festivalsData ?? {};
  const sectionTitle = data.title || 'OUR_FESTIVALS';
  const items = data.festivals ?? [];
  const festival = items[0];

  const images: FestivalImage[] = festival?.images?.length ? festival.images : [];
  const viewportRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);

  const maxPage = Math.max(0, images.length - VISIBLE);
  const canScroll = images.length > VISIBLE;
  const step = cardWidth + GAP;

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const next = (el.clientWidth - GAP * (VISIBLE - 1)) / VISIBLE;
    setCardWidth(Math.max(0, Math.floor(next)));
  }, []);

  useEffect(() => {
    measure();
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, images.length]);

  useEffect(() => {
    setPage(0);
  }, [festival?.id]);

  useEffect(() => {
    if (!canScroll || paused || step <= 0) return;
    const timer = window.setInterval(() => {
      setPage((prev) => (prev >= maxPage ? 0 : prev + 1));
    }, 4500);
    return () => window.clearInterval(timer);
  }, [canScroll, maxPage, paused, step]);

  const goTo = (next: number) => {
    setPage(Math.max(0, Math.min(next, maxPage)));
  };

  const pageLabel = useMemo(() => {
    if (images.length === 0) return '00/00';
    const start = page + 1;
    const end = Math.min(page + VISIBLE, images.length);
    return `${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
  }, [page, images.length]);

  if (!festival) return null;

  return (
    <section className="w-full relative z-10 mb-20 md:mb-28" id="festivals" aria-labelledby="festivals-heading">
      <Reveal width="100%">
        <div className="px-4 md:px-10 mb-6 md:mb-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            // {sectionTitle}
          </p>
        </div>
      </Reveal>

      <Reveal width="100%" delay={0.08}>
        <article className="group relative w-full overflow-hidden bg-primary text-black border-y-4 border-black dark:border-white -rotate-1 scale-[1.02] shadow-brutal-black dark:shadow-brutal-white hover:rotate-0 hover:scale-100 transition-transform duration-500">
          <div className="absolute inset-0 lego-studs opacity-10 pointer-events-none" aria-hidden />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-6 px-6 md:px-10 lg:px-12 xl:px-16 py-10 md:py-14">
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 order-2 lg:order-1">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest">
                <span>{festival.status === 'ARCHIVED' ? 'PAST_SIGNAL' : 'NEXT_SIGNAL'}</span>
                <span aria-hidden>·</span>
                <span>{festival.date}</span>
                <span aria-hidden>·</span>
                <span>{festival.location}</span>
              </div>

              <div>
                <h2
                  id="festivals-heading"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase leading-[0.85] tracking-tighter text-black"
                >
                  {festival.name}
                </h2>
                <p className="mt-4 max-w-md font-mono text-sm font-bold uppercase tracking-wide text-black/80">
                  {festival.tagline}
                </p>
                <p className="mt-3 max-w-md font-mono text-sm font-medium leading-relaxed text-black/90">
                  {festival.description}
                </p>
              </div>

              <a
                href={festival.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 self-start bg-black text-white px-5 py-3 font-display text-base uppercase border-4 border-black hover:bg-white hover:text-black transition-colors"
              >
                {festival.linkLabel || 'ENTER FESTIVAL'}
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>

            {images.length > 0 && (
              <div
                className="lg:col-span-7 order-1 lg:order-2 w-full min-w-0"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/70">
                    // POSTER_FEED · 4:5
                  </p>
                  {canScroll && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPaused(true);
                          goTo(page - 1);
                        }}
                        disabled={page <= 0}
                        className="bg-black text-white border-2 border-black p-2 disabled:opacity-30 hover:bg-white hover:text-black transition-colors"
                        aria-label="Previous posters"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaused(true);
                          goTo(page + 1);
                        }}
                        disabled={page >= maxPage}
                        className="bg-black text-white border-2 border-black p-2 disabled:opacity-30 hover:bg-white hover:text-black transition-colors"
                        aria-label="Next posters"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/80">
                        {pageLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div ref={viewportRef} className="w-full overflow-hidden" aria-label="Festival posters">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      gap: GAP,
                      transform: step > 0 ? `translate3d(-${page * step}px, 0, 0)` : undefined,
                    }}
                  >
                    {images.map((image, index) => (
                      <figure
                        key={`${image.url}-${index}`}
                        className="relative shrink-0 aspect-[4/5] border-4 border-black dark:border-white bg-black shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] overflow-hidden"
                        style={cardWidth > 0 ? { width: cardWidth } : { width: `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})` }}
                      >
                        <img
                          src={resolveImageSrc(image.url)}
                          alt={image.alt || `${festival.name} poster ${index + 1}`}
                          width={POSTER_W}
                          height={POSTER_H}
                          loading={index < VISIBLE ? 'eager' : 'lazy'}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),transparent)] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40"
                          aria-hidden
                        />
                        <figcaption className="absolute top-1.5 left-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white bg-black/70 border border-white px-1 py-0.5">
                          {String(index + 1).padStart(2, '0')}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>
      </Reveal>
    </section>
  );
};

export default Festivals;
