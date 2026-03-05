/**
 * Latest Events component props mapper
 * Maps Umbraco Latest Events block properties to Latest Events component props
 */
import type { components } from '../api/types.js';
import { getContentItem } from '../api/umbraco.js';

type LatestEventsElementModel = components['schemas']['LatestEventsElementModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];
type EventContentModel = components['schemas']['EventContentModel'];
type SpeakerContentModel = components['schemas']['SpeakerContentModel'];

export interface Event {
  id: string;
  title: string;
  type: string;
  speaker: string;
  date: string;
  status: 'INCOMING' | 'ARCHIVED';
  colors: 'default' | 'yellow' | 'accent';
  url?: string;
}

export interface LatestEventsProps {
  title?: string;
  events?: Event[];
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

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Format time if available
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeStr = hours !== 0 || minutes !== 0 
      ? ` ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` 
      : '';
    
    return `${month} ${day}, ${year}${timeStr}`;
  } catch {
    return dateString;
  }
}

async function fetchSpeakerName(speaker: components['schemas']['IApiContentModel'] | null | undefined): Promise<string> {
  if (!speaker) {
    return 'SPEAKER';
  }
  
  // Check if speaker properties are already expanded
  if (speaker.contentType === 'speaker' && 'properties' in speaker) {
    const speakerProps = (speaker as SpeakerContentModel).properties;
    if (speakerProps?.speakerName) {
      const name = speakerProps.speakerName.toUpperCase().replace(/\s+/g, '_');
      return name;
    }
    // Fallback to name if speakerName is not available
    if (speaker.name) {
      const name = speaker.name.toUpperCase().replace(/\s+/g, '_');
      return name;
    }
  }
  
  // If properties are not expanded, try to fetch speaker content
  if (speaker.route?.path) {
    try {
      const cleanPath = speaker.route.path.startsWith('/') ? speaker.route.path.substring(1) : speaker.route.path;
      if (cleanPath && cleanPath !== '#' && cleanPath !== '') {
        const speakerContent = await getContentItem(cleanPath);
        if (speakerContent) {
          if (speakerContent.contentType === 'speaker') {
            const speakerProps = (speakerContent as SpeakerContentModel).properties;
            if (speakerProps?.speakerName) {
              const name = speakerProps.speakerName.toUpperCase().replace(/\s+/g, '_');
              return name;
            }
            // Fallback to name
            if (speakerContent.name) {
              const name = speakerContent.name.toUpperCase().replace(/\s+/g, '_');
              return name;
            }
          }
        }
      }
    } catch (error) {
      // Silently handle fetch errors
    }
  }
  
  // Fallback to name property if available
  if (speaker.name) {
    const name = speaker.name.toUpperCase().replace(/\s+/g, '_');
    return name;
  }
  
  return 'SPEAKER';
}

async function fetchEventContent(destinationId: string | null | undefined, routePath: string | null | undefined): Promise<EventContentModel | null> {
  if (!destinationId && !routePath) return null;
  
  try {
    // Try to fetch by route path first (more reliable)
    if (routePath) {
      // Remove leading slash if present, getContentItem expects path without leading slash
      const cleanPath = routePath.startsWith('/') ? routePath.substring(1) : routePath;
      if (cleanPath && cleanPath !== '#' && cleanPath !== '') {
        const content = await getContentItem(cleanPath);
        if (content && content.contentType === 'event') {
          return content as EventContentModel;
        }
      }
    }
    
    // Fallback: try to fetch by ID if we have destinationId
    // Note: This might require a different API endpoint
    return null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to fetch event content:', error);
    }
    return null;
  }
}

/**
 * Map Umbraco Latest Events element to Latest Events component props
 */
export async function mapLatestEventsProps(
  latestEventsElement: LatestEventsElementModel | null | undefined
): Promise<LatestEventsProps> {
  if (!latestEventsElement?.properties) {
    return {};
  }

  const props = latestEventsElement.properties;
  const events: Event[] = [];

  // Map moreButton links to events
  if (props.moreButton && Array.isArray(props.moreButton)) {
    // Fetch all event content in parallel
    const eventContentPromises = props.moreButton.map(async (link, index) => {
      if (!link) return null;

      const eventUrl = linkHref(link);
      const routePath = link.route?.path;
      const destinationId = link.destinationId;
      
      // Fetch event content
      const eventContent = await fetchEventContent(destinationId, routePath);
      
      if (eventContent && eventContent.properties) {
        const eventProps = eventContent.properties;
        
        // Extract event properties
        const eventTitle = eventProps.eventTitle || link.title || 'Event';
        const eventType = eventProps.eventType || 'EVENT';
        const dateAndTime = eventProps.dateAndTime;
        const status = (eventProps.status?.toUpperCase() === 'INCOMING' ? 'INCOMING' : 'ARCHIVED') as 'INCOMING' | 'ARCHIVED';
        const colors = (eventProps.colors?.toLowerCase() || 'default') as 'default' | 'yellow' | 'accent';
        
        // Fetch speaker name (may need to fetch speaker content separately)
        const speaker = await fetchSpeakerName(eventProps.speaker);
        
        // Extract ID from event content
        const eventId = eventContent.id || destinationId || link.route?.startItem?.id || `event-${index}`;
        
        return {
          id: eventId.substring(0, 8), // Use first 8 chars of UUID
          title: eventTitle.toUpperCase(),
          type: eventType.toUpperCase(),
          speaker: speaker,
          date: formatDate(dateAndTime),
          status: status,
          colors: colors,
          url: eventUrl
        };
      } else {
        // Fallback: use link data if event content not available
        const eventTitle = link.title || 'Event';
        const eventId = destinationId || link.route?.startItem?.id || `event-${index}`;
        
        return {
          id: eventId.substring(0, 8),
          title: eventTitle.toUpperCase(),
          type: 'EVENT',
          speaker: 'SPEAKER',
          date: '',
          status: 'ARCHIVED' as const,
          colors: 'default' as const,
          url: eventUrl
        };
      }
    });

    // Wait for all event content to be fetched
    const eventResults = await Promise.all(eventContentPromises);
    
    // Filter out null results and add to events array
    eventResults.forEach((event) => {
      if (event) {
        events.push(event);
      }
    });
  }

  return {
    title: props.title || undefined,
    events: events.length > 0 ? events : undefined,
  };
}
