/**
 * Contact component props mapper
 * Maps Umbraco Contact Us block properties to Contact component props
 */
import type { components } from '../api/types.js';

type ContactUsElementModel = components['schemas']['ContactUsElementModel'];

export interface ContactProps {
  title?: string;
}

/**
 * Map Umbraco Contact Us element to Contact component props
 */
export function mapContactProps(
  contactElement: ContactUsElementModel | null | undefined
): ContactProps {
  if (!contactElement?.properties) {
    return {};
  }

  const props = contactElement.properties;

  return {
    title: props.title || undefined,
  };
}
