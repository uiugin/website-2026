/**
 * Marquee Reverse component props mapper
 * Maps Umbraco Marquee Reverse block properties to Marquee Reverse component props
 */
import type { components } from '../api/types.js';

type MarqueeReverseElementModel = components['schemas']['MarqueeReverseElementModel'];

export interface MarqueeReverseProps {
  text?: string;
}

/**
 * Map Umbraco Marquee Reverse element to Marquee Reverse component props
 */
export function mapMarqueeReverseProps(
  marqueeReverseElement: MarqueeReverseElementModel | null | undefined
): MarqueeReverseProps {
  if (!marqueeReverseElement?.properties) {
    return {};
  }

  const props = marqueeReverseElement.properties;

  return {
    text: props.text || undefined,
  };
}
