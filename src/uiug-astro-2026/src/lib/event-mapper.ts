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
  console.log('[Event Mapper] mapEventFromContent() called with:', {
    hasContent: !!eventContent,
    hasProperties: !!eventContent?.properties,
    path: path,
    contentType: eventContent?.contentType,
    name: eventContent?.name
  });
  
  if (!eventContent || !eventContent.properties) {
    console.warn('[Event Mapper] ⚠️ mapEventFromContent: Missing content or properties');
    return null;
  }

  const props = eventContent.properties;
  
  // Log ALL properties to see what we're getting
  console.log('[Event Mapper] ===== ALL EVENT PROPERTIES =====');
  console.log('[Event Mapper] Raw properties object:', JSON.stringify(props, null, 2));
  console.log('[Event Mapper] Property keys:', Object.keys(props || {}));
  console.log('[Event Mapper] =================================');
  
  console.log('[Event Mapper] Event properties found:', {
    hasEventTitle: !!props.eventTitle,
    hasEventType: !!props.eventType,
    hasDateAndTime: !!props.dateAndTime,
    hasStatus: !!props.status,
    hasSpeaker: !!props.speaker,
    eventTitle: props.eventTitle,
    eventType: props.eventType,
    eventTypeType: typeof props.eventType,
    eventTypeValue: props.eventType,
    status: props.status,
    statusType: typeof props.status,
    statusValue: props.status
  });
  
  // Extract event properties
  // Handle dropdown values - they might be arrays, objects, or strings
  let eventTypeValue: string | null | undefined = props.eventType;
  
  // Handle array format (e.g., ["TECHNICAL_BRIEFING"])
  if (Array.isArray(eventTypeValue)) {
    eventTypeValue = eventTypeValue.length > 0 ? eventTypeValue[0] : null;
    console.log('[Event Mapper] EventType is an array, extracted first value:', eventTypeValue);
  }
  // Handle object format (e.g., { value: "TECHNICAL_BRIEFING" })
  else if (eventTypeValue && typeof eventTypeValue === 'object' && 'value' in eventTypeValue) {
    eventTypeValue = (eventTypeValue as any).value;
    console.log('[Event Mapper] EventType is an object, extracted value:', eventTypeValue);
  }
  
  let statusValue: string | null | undefined = props.status;
  
  // Handle array format
  if (Array.isArray(statusValue)) {
    statusValue = statusValue.length > 0 ? statusValue[0] : null;
    console.log('[Event Mapper] Status is an array, extracted first value:', statusValue);
  }
  // Handle object format
  else if (statusValue && typeof statusValue === 'object' && 'value' in statusValue) {
    statusValue = (statusValue as any).value;
    console.log('[Event Mapper] Status is an object, extracted value:', statusValue);
  }
  
  const eventTitle = props.eventTitle || eventContent.name || 'Event';
  const eventType = mapEventType(eventTypeValue);
  const dateAndTime = props.dateAndTime;
  const status = mapEventStatus(statusValue);
  
  console.log('[Event Mapper] After extraction:', {
    eventTitle,
    eventType,
    status,
    hasDateAndTime: !!dateAndTime
  });
  
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
    console.log('[Event Mapper] Speaker is an array, using first item');
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
    console.warn('[Event Mapper] ⚠️ Event has no valid title, skipping');
    console.warn('[Event Mapper] Event name:', eventContent.name);
    console.warn('[Event Mapper] Event title from props:', props.eventTitle);
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
  
  console.log('[Event Mapper] ✅ mapEventFromContent completed:', {
    id: mappedEvent.id,
    title: mappedEvent.title,
    type: mappedEvent.type,
    status: mappedEvent.status,
    speaker: mappedEvent.speaker,
    date: mappedEvent.date,
    time: mappedEvent.time,
    hasDescription: !!mappedEvent.description && mappedEvent.description !== 'No description available.'
  });
  
  return mappedEvent;
}

/**
 * Fetch all events from CMS
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    console.log('[Event Mapper] ========================================');
    console.log('[Event Mapper] Starting getAllEvents()');
    
    // Get all paths under "events"
    console.log('[Event Mapper] Calling getPaths("events")...');
    const paths = await getPaths('events');
    
    console.log(`[Event Mapper] getPaths returned:`, paths);
    console.log(`[Event Mapper] Found ${paths?.length || 0} paths under 'events'`);
    
    if (paths && paths.length > 0) {
      paths.forEach((p, index) => {
        console.log(`[Event Mapper] Path ${index + 1}:`, {
          path: p.path,
          name: p.name,
          id: p.id,
          hasRoute: !!p.route
        });
      });
    }
    
    if (!paths || paths.length === 0) {
      console.warn('[Event Mapper] ⚠️ No paths found under "events"');
      console.warn('[Event Mapper] Make sure events are published and under the "events" content node');
      return [];
    }
    
    console.log(`[Event Mapper] Processing ${paths.length} paths...`);
    
    // Fetch all event content in parallel
    const eventPromises = paths.map(async (pathItem, index) => {
      try {
        const path = pathItem.path;
        console.log(`[Event Mapper] [${index + 1}/${paths.length}] Processing path: ${path}`);
        
        if (!path || path === '#') {
          console.warn(`[Event Mapper] [${index + 1}/${paths.length}] ⚠️ Invalid path, skipping`);
          return null;
        }
        
        // Clean path: remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        console.log(`[Event Mapper] [${index + 1}/${paths.length}] Cleaned path: "${cleanPath}"`);
        
        console.log(`[Event Mapper] [${index + 1}/${paths.length}] Fetching content from CMS...`);
        const eventContent = await getContentItem(cleanPath);
        
        console.log(`[Event Mapper] [${index + 1}/${paths.length}] Content fetched:`, {
          contentType: eventContent?.contentType,
          name: eventContent?.name,
          id: eventContent?.id,
          hasProperties: !!eventContent?.properties
        });
        
        if (eventContent) {
          if (eventContent.contentType === 'event') {
            console.log(`[Event Mapper] [${index + 1}/${paths.length}] ✅ Valid event content found`);
            // Pass the original path to help with ID extraction
            const mappedEvent = await mapEventFromContent(eventContent as EventContentModel, path);
            
            if (mappedEvent) {
              console.log(`[Event Mapper] [${index + 1}/${paths.length}] ✅ Successfully mapped event:`, {
                id: mappedEvent.id,
                title: mappedEvent.title,
                type: mappedEvent.type,
                status: mappedEvent.status,
                speaker: mappedEvent.speaker,
                date: mappedEvent.date,
                time: mappedEvent.time
              });
            } else {
              console.warn(`[Event Mapper] [${index + 1}/${paths.length}] ⚠️ mapEventFromContent returned null`);
              console.warn(`[Event Mapper] [${index + 1}/${paths.length}] Event content was:`, {
                name: eventContent.name,
                contentType: eventContent.contentType,
                hasProperties: !!eventContent.properties
              });
            }
            return mappedEvent;
          } else {
            console.warn(`[Event Mapper] [${index + 1}/${paths.length}] ⚠️ Content is not an event`);
            console.warn(`[Event Mapper] [${index + 1}/${paths.length}] Expected contentType: "event", got: "${eventContent.contentType}"`);
            console.warn(`[Event Mapper] [${index + 1}/${paths.length}] Content name: "${eventContent.name}"`);
          }
        } else {
          console.warn(`[Event Mapper] [${index + 1}/${paths.length}] ⚠️ getContentItem returned null/undefined for path: ${cleanPath}`);
        }
        return null;
      } catch (error) {
        console.error(`[Event Mapper] [${index + 1}/${paths.length}] ❌ Error fetching event at path ${pathItem.path}:`, error);
        return null;
      }
    });
    
    console.log('[Event Mapper] Waiting for all event fetches to complete...');
    const events = await Promise.all(eventPromises);
    
    console.log(`[Event Mapper] All fetches complete. Got ${events.length} results`);
    
    // Filter out null results
    const validEvents = events.filter((event): event is Event => event !== null);
    
    console.log(`[Event Mapper] ✅ Final result: ${validEvents.length} valid events`);
    validEvents.forEach((event, index) => {
      console.log(`[Event Mapper] Event ${index + 1}: ${event.id} - ${event.title}`);
    });
    
    console.log('[Event Mapper] ========================================');
    
    return validEvents;
  } catch (error) {
    console.error('[Event Mapper] ❌ Fatal error in getAllEvents():', error);
    console.error('[Event Mapper] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
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
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Failed to fetch event with ID ${id}:`, error);
    }
    return null;
  }
}
