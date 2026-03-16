import React, { useEffect, useRef } from 'react';

const SCRIPT_URL = 'https://unpkg.com/website-carbon-badges@1.1.3/b.min.js';

interface CarbonBadgeProps {
  /** Use dark theme (for dark backgrounds) */
  dark?: boolean;
  /** 'header' = primary badge (id wcb); 'footer' = clone of primary for second placement */
  variant?: 'header' | 'footer';
}

/**
 * Website Carbon badge – shows CO2 impact. Script inits #wcb only; footer variant copies content from #wcb.
 */
const CarbonBadge: React.FC<CarbonBadgeProps> = ({ dark = true, variant = 'header' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHeader = variant === 'header';

  useEffect(() => {
    if (!containerRef.current) return;

    const initScript = () => {
      if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return;
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.defer = true;
      document.body.appendChild(script);
    };

    if (isHeader) {
      initScript();
      return;
    }

    // Footer: wait for #wcb to be filled by the badge script, then copy to our container
    const copyFromPrimary = () => {
      const primary = document.getElementById('wcb');
      if (!primary?.innerHTML || !containerRef.current) return;
      containerRef.current.innerHTML = primary.innerHTML;
    };

    initScript();
    const t = setInterval(() => {
      const primary = document.getElementById('wcb');
      if (primary?.innerHTML?.trim()) {
        copyFromPrimary();
        clearInterval(t);
      }
    }, 200);
    const done = setTimeout(() => clearInterval(t), 10000);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [isHeader]);

  const className = `carbonbadge ${dark ? 'wcb-d' : ''}`.trim();
  return (
    <div
      ref={containerRef}
      id={isHeader ? 'wcb' : 'wcb-f'}
      className={`flex items-center justify-center ${className}`}
      aria-label="Website carbon emissions badge"
    />
  );
};

export default CarbonBadge;
