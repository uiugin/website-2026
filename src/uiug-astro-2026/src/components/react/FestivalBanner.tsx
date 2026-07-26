import React, { useMemo } from 'react';
import type { FestivalBannerProps } from '../../lib/festival-mapper';

interface Props {
  festival?: FestivalBannerProps | null;
}

const FestivalBanner: React.FC<Props> = ({ festival }) => {
  const items = festival?.marqueeItems;
  const hasItems = Boolean(items?.length);

  const trackText = useMemo(() => {
    if (!items?.length) return '';
    const segment = items.map((s) => s.toUpperCase()).join('  *  ') + '  *  ';
    return segment.repeat(4);
  }, [items]);

  if (!festival || !hasItems) return null;

  const target = festival.linkTarget ?? '_blank';
  const isExternal = target === '_blank' || /^https?:\/\//i.test(festival.linkUrl);
  const href = festival.linkUrl && festival.linkUrl !== '#' ? festival.linkUrl : undefined;

  const track = (
    <>
      <span className="festival-banner__track" aria-hidden="true">
        <span className="festival-banner__text">{trackText}</span>
        <span className="festival-banner__text">{trackText}</span>
      </span>
      <span className="sr-only">{festival.festivalName}</span>
    </>
  );

  if (!href) {
    return (
      <div className="festival-banner" aria-label={festival.festivalName}>
        {track}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={target || undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="festival-banner group"
      aria-label={`${festival.festivalName} — ${href}`}
    >
      {track}
    </a>
  );
};

export default FestivalBanner;
