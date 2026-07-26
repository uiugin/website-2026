/**
 * Fetch next event from Umbraco India Meetup RSS feed.
 * https://www.meetup.com/umbraco-india/events/rss/
 */

const MEETUP_RSS_URL = 'https://www.meetup.com/umbraco-india/events/rss/';

export interface MeetupEvent {
  title: string;
  url: string;
  /** Short date for the hero card (e.g. AUG 28–29) */
  date: string;
  /** Secondary line — location or time */
  time: string;
}

const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December';

function decodeBasicEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/â€“|â€”/g, '–')
    .replace(/â€¢/g, '•');
}

function stripMarkup(text: string): string {
  return decodeBasicEntities(text)
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstTag(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = xml.match(cdata);
  if (cdataMatch?.[1]) return decodeBasicEntities(cdataMatch[1].trim());

  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const plainMatch = xml.match(plain);
  return plainMatch?.[1] ? decodeBasicEntities(plainMatch[1].trim()) : '';
}

function firstItem(xml: string): string | null {
  const match = xml.match(/<item>([\s\S]*?)<\/item>/i);
  return match?.[1] ?? null;
}

function formatDateLabel(raw: string): string {
  // "August 28–29, 2026" → "AUG 28–29"
  const range = raw.match(
    new RegExp(`(${MONTHS})\\s+(\\d{1,2})\\s*[–—-]\\s*(\\d{1,2})(?:,?\\s*(\\d{4}))?`, 'i')
  );
  if (range) {
    const mon = range[1].slice(0, 3).toUpperCase();
    return `${mon} ${range[2]}–${range[3]}`;
  }

  const single = raw.match(new RegExp(`(${MONTHS})\\s+(\\d{1,2})(?:,?\\s*(\\d{4}))?`, 'i'));
  if (single) {
    const mon = single[1].slice(0, 3).toUpperCase();
    return `${mon} ${single[2]}`;
  }

  return raw.trim().toUpperCase();
}

function parseDescription(description: string): { date: string; time: string } {
  const plain = stripMarkup(description);

  let date = '';
  const dateMatch =
    plain.match(
      new RegExp(`(?:📅|🗓)?\\s*((?:${MONTHS})\\s+\\d{1,2}\\s*[–—-]\\s*\\d{1,2},?\\s*\\d{4})`, 'i')
    ) ||
    plain.match(new RegExp(`(?:📅|🗓)?\\s*((?:${MONTHS})\\s+\\d{1,2},?\\s*\\d{4})`, 'i')) ||
    plain.match(new RegExp(`((?:${MONTHS})\\s+\\d{1,2}\\s*[–—-]\\s*\\d{1,2},?\\s*\\d{4})`, 'i'));

  if (dateMatch?.[1]) {
    date = formatDateLabel(dateMatch[1]);
  }

  let time = '';
  const locMatch =
    plain.match(/(?:📍|Location:?)\s*([^|•\n]+?)(?:\s{2,}|📅|$)/i) ||
    plain.match(/\b(Kochi[^,]*(?:,\s*Kerala)?(?:,\s*India)?)\b/i);
  if (locMatch?.[1]) {
    time = locMatch[1]
      .trim()
      .replace(/,?\s*India\.?$/i, '')
      .trim()
      .toUpperCase();
  }

  if (!time) {
    const timeMatch = plain.match(/\b(\d{1,2}:\d{2}\s*(?:AM|PM))\b/i);
    if (timeMatch?.[1]) {
      time = timeMatch[1].toUpperCase();
    }
  }

  return { date, time };
}

function formatPubDate(pubDate: string): { date: string; time: string } {
  try {
    const d = new Date(pubDate);
    if (Number.isNaN(d.getTime())) return { date: '', time: '' };
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return {
      date: `${month} ${day}`,
      time: `${hours}:${minutes} IST`,
    };
  } catch {
    return { date: '', time: '' };
  }
}

/**
 * Fetch the first (next) Meetup event from the RSS feed.
 * Returns null when the feed is empty or unavailable.
 */
export async function fetchNextMeetupEvent(): Promise<MeetupEvent | null> {
  try {
    const res = await fetch(MEETUP_RSS_URL, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'uiug-website',
      },
      // Fresh enough for SSG / SSR without hammering Meetup
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const item = firstItem(xml);
    if (!item) return null;

    const title = stripMarkup(firstTag(item, 'title'));
    const url = firstTag(item, 'link') || firstTag(item, 'guid');
    if (!title || !url) return null;

    const description = firstTag(item, 'description');
    const parsed = parseDescription(description);
    const fromPub = formatPubDate(firstTag(item, 'pubDate'));

    return {
      title,
      url,
      date: parsed.date || fromPub.date || '',
      time: parsed.time || fromPub.time || '',
    };
  } catch {
    return null;
  }
}
