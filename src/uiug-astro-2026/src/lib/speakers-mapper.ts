/**
 * Speakers component props mapper
 * Maps Umbraco Speakers Element block properties to Speakers component props
 */
import type { components } from '../api/types.js';
import { getContentItem, getMediaUrl } from '../api/umbraco.js';

type SpeakersElementElementModel = components['schemas']['SpeakersElementElementModel'];
type SpeakerContentModel = components['schemas']['SpeakerContentModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];

export interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  bio?: string;
}

export interface SpeakersProps {
  title?: string;
  speakers?: Speaker[];
  moreButtonUrl?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtonUrl?: string;
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

async function fetchSpeakerContent(speaker: components['schemas']['IApiContentModel'] | null | undefined): Promise<Speaker | null> {
  if (!speaker) {
    return null;
  }
  
  try {
    // If properties are already expanded and have data, use them
    if ('properties' in speaker) {
      const speakerProps = (speaker as SpeakerContentModel).properties;
      // Check if properties have the expected fields (not just empty object)
      if (speakerProps && Object.keys(speakerProps).length > 0 && (speakerProps.speakerName || speaker.name)) {
        return mapSpeakerFromProps(speakerProps, speaker.id, speaker.name);
      }
    }
    
    // If not expanded, fetch by route path
    const routePath = speaker.route?.path;
    if (routePath) {
      // Remove leading slash and trailing slash if present
      let cleanPath = routePath.startsWith('/') ? routePath.substring(1) : routePath;
      cleanPath = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
      if (cleanPath && cleanPath !== '#' && cleanPath !== '') {
        try {
          const speakerContent = await getContentItem(cleanPath);
          if (speakerContent) {
            // Check if it has properties and try to access them
            // contentType could be 'speaker' (lowercase) or 'SpeakerContentModel'
            if ('properties' in speakerContent) {
              const speakerProps = (speakerContent as SpeakerContentModel).properties;
              if (speakerProps && (speakerProps.speakerName || speakerContent.name)) {
                return mapSpeakerFromProps(speakerProps, speakerContent.id, speakerContent.name);
              }
            }
          }
        } catch (fetchError) {
          // Silently handle fetch errors
        }
      }
    }
  } catch (error) {
    // Silently handle errors
  }
  
  return null;
}

function mapSpeakerFromProps(
  speakerProps: components['schemas']['SpeakerPropertiesModel'],
  speakerId: string,
  fallbackName?: string | null
): Speaker {
  // Get image URL
  let imageUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop';
  if (speakerProps.avatarImage && Array.isArray(speakerProps.avatarImage) && speakerProps.avatarImage.length > 0) {
    imageUrl = getMediaUrl(speakerProps.avatarImage[0]);
  }
  
  return {
    id: speakerId.substring(0, 8),
    name: (speakerProps.speakerName || fallbackName || 'SPEAKER').toUpperCase(),
    role: (speakerProps.role || 'SPEAKER').toUpperCase(),
    company: (speakerProps.company || 'COMPANY').toUpperCase(),
    image: imageUrl,
    bio: speakerProps.bio || undefined
  };
}

/**
 * Map Umbraco Speakers Element to Speakers component props
 */
export async function mapSpeakersProps(
  speakersElement: SpeakersElementElementModel | null | undefined
): Promise<SpeakersProps> {
  if (!speakersElement?.properties) {
    return {};
  }

  const props = speakersElement.properties;
  const speakers: Speaker[] = [];

  // Handle speakers - could be single item, array, or content picker
  let speakerItems: components['schemas']['IApiContentModel'][] = [];
  
  if (props.speakers) {
    if (Array.isArray(props.speakers)) {
      speakerItems = props.speakers;
    } else {
      // Single item
      speakerItems = [props.speakers];
    }
  }

  // Fetch all speaker content in parallel
  if (speakerItems.length > 0) {
    const speakerPromises = speakerItems.map(speaker => fetchSpeakerContent(speaker));
    const speakerResults = await Promise.all(speakerPromises);
    
    speakerResults.forEach((speaker) => {
      if (speaker) {
        speakers.push(speaker);
      }
    });
  }

  // Get moreButton URL
  let moreButtonUrl: string | undefined;
  if (props.moreButton && Array.isArray(props.moreButton) && props.moreButton.length > 0) {
    moreButtonUrl = linkHref(props.moreButton[0]);
  }

  // Get CTA button URL
  let ctaButtonUrl: string | undefined;
  if (props.button && Array.isArray(props.button) && props.button.length > 0) {
    ctaButtonUrl = linkHref(props.button[0]);
  }

  return {
    title: props.title || undefined,
    speakers: speakers.length > 0 ? speakers : undefined,
    moreButtonUrl,
    ctaHeading: props.heading || undefined,
    ctaDescription: props.description || undefined,
    ctaButtonUrl,
  };
}
