/**
 * Component Order Mapper
 * Maps Umbraco contentType to component identifiers for dynamic rendering
 */

export type ComponentIdentifier =
  | 'hero'
  | 'marquee'
  | 'marqueeReverse'
  | 'features'
  | 'countdown'
  | 'latestEvents'
  | 'speakers'
  | 'showcase'
  | 'sponsors'
  | 'gallery'
  | 'appreciation'
  | 'faq'
  | 'contact'
  | 'festivalBanner'
  | 'festivals'
  | 'achievement'
  | null;

/**
 * Maps Umbraco contentType to component identifier
 * @param contentType - The contentType from Umbraco block
 * @returns Component identifier or null if unmapped
 */
export function getComponentIdentifier(contentType: string | null | undefined): ComponentIdentifier {
  if (!contentType) return null;

  const typeMap: Record<string, ComponentIdentifier> = {
    hero: 'hero',
    marquee: 'marquee',
    marqueeReverse: 'marqueeReverse',
    features: 'features',
    countdown: 'countdown',
    latestEvents: 'latestEvents',
    speakersElement: 'speakers',
    projectsShowcase: 'showcase',
    sponsors: 'sponsors',
    gallery: 'gallery',
    appreciationBlock: 'appreciation',
    faq: 'faq',
    contactUs: 'contact',
    festivalBanner: 'festivalBanner',
    festivals: 'festivals',
    achievement: 'achievement',
  };

  return typeMap[contentType] || null;
}
