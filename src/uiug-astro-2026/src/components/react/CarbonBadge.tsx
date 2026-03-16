import React from 'react';

/** From websitecarbon.com result (16 Mar 2026) – A+ rating */
const DEFAULT_CO2 = '0.04';
const DEFAULT_PERCENTAGE = '93';

/** Website Carbon brand: dark blue, teal/aqua (matches official badge) */
const DARK_BLUE = '#1a00c8';
const TEAL = '#00e887';

interface CarbonBadgeProps {
  dark?: boolean;
  co2?: string;
  percentage?: string;
}

/**
 * Website Carbon badge – pure HTML + inline styles so it never loses styles
 * across Astro view transitions (no styled-components).
 */
const CarbonBadge: React.FC<CarbonBadgeProps> = ({
  dark = true,
  co2 = DEFAULT_CO2,
  percentage = DEFAULT_PERCENTAGE,
}) => {
  const pct = parseInt(percentage, 10);
  const line2 =
    pct > 50
      ? `Cleaner than ${percentage}% of pages tested`
      : `Dirtier than ${percentage}% of pages tested`;

  return (
    <div
      className="flex items-center justify-center origin-center scale-90"
      aria-label="Website carbon emissions badge"
      style={{ fontSize: '15px', color: DARK_BLUE, lineHeight: 1.15, textAlign: 'center' }}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex">
          {/* Left: white bg, dark blue text, teal border (same in light & dark) */}
          <a
            href="https://www.websitecarbon.com/website/uiug.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-center text-[0.8rem] leading-tight no-underline py-1.5 px-2 min-w-[8em] border-2 rounded-l-[6px] border-r-0 font-semibold"
            style={{
              background: '#fff',
              color: DARK_BLUE,
              borderColor: TEAL,
            }}
          >
            {co2}g of CO<sub style={{ verticalAlign: 'baseline', position: 'relative', top: '0.15em', fontSize: '0.7em' }}>2</sub>/view
          </a>
          {/* Right: light = dark blue bg + white text; dark = teal bg + dark blue text */}
          <a
            href="https://websitecarbon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-center text-[0.8rem] leading-tight no-underline py-1.5 px-2 border-2 rounded-r-[6px] border-l-0 font-bold"
            style={{
              background: dark ? TEAL : DARK_BLUE,
              color: dark ? DARK_BLUE : '#fff',
              borderColor: TEAL,
            }}
          >
            Website Carbon
          </a>
        </div>
        <span
          className="inline-flex text-[0.8rem] font-normal"
          style={{ color: dark ? '#fff' : DARK_BLUE }}
        >
          {line2}
        </span>
      </div>
    </div>
  );
};

export default CarbonBadge;
