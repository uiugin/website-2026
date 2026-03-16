import React from 'react';
import { WebsiteCarbonBadge } from 'react-websitecarbon-badge';

/** From websitecarbon.com result (16 Mar 2026) – A+ rating, avoids API fetch */
const DEFAULT_CO2 = '0.04';
const DEFAULT_PERCENTAGE = '93';

interface CarbonBadgeProps {
  /** Use dark theme (for dark backgrounds) */
  dark?: boolean;
  /** Override CO2 (g per view); default from last websitecarbon.com test */
  co2?: string;
  /** Override percentage (cleaner than X%); default from last websitecarbon.com test */
  percentage?: string;
}

/**
 * Website Carbon badge – shows CO2 impact (A+ for uiug.in). Uses static values from
 * websitecarbon.com so the badge works without calling the API.
 */
const CarbonBadge: React.FC<CarbonBadgeProps> = ({
  dark = true,
  co2 = DEFAULT_CO2,
  percentage = DEFAULT_PERCENTAGE,
}) => (
  <div
    className="flex items-center justify-center origin-center scale-70"
    aria-label="Website carbon emissions badge"
  >
    <WebsiteCarbonBadge dark={dark} url="uiug.in" co2={co2} percentage={percentage} />
  </div>
);

export default CarbonBadge;
