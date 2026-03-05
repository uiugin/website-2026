/**
 * Countdown component props mapper
 * Maps Umbraco Countdown block properties to Countdown component props
 */
import type { components } from '../api/types.js';

type CountdownElementModel = components['schemas']['CountdownElementModel'];

export interface CountdownProps {
  subtitle?: string;
  title?: string;
  timer?: string; // ISO date-time string
  timezone?: string;
}

/**
 * Map Umbraco Countdown element to Countdown component props
 */
export function mapCountdownProps(
  countdownElement: CountdownElementModel | null | undefined
): CountdownProps {
  if (!countdownElement?.properties) {
    return {};
  }

  const props = countdownElement.properties;

  return {
    subtitle: props.countdownSubtitle || undefined,
    title: props.session || undefined,
    timer: props.timer || undefined,
    timezone: undefined, // Timezone might not be in the API, handle in component if needed
  };
}
