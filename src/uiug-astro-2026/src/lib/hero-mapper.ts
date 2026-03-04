/**
 * Hero component props mapper
 * Maps Umbraco Hero block properties to Hero component props
 */
import type { components } from '../api/types.js';
import { getMediaUrl } from '../api/umbraco.js';

type HeroElementModel = components['schemas']['HeroElementModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];

export interface HeroProps {
  status?: string;
  title?: string;
  caption?: string;
  buttons?: Array<{ text: string; url: string; variant?: 'primary' | 'outline' }>;
  slideImage?: string;
}

function linkHref(link: ApiLinkModel | null | undefined): string {
  if (!link) return '#';
  return link.url ?? link.route?.path ?? '#';
}

/**
 * Map Umbraco Hero element to Hero component props
 */
export function mapHeroProps(
  heroElement: HeroElementModel | null | undefined
): HeroProps {
  if (!heroElement?.properties) {
    return {};
  }

  const props = heroElement.properties;
  const buttons: HeroProps['buttons'] = [];
  
  // Map heroCaptionButton to buttons array
  if (props.heroCaptionButton && Array.isArray(props.heroCaptionButton)) {
    props.heroCaptionButton.forEach((link, index) => {
      if (link) {
        buttons.push({
          text: link.title || 'Button',
          url: linkHref(link),
          variant: (index === 0 ? 'primary' : 'outline') as 'primary' | 'outline', // First button is primary, rest are outline
        });
      }
    });
  }

  // Get slide image URL
  let slideImage: string | undefined;
  if (props.slideImage && Array.isArray(props.slideImage) && props.slideImage.length > 0) {
    slideImage = getMediaUrl(props.slideImage[0]);
  }

  return {
    status: props.heroSubtitle || undefined,
    title: props.heroTitle || undefined, // May contain HTML
    caption: props.heroCaptionText || undefined,
    buttons: buttons.length > 0 ? buttons : undefined,
    slideImage,
  };
}
