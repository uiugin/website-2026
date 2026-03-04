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
  
  // Prefer url, then route.path
  const href = link.url ?? link.route?.path ?? '#';
  
  // Normalize special cases like "/#/" to "/"
  if (href === '/#/' || href === '#/') {
    return '/';
  }
  
  // Ensure href starts with / for relative paths, or is absolute
  if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('/')) {
    return `/${href}`;
  }
  
  return href;
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
  // Handle both array and single value cases (single URL picker in Umbraco 17)
  if (props.heroCaptionButton) {
    // Handle single URL picker - could be array with one item, or single object
    let buttonLinks: any[] = [];
    
    if (Array.isArray(props.heroCaptionButton)) {
      buttonLinks = props.heroCaptionButton;
    } else if (typeof props.heroCaptionButton === 'object' && props.heroCaptionButton !== null) {
      // Single object - wrap in array
      buttonLinks = [props.heroCaptionButton];
    }
    
    // Debug logging in development - log the raw link data
    if (import.meta.env.DEV) {
      console.log('Hero mapper - heroCaptionButton from Umbraco (raw):', props.heroCaptionButton);
      console.log('Hero mapper - heroCaptionButton type:', typeof props.heroCaptionButton, Array.isArray(props.heroCaptionButton));
      console.log('Hero mapper - heroCaptionButton (stringified):', JSON.stringify(props.heroCaptionButton, null, 2));
      console.log('Hero mapper - buttonLinks array:', buttonLinks);
      console.log('Hero mapper - buttonLinks length:', buttonLinks.length);
    }
    
    buttonLinks.forEach((link, index) => {
      if (link) {
        // Extract title - prioritize link.title, fallback to route path name
        let linkTitle = link.title;
        
        // If title is missing or empty, try to extract from route path
        if (!linkTitle || linkTitle.trim() === '' || linkTitle === '/') {
          if (link.route?.path) {
            // Extract last segment from path (e.g., "/events/" -> "events")
            const pathSegments = link.route.path.split('/').filter(Boolean);
            if (pathSegments.length > 0) {
              // Capitalize first letter and use as title
              const lastSegment = pathSegments[pathSegments.length - 1];
              linkTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
            }
          }
        }
        
        // Final fallback
        if (!linkTitle || linkTitle.trim() === '') {
          linkTitle = 'Button';
        }
        
        const linkUrl = linkHref(link);
        
        // Debug each link
        if (import.meta.env.DEV) {
          console.log(`Hero mapper - Processing link ${index}:`, {
            link,
            title: link.title,
            url: link.url,
            route: link.route,
            linkType: link.linkType,
            extractedTitle: linkTitle,
            finalUrl: linkUrl
          });
        }
        
        // Always add button - even if URL is just "/" or "#", we'll use it
        // The button will still be clickable (even if it goes to "#")
        buttons.push({
          text: linkTitle.trim(),
          url: linkUrl || '#',
          variant: (index === 0 ? 'primary' : 'outline') as 'primary' | 'outline', // First button is primary, rest are outline
        });
        
        if (import.meta.env.DEV) {
          console.log(`Hero mapper - Added button ${index}:`, {
            text: linkTitle.trim(),
            url: linkUrl || '#',
            variant: index === 0 ? 'primary' : 'outline'
          });
        }
      }
    });
  }
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('Hero mapper - Final mapped buttons array:', buttons);
    console.log('Hero mapper - Buttons count:', buttons.length);
  }

  // Get slide image URL
  let slideImage: string | undefined;
  if (props.slideImage && Array.isArray(props.slideImage) && props.slideImage.length > 0) {
    slideImage = getMediaUrl(props.slideImage[0]);
  }

  // Debug final result
  if (import.meta.env.DEV) {
    console.log('Hero mapper - Final result:', {
      status: props.heroSubtitle || undefined,
      title: props.heroTitle || undefined,
      caption: props.heroCaptionText || undefined,
      buttonsCount: buttons.length,
      buttons: buttons,
      slideImage
    });
  }
  
  return {
    status: props.heroSubtitle || undefined,
    title: props.heroTitle || undefined, // May contain HTML
    caption: props.heroCaptionText || undefined,
    buttons: buttons.length > 0 ? buttons : undefined,
    slideImage,
  };
}
