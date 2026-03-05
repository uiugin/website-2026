/**
 * Marquee component props mapper
 * Maps Umbraco Marquee block properties to Marquee component props
 */
import type { components } from '../api/types.js';

type MarqueeElementModel = components['schemas']['MarqueeElementModel'];

export interface MarqueeProps {
  text?: string;
}

/**
 * Map Umbraco Marquee element to Marquee component props
 */
export function mapMarqueeProps(
  marqueeElement: MarqueeElementModel | null | undefined
): MarqueeProps {
  if (!marqueeElement?.properties) {
    return {};
  }

  const props = marqueeElement.properties;

  return {
    text: props.text || undefined,
  };
}
