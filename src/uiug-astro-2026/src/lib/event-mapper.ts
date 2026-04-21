/**
 * Event mapper - Maps Umbraco Event content to domain Event interface
 */
import type { components } from '../api/types.js';
import { getContentItem, getPaths, getMediaUrl, resolveContentReference } from '../api/umbraco.js';
import type { Event, Speaker, Attendee } from '../types/content.js';
import { mapSeoFromProps } from './seo-from-props.js';

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

    const timezoneMatch = dateString.match(/([A-Z]{3,4})/);
    const timezone = timezoneMatch ? timezoneMatch[1] : 'IST';

    return `${timeStr} ${timezone}`;
  } catch {
    return '';
  }
}

/**
 * Map event type from CMS to Event type
 */
function mapEventType(eventType: string | string[] | null | undefined): Event['type'] {
  if (!eventType) return 'TECHNICAL_BRIEFING';
  const raw = Array.isArray(eventType) ? eventType[0] : eventType;
  const upper = String(raw ?? '').toUpperCase();
  if (['TECHNICAL_BRIEFING', 'WORKSHOP', 'KEYNOTE', 'MEETUP', 'HACKATHON'].includes(upper)) {
    return upper as Event['type'];
  }
  return upper || 'TECHNICAL_BRIEFING';
}

/**
 * Map event status from CMS to Event status
 */
function mapEventStatus(status: string | string[] | null | undefined): Event['status'] {
  if (!status) return 'ARCHIVED';
  const raw = Array.isArray(status) ? status[0] : status;
  const upper = String(raw ?? '').toUpperCase();
  if (upper === 'INCOMING' || upper === 'UPCOMING_SESSION' || upper.includes('UPCOMING') || upper.includes('INCOMING')) {
    return 'INCOMING';
  }
  return 'ARCHIVED';
}

function extractIdFromRef(ref: { id?: string | null; route?: { path?: string | null } | null }): string {
  if (ref.route?.path) {
    const segments = ref.route.path.split('/').filter((s) => s && s !== '#' && s !== '');
    if (segments.length > 0) return segments[segments.length - 1]!;
  }
  if (ref.id) return ref.id.substring(0, 8);
  return '';
}

/**
 * Resolve and map a single speaker reference to domain Speaker
 */
async function mapSpeakerRef(
  ref: components['schemas']['IApiContentModel'] | components['schemas']['IApiContentModel'][] | null | undefined
): Promise<Speaker | null> {
  const resolved = await resolveContentReference(ref as { id?: string; route?: { path?: string }; properties?: unknown });
  if (!resolved) return null;
  const content = resolved as { id?: string; contentType?: string; name?: string | null; route?: { path?: string }; properties?: SpeakerContentModel['properties'] };
  if (content.contentType !== 'speaker') return null;
  const props = content.properties;
  const name = props?.speakerName ?? content.name ?? 'Speaker';
  const routePath = content.route?.path ?? '';
  const pathSegment = routePath.split('/').filter((s: string) => s && s !== '#' && s !== '');
  const profileUrl = pathSegment.length > 0 ? `/speakers/${pathSegment[pathSegment.length - 1]}` : undefined;
  const avatarUrl = props?.avatarImage && Array.isArray(props.avatarImage) && props.avatarImage[0]
    ? getMediaUrl(props.avatarImage[0])
    : undefined;
  return {
    id: content.id ?? extractIdFromRef(content),
    name,
    role: props?.role ?? null,
    company: props?.company ?? null,
    avatarUrl: avatarUrl ?? null,
    profileUrl: profileUrl ?? null,
  };
}

/**
 * Resolve and map speakers array to domain Speaker[]
 */
async function mapSpeakers(
  speaker: components['schemas']['IApiContentModel'] | components['schemas']['IApiContentModel'][] | null | undefined
): Promise<Speaker[]> {
  if (!speaker) return [];
  const refs = Array.isArray(speaker) ? speaker : [speaker];
  const results = await Promise.all(refs.map((r) => mapSpeakerRef(r)));
  return results.filter((s): s is Speaker => s !== null);
}

/**
 * Map attendee content (expanded or ref) to domain Attendee
 */
function mapAttendeeFromResolved(
  resolved: { id?: string; name?: string | null; properties?: Record<string, unknown> }
): Attendee {
  const props = resolved.properties ?? {};
  const name = (props.attendeeName as string) ?? resolved.name ?? 'Attendee';
  const photoArr = props.attendeePhoto as components['schemas']['IApiMediaWithCropsModel'][] | undefined;
  const photoUrl = photoArr?.[0] ? getMediaUrl(photoArr[0]) : null;
  return {
    id: resolved.id ?? '',
    name,
    photoUrl: photoUrl ?? null,
  };
}

/**
 * Resolve and map attendees array to domain Attendee[]
 */
async function mapAttendees(
  attendees: unknown
): Promise<Attendee[]> {
  if (!attendees) return [];
  const refs = Array.isArray(attendees) ? attendees : [attendees];
  const out: Attendee[] = [];
  for (const ref of refs) {
    const r = ref as { id?: string; route?: { path?: string }; properties?: Record<string, unknown> };
    const resolved = await resolveContentReference(r);
    if (resolved) {
      out.push(mapAttendeeFromResolved({
        id: resolved.id,
        name: resolved.name,
        properties: resolved.properties as Record<string, unknown>,
      }));
    }
  }
  return out;
}

/**
 * Map Umbraco Event content to domain Event
 */
export async function mapEventFromContent(
  eventContent: EventContentModel | null | undefined,
  path?: string
): Promise<Event | null> {
  if (!eventContent?.properties) return null;

  const props = eventContent.properties;
  const propsAny = props as Record<string, unknown>;

  const eventTitle = (props.eventTitle as string) || eventContent.name || 'Event';
  const eventType = mapEventType(props.eventType as string | string[] | null);
  const dateAndTime = props.dateAndTime as string | null | undefined;
  const status = mapEventStatus(props.status as string | string[] | null);

  const briefSummary = (propsAny.briefSummary as string) ?? (propsAny.brief_summary as string) ?? '';
  const fullSummaryRaw = propsAny.fullSummary ?? propsAny.full_summary;
  const fullSummary = typeof fullSummaryRaw === 'object' && fullSummaryRaw !== null && 'markup' in fullSummaryRaw
    ? (fullSummaryRaw as { markup: string }).markup
    : String(fullSummaryRaw ?? '');
  const description = (propsAny.description as string) ?? '';
  const eventDescription = briefSummary || description || 'No description available.';

  const speakerRef = props.speaker;
  const speakers = await mapSpeakers(speakerRef);

  const attendeesRef = propsAny.attendees;
  const attendees = await mapAttendees(attendeesRef);

  let eventId = 'event';
  if (eventContent.route?.path) {
    const segments = eventContent.route.path.split('/').filter((s) => s && s !== '#' && s !== '');
    if (segments.length > 0) eventId = segments[segments.length - 1]!;
  } else if (path) {
    const segments = path.split('/').filter((s) => s && s !== '#' && s !== '');
    if (segments.length > 0) eventId = segments[segments.length - 1]!;
  } else if (eventContent.id) {
    eventId = eventContent.id.substring(0, 8);
  }

  const location = (propsAny.location as string) ?? 'VIRTUAL_STREAM';

  if (!eventTitle || eventTitle.trim() === '' || eventTitle === 'Event') return null;

  const seo = mapSeoFromProps(props as Parameters<typeof mapSeoFromProps>[0]);

  const str = (v: unknown): string | null => {
    if (v == null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  };

  return {
    id: eventId,
    title: eventTitle.toUpperCase(),
    type: eventType,
    speakers,
    attendees,
    date: formatDate(dateAndTime),
    time: formatTime(dateAndTime),
    startDateIso: dateAndTime ?? undefined,
    location,
    status,
    briefSummary: eventDescription,
    fullSummary: fullSummary || eventDescription,
    url: str(propsAny.url),
    link: str(propsAny.link),
    youtubeLink: str(propsAny.youtubeLink),
    gitLink: str(propsAny.gitLink),
    agenda: undefined,
    seo: seo ?? undefined,
  };
}

/**
 * Fetch all events from CMS
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const paths = await getPaths('events', {
      extraQueryParams: { take: '500' },
    });
    if (!paths?.length) return [];

    const eventPromises = paths.map(async (pathItem) => {
      try {
        const path = pathItem.path;
        if (!path || path === '#') return null;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const eventContent = await getContentItem(cleanPath);
        if (eventContent?.contentType === 'event') {
          return await mapEventFromContent(eventContent as EventContentModel, path);
        }
        return null;
      } catch {
        return null;
      }
    });

    const events = await Promise.all(eventPromises);
    return events.filter((e): e is Event => e !== null);
  } catch {
    return [];
  }
}

/**
 * Fetch a single event by ID (URL segment or path)
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const pathVariations = [`events/${id}`, id, `events/${id.toLowerCase()}`];

    for (const path of pathVariations) {
      try {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const content = await getContentItem(cleanPath);
        if (content?.contentType === 'event') {
          return await mapEventFromContent(content as EventContentModel, path);
        }
      } catch {
        continue;
      }
    }

    const allEvents = await getAllEvents();
    const found = allEvents.find((e) => e.id === id || e.id.toLowerCase() === id.toLowerCase());
    return found ?? null;
  } catch {
    return null;
  }
}
