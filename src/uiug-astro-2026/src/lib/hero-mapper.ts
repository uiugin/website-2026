/**
 * Hero component props mapper
 * Maps Umbraco Hero block properties to Hero component props
 */
import type { components } from '../api/types.js';
import { getMediaUrl, getContentItem } from '../api/umbraco.js';

type HeroElementModel = components['schemas']['HeroElementModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];
type IApiContentModel = components['schemas']['IApiContentModel'];

export interface HeroProps {
  status?: string;
  title?: string;
  caption?: string;
  buttons?: Array<{ text: string; url: string; variant?: 'primary' | 'outline' }>;
  slideImage?: string;
  slideLabel?: string;
  slideLabelTwo?: string;
  upcomingSessionTitle?: string;
  upcomingSessionDate?: string;
  upcomingSessionTime?: string;
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
 * Format date and time from Umbraco date format
 */
function formatDate(dateString: string | null | undefined): { date: string; time: string } {
  if (!dateString) return { date: '', time: '' };
  
  try {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return {
      date: `${month} ${day}`,
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} IST`
    };
  } catch {
    // If parsing fails, return original string split if possible
    return { date: dateString, time: '' };
  }
}

/**
 * Fetch event content from upcomingSession
 */
async function fetchUpcomingSession(
  upcomingSession: IApiContentModel | IApiContentModel[] | null | undefined
): Promise<{ title?: string; date?: string; time?: string }> {
  if (!upcomingSession) {
    return {};
  }

  // Handle case where upcomingSession is an array (should extract first element)
  let sessionContent: IApiContentModel | null = null;
  if (Array.isArray(upcomingSession)) {
    sessionContent = upcomingSession.length > 0 ? upcomingSession[0] : null;
  } else {
    sessionContent = upcomingSession;
  }

  if (!sessionContent) {
    return {};
  }

  try {
    // Check if properties are already expanded
    if ('properties' in sessionContent) {
      const eventProps = (sessionContent as any).properties;
      
      if (eventProps) {
        // Try different possible property names
        const eventTitle = eventProps.eventTitle || eventProps.title || '';
        const dateAndTime = eventProps.dateAndTime || eventProps.date || eventProps.dateTime || '';
        
        if (eventTitle || dateAndTime) {
          const { date, time } = formatDate(dateAndTime);
          
          return {
            title: eventTitle,
            date,
            time
          };
        }
      }
    }
    
    // If not expanded, fetch by route path
    if (sessionContent.route?.path) {
      let cleanPath = sessionContent.route.path.startsWith('/') 
        ? sessionContent.route.path.substring(1) 
        : sessionContent.route.path;
      cleanPath = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
      
      if (cleanPath && cleanPath !== '#' && cleanPath !== '') {
        try {
          const eventContent = await getContentItem(cleanPath);
          
          if (eventContent && 'properties' in eventContent) {
            const eventProps = (eventContent as any).properties;
            
            if (eventProps) {
              // Try different possible property names
              const eventTitle = eventProps.eventTitle || eventProps.title || '';
              const dateAndTime = eventProps.dateAndTime || eventProps.date || eventProps.dateTime || '';
              
              if (eventTitle || dateAndTime) {
                const { date, time } = formatDate(dateAndTime);
                
                return {
                  title: eventTitle,
                  date,
                  time
                };
              }
            }
          }
        } catch (fetchError) {
          // Silently handle fetch errors
        }
      }
    }
    
    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Map Umbraco Hero element to Hero component props
 */
export async function mapHeroProps(
  heroElement: HeroElementModel | null | undefined
): Promise<HeroProps> {
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
        
        // Always add button - even if URL is just "/" or "#", we'll use it
        // The button will still be clickable (even if it goes to "#")
        buttons.push({
          text: linkTitle.trim(),
          url: linkUrl || '#',
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
  
  // Fetch upcoming session event
  const upcomingSession = await fetchUpcomingSession(props.upcomingSession);
  
  return {
    status: props.heroSubtitle || undefined,
    title: props.heroTitle || undefined, // May contain HTML
    caption: props.heroCaptionText || undefined,
    buttons: buttons.length > 0 ? buttons : undefined,
    slideImage,
    slideLabel: props.slideLabel || undefined,
    slideLabelTwo: props.slideLabelTwo || undefined,
    upcomingSessionTitle: upcomingSession.title || undefined,
    upcomingSessionDate: upcomingSession.date || undefined,
    upcomingSessionTime: upcomingSession.time || undefined,
  };
}
