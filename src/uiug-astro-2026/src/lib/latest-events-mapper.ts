/**
 * Latest Events component props mapper
 * Maps Umbraco Latest Events block properties to Latest Events component props
 */
import type { components } from '../api/types.js';
import { getContentItem, resolveContentReference } from '../api/umbraco.js';
import { mapEventFromContent } from './event-mapper.js';

type LatestEventsElementModel = components['schemas']['LatestEventsElementModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];
type EventContentModel = components['schemas']['EventContentModel'];

/** Attendee summary for block display (avatar + name) */
export interface LatestEventsAttendeeItem {
  name: string;
  photoUrl?: string | null;
}

/** Event item for the Latest Events block (home page) */
export interface LatestEventsEventItem {
  id: string;
  title: string;
  type: string;
  speaker: string;
  date: string;
  status: 'INCOMING' | 'ARCHIVED';
  colors: 'default' | 'yellow' | 'accent';
  url?: string;
  attendeesCount: number;
  attendees: LatestEventsAttendeeItem[];
}

export interface LatestEventsProps {
  title?: string;
  events?: LatestEventsEventItem[];
}

function linkHref(link: ApiLinkModel | null | undefined): string {
  if (!link) return '#';
  const href = link.url ?? link.route?.path ?? '#';
  if (href === '/#/' || href === '#/') return '/';
  if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('/')) {
    return `/${href}`;
  }
  return href;
}

async function fetchEventContent(
  destinationId: string | null | undefined,
  routePath: string | null | undefined
): Promise<EventContentModel | null> {
  if (!destinationId && !routePath) return null;
  try {
    if (routePath) {
      const cleanPath = routePath.startsWith('/') ? routePath.substring(1) : routePath;
      if (cleanPath && cleanPath !== '#' && cleanPath !== '') {
        const content = await getContentItem(cleanPath);
        if (content?.contentType === 'event') return content as EventContentModel;
      }
    }
    if (destinationId) {
      const resolved = await resolveContentReference({ id: destinationId });
      if (resolved?.contentType === 'event') return resolved as EventContentModel;
    }
    return null;
  } catch {
    return null;
  }
}

/** Map domain Event to block event item with attendeesCount */
function toBlockEventItem(
  event: Awaited<ReturnType<typeof mapEventFromContent>>,
  urlOverride?: string
): LatestEventsEventItem | null {
  if (!event) return null;
  const speaker = event.speakers?.[0]?.name?.toUpperCase().replace(/\s+/g, '_') ?? 'SPEAKER';
  const eventType = typeof event.type === 'string' ? event.type : (Array.isArray(event.type) ? event.type[0] : 'EVENT');
  const colors = (event as { colors?: string }).colors?.toLowerCase() as 'default' | 'yellow' | 'accent' | undefined;
  const attendees: LatestEventsAttendeeItem[] = (event.attendees ?? []).map((a) => ({
    name: a.name,
    photoUrl: a.photoUrl ?? null,
  }));

  return {
    id: event.id,
    title: event.title,
    type: String(eventType).toUpperCase(),
    speaker,
    date: event.date,
    status: event.status,
    colors: colors ?? 'default',
    url: urlOverride ?? `/events/${event.id}`,
    attendeesCount: attendees.length,
    attendees,
  };
}

/**
 * Map Umbraco Latest Events element to Latest Events component props
 */
export async function mapLatestEventsProps(
  latestEventsElement: LatestEventsElementModel | null | undefined
): Promise<LatestEventsProps> {
  if (!latestEventsElement?.properties) return {};

  const props = latestEventsElement.properties as {
    title?: string | null;
    moreButton?: ApiLinkModel[] | null;
    events?: Array<{ id?: string; route?: { path?: string }; properties?: unknown }> | null;
  };
  const events: LatestEventsEventItem[] = [];

  // Prefer props.events (content refs) when present (e.g. from block list)
  const eventsRefs = props.events;
  if (Array.isArray(eventsRefs) && eventsRefs.length > 0) {
    const results = await Promise.all(
      eventsRefs.map(async (ref) => {
        const resolved = await resolveContentReference(ref);
        if (!resolved || resolved.contentType !== 'event') return null;
        const mapped = await mapEventFromContent(resolved as EventContentModel);
        return toBlockEventItem(mapped);
      })
    );
    results.forEach((e) => {
      if (e) events.push(e);
    });
  }

  // Fallback: moreButton links
  if (events.length === 0 && props.moreButton && Array.isArray(props.moreButton)) {
    const eventContentPromises = props.moreButton.map(async (link, index) => {
      if (!link) return null;
      const eventUrl = linkHref(link);
      const eventContent = await fetchEventContent(link.destinationId ?? undefined, link.route?.path ?? undefined);
      if (eventContent) {
        const mapped = await mapEventFromContent(eventContent);
        return toBlockEventItem(mapped, eventUrl !== '#' ? eventUrl : undefined);
      }
      const eventId = (link.destinationId ?? link.route?.startItem?.id ?? `event-${index}`)?.toString().substring(0, 8) ?? `event-${index}`;
      return {
        id: eventId,
        title: (link.title ?? 'Event').toUpperCase(),
        type: 'EVENT',
        speaker: 'SPEAKER',
        date: '',
        status: 'ARCHIVED' as const,
        colors: 'default' as const,
        url: eventUrl,
        attendeesCount: 0,
        attendees: [],
      } satisfies LatestEventsEventItem;
    });
    const eventResults = await Promise.all(eventContentPromises);
    eventResults.forEach((e) => {
      if (e) events.push(e);
    });
  }

  return {
    title: props.title ?? undefined,
    events: events.length > 0 ? events : undefined,
  };
}
