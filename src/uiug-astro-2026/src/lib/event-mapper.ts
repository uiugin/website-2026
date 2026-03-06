/**
 * Event mapper - Maps Umbraco Event content to Event interface
 */
import type { components } from '../api/types.js';
import { getContentItem, getPaths } from '../api/umbraco.js';
import type { Event } from '../data/events.js';

type EventContentModel = components['schemas']['EventContentModel'];
type SpeakerContentModel = components['schemas']['SpeakerContentModel'];

/**
 * Format date from ISO string to display format
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format time from ISO string to display format
 */
function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Try to get timezone from the date string if available
    const timezoneMatch = dateString.match(/([A-Z]{3,4})/);
    const timezone = timezoneMatch ? timezoneMatch[1] : 'IST';
    
    return `${timeStr} ${timezone}`;
  } catch {
    return '';
  }
}

/**
 * Fetch speaker name from speaker content
 */
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

/**
 * Map event type from CMS to Event interface type
 */
function mapEventType(eventType: string | null | undefined): Event['type'] {
  if (!eventType) return 'TECHNICAL_BRIEFING';
  
  const upperType = eventType.toUpperCase();
  if (upperType === 'TECHNICAL_BRIEFING' || upperType === 'WORKSHOP' || upperType === 'KEYNOTE' || upperType === 'MEETUP' || upperType === 'HACKATHON') {
    return upperType as Event['type'];
  }
  
  return 'TECHNICAL_BRIEFING';
}

/**
 * Map event status from CMS to Event interface status
 */
function mapEventStatus(status: string | null | undefined): Event['status'] {
  if (!status) return 'ARCHIVED';
  
  const upperStatus = status.toUpperCase();
  // Handle various status formats from CMS
  if (upperStatus === 'INCOMING' || 
      upperStatus === 'UPCOMING_SESSION' || 
      upperStatus.includes('UPCOMING') ||
      upperStatus.includes('INCOMING')) {
    return 'INCOMING';
  }
  // Default to ARCHIVED for anything else (ARCHIVED_DATA_STREAM, ARCHIVED, etc.)
  return 'ARCHIVED';
}

/**
 * Map Umbraco Event content to Event interface
 * @param eventContent The event content from CMS
 * @param path Optional path to use for ID extraction (if route.path is not available)
 */
export async function mapEventFromContent(
  eventContent: EventContentModel | null | undefined,
  path?: string
): Promise<Event | null> {
  if (!eventContent || !eventContent.properties) {
    return null;
  }

  const props = eventContent.properties;
  
  // Extract event properties
  // Handle dropdown values - they might be arrays, objects, or strings
  let eventTypeValue: string | null | undefined = props.eventType;
  
  // Handle array format (e.g., ["TECHNICAL_BRIEFING"])
  if (Array.isArray(eventTypeValue)) {
    eventTypeValue = eventTypeValue.length > 0 ? eventTypeValue[0] : null;
  }
  // Handle object format (e.g., { value: "TECHNICAL_BRIEFING" })
  else if (eventTypeValue && typeof eventTypeValue === 'object' && 'value' in eventTypeValue) {
    eventTypeValue = (eventTypeValue as any).value;
  }
  
  let statusValue: string | null | undefined = props.status;
  
  // Handle array format
  if (Array.isArray(statusValue)) {
    statusValue = statusValue.length > 0 ? statusValue[0] : null;
  }
  // Handle object format
  else if (statusValue && typeof statusValue === 'object' && 'value' in statusValue) {
    statusValue = (statusValue as any).value;
  }
  
  const eventTitle = props.eventTitle || eventContent.name || 'Event';
  const eventType = mapEventType(eventTypeValue);
  const dateAndTime = props.dateAndTime;
  const status = mapEventStatus(statusValue);
  
  // Try to get description from various possible fields
  // The CMS might have briefSummary, fullSummary, or description fields
  const propsAny = props as any;
  const briefSummary = propsAny.briefSummary || propsAny.brief_summary || '';
  const fullSummary = propsAny.fullSummary || propsAny.full_summary || '';
  const description = propsAny.description || '';
  
  // Fetch speaker name - handle array format (e.g., [speakerObject])
  let speakerValue = props.speaker;
  if (Array.isArray(speakerValue)) {
    speakerValue = speakerValue.length > 0 ? speakerValue[0] : null;
  }
  const speaker = await fetchSpeakerName(speakerValue);
  
  // Extract ID from event content (use URL segment from route path, or fallback to UUID)
  let eventId = 'event';
  
  // Try to get ID from route path first
  if (eventContent.route?.path) {
    // Use the last segment of the path as the ID (e.g., "events/event1" -> "event1")
    const pathSegments = eventContent.route.path.split('/').filter(seg => seg && seg !== '#' && seg !== '');
    if (pathSegments.length > 0) {
      eventId = pathSegments[pathSegments.length - 1];
    }
  } else if (path) {
    // Use provided path to extract ID
    const pathSegments = path.split('/').filter(seg => seg && seg !== '#' && seg !== '');
    if (pathSegments.length > 0) {
      eventId = pathSegments[pathSegments.length - 1];
    }
  } else if (eventContent.id) {
    // Fallback to first 8 chars of UUID
    eventId = eventContent.id.substring(0, 8);
  }
  
  // Format date and time
  const date = formatDate(dateAndTime);
  const time = formatTime(dateAndTime);
  
  // Location - we'll need to add this to the CMS or use a default
  const location = propsAny.location || 'VIRTUAL_STREAM';
  
  // Use briefSummary as description, or fullSummary if briefSummary is empty, or description field
  const eventDescription = briefSummary || fullSummary || description || 'No description available.';

  // Validate that we have at least a title - if not, this event is invalid
  if (!eventTitle || eventTitle === 'Event' || eventTitle.trim() === '') {
    return null;
  }
  
  const mappedEvent = {
    id: eventId,
    title: eventTitle.toUpperCase(),
    type: eventType,
    speaker: speaker,
    date: date,
    time: time,
    location: location,
    status: status,
    description: eventDescription,
    // agenda can be added later if needed in CMS
  };
  
  return mappedEvent;
}

/**
 * Fetch all events from CMS
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    // Get all paths under "events"
    const paths = await getPaths('events');
    
    if (!paths || paths.length === 0) {
      return [];
    }
    
    // Fetch all event content in parallel
    const eventPromises = paths.map(async (pathItem) => {
      try {
        const path = pathItem.path;
        
        if (!path || path === '#') {
          return null;
        }
        
        // Clean path: remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        const eventContent = await getContentItem(cleanPath);
        
        if (eventContent) {
          if (eventContent.contentType === 'event') {
            // Pass the original path to help with ID extraction
            const mappedEvent = await mapEventFromContent(eventContent as EventContentModel, path);
            return mappedEvent;
          }
        }
        return null;
      } catch {
        return null;
      }
    });
    
    const events = await Promise.all(eventPromises);
    
    // Filter out null results
    const validEvents = events.filter((event): event is Event => event !== null);
    
    return validEvents;
  } catch {
    return [];
  }
}

/**
 * Fetch a single event by ID (URL segment or path)
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    let eventContent: EventContentModel | null = null;
    let usedPath: string | null = null;
    
    // Try multiple path variations
    const pathVariations = [
      `events/${id}`,  // Most common: events/041, events/event1
      id,              // Direct path if ID is full path
      `events/${id.toLowerCase()}`, // Lowercase variant
    ];
    
    for (const path of pathVariations) {
      try {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const content = await getContentItem(cleanPath);
        if (content && content.contentType === 'event') {
          eventContent = content as EventContentModel;
          usedPath = path;
          break;
        }
      } catch {
        // Continue to next variation
        continue;
      }
    }
    
    // If direct fetch failed, try to find by matching ID in all events
    if (!eventContent) {
      const allEvents = await getAllEvents();
      const foundEvent = allEvents.find(e => e.id === id || e.id.toLowerCase() === id.toLowerCase());
      if (foundEvent) {
        return foundEvent;
      }
    }
    
    if (eventContent) {
      // Pass the used path to help with ID extraction
      return await mapEventFromContent(eventContent, usedPath || undefined);
    }
    
    return null;
  } catch {
    return null;
  }
}
