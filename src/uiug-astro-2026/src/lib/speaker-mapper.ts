/**
 * Speaker mapper - Maps Umbraco Speaker content to Speaker interface
 */
import type { components } from '../api/types.js';
import { getContentItem, getPaths, getMediaUrl } from '../api/umbraco.js';
import type { Speaker } from '../data/speakers.js';

type SpeakerContentModel = components['schemas']['SpeakerContentModel'];

/**
 * Extract text from rich text object (handles {markup, blocks} format)
 */
function extractRichText(richText: any): string {
  if (!richText) return '';
  
  // If it's already a string, return it
  if (typeof richText === 'string') {
    return richText;
  }
  
  // If it's an object with markup property
  if (richText && typeof richText === 'object') {
    if ('markup' in richText && typeof richText.markup === 'string') {
      // Strip HTML tags for plain text
      return richText.markup.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if ('text' in richText && typeof richText.text === 'string') {
      return richText.text;
    }
  }
  
  return '';
}

/**
 * Map Umbraco Speaker content to Speaker interface
 * @param speakerContent The speaker content from CMS
 * @param path Optional path to use for ID extraction (if route.path is not available)
 */
export async function mapSpeakerFromContent(
  speakerContent: SpeakerContentModel | null | undefined,
  path?: string
): Promise<Speaker | null> {
  if (!speakerContent || !speakerContent.properties) {
    return null;
  }

  const props = speakerContent.properties;
  
  // Extract speaker properties
  const speakerName = props.speakerName || speakerContent.name || 'Speaker';
  const role = props.role || 'SPEAKER';
  const company = props.company || 'COMPANY';
  
  // Handle bio - might be rich text object
  const bio = extractRichText(props.bio) || '';

  // Handle image - array of media items
  let imageUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop';
  if (props.avatarImage && Array.isArray(props.avatarImage) && props.avatarImage.length > 0) {
    imageUrl = getMediaUrl(props.avatarImage[0]);
  }

  // Extract ID from speaker content (use URL segment from route path, or fallback to UUID)
  let speakerId = 'speaker';
  
  // Try to get ID from route path first
  if (speakerContent.route?.path) {
    const pathSegments = speakerContent.route.path.split('/').filter(seg => seg && seg !== '#' && seg !== '');
    if (pathSegments.length > 0) {
      speakerId = pathSegments[pathSegments.length - 1];
    }
  } else if (path) {
    // Use provided path to extract ID
    const pathSegments = path.split('/').filter(seg => seg && seg !== '#' && seg !== '');
    if (pathSegments.length > 0) {
      speakerId = pathSegments[pathSegments.length - 1];
    }
  } else if (speakerContent.id) {
    // Fallback to first 8 chars of UUID
    speakerId = speakerContent.id.substring(0, 8);
  }

  // Handle speakerType (category) - might be array, object, or string
  // Check for speakerType first (from CMS), then fallback to category
  const propsAny = props as any;
  let categoryValue: string | null | undefined = propsAny.speakerType || propsAny.category;
  
  // Handle array format
  if (Array.isArray(categoryValue)) {
    categoryValue = categoryValue.length > 0 ? categoryValue[0] : null;
  }
  // Handle object format
  else if (categoryValue && typeof categoryValue === 'object' && 'value' in categoryValue) {
    categoryValue = (categoryValue as any).value;
  }
  
  // Map speakerType to Speaker interface category
  // CMS values: "MVP", "HQ", "Agency", "Community"
  // Interface expects: "MVP" | "HQ" | "AGENCY" | "COMMUNITY"
  let category: Speaker['category'] = 'COMMUNITY'; // default
  if (categoryValue) {
    const normalizedCategory = String(categoryValue).trim();
    const upperCategory = normalizedCategory.toUpperCase();
    
    // Map CMS values to interface values
    if (upperCategory === 'MVP') {
      category = 'MVP';
    } else if (upperCategory === 'HQ' || normalizedCategory.toLowerCase() === 'hq') {
      category = 'HQ';
    } else if (upperCategory === 'AGENCY' || normalizedCategory.toLowerCase() === 'agency') {
      category = 'AGENCY';
    } else if (upperCategory === 'COMMUNITY' || normalizedCategory.toLowerCase() === 'community') {
      category = 'COMMUNITY';
    }
  } else {
    // Infer category from company if available
    const companyUpper = company.toUpperCase();
    if (companyUpper.includes('UMBRACO') && (companyUpper.includes('HQ') || companyUpper.includes('HEADQUARTERS'))) {
      category = 'HQ';
    } else if (companyUpper.includes('AGENCY')) {
      category = 'AGENCY';
    } else if (role.toUpperCase().includes('MVP')) {
      category = 'MVP';
    }
  }

  // Handle topics - might be array of strings or comma-separated string
  let topics: string[] = [];
  if (propsAny.topics) {
    if (Array.isArray(propsAny.topics)) {
      topics = propsAny.topics.map(t => {
        if (typeof t === 'string') {
          return t;
        }
        return String(t);
      }).filter(t => t && t.trim() !== '');
    } else if (typeof propsAny.topics === 'string') {
      // Split comma-separated string
      topics = propsAny.topics.split(',').map(t => t.trim()).filter(t => t !== '');
    }
  }

  // Validate that we have at least a name
  if (!speakerName || speakerName === 'Speaker' || speakerName.trim() === '') {
    return null;
  }

  const mappedSpeaker: Speaker = {
    id: speakerId,
    name: speakerName.toUpperCase(),
    role: role.toUpperCase(),
    company: company.toUpperCase(),
    image: imageUrl,
    category: category,
    topics: topics.length > 0 ? topics : [],
    bio: bio || '',
  };

  return mappedSpeaker;
}

/**
 * Fetch all speakers from CMS
 */
export async function getAllSpeakers(): Promise<Speaker[]> {
  try {
    // Get all paths under "speakers"
    const paths = await getPaths('speakers');
    
    if (!paths || paths.length === 0) {
      return [];
    }
    
    // Fetch all speaker content in parallel
    const speakerPromises = paths.map(async (pathItem) => {
      try {
        const path = pathItem.path;
        
        if (!path || path === '#') {
          return null;
        }
        
        // Clean path: remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        const speakerContent = await getContentItem(cleanPath);
        
        if (speakerContent) {
          // Check if it's a speaker content type
          const contentType = speakerContent.contentType || '';
          const isSpeaker = contentType === 'speaker' || 
                           contentType === 'SpeakerContentModel' ||
                           contentType.toLowerCase() === 'speaker' ||
                           contentType.toLowerCase().includes('speaker');
          
          if (isSpeaker) {
            // Pass the original path to help with ID extraction
            const mappedSpeaker = await mapSpeakerFromContent(speakerContent as SpeakerContentModel, path);
            return mappedSpeaker;
          }
        }
        return null;
      } catch {
        return null;
      }
    });
    
    const speakers = await Promise.all(speakerPromises);
    
    // Filter out null results
    const validSpeakers = speakers.filter((speaker): speaker is Speaker => speaker !== null);
    
    return validSpeakers;
  } catch {
    return [];
  }
}

/**
 * Fetch a single speaker by ID (URL segment or path)
 */
export async function getSpeakerById(id: string): Promise<Speaker | null> {
  try {
    let speakerContent: SpeakerContentModel | null = null;
    let usedPath: string | null = null;
    
    // Try multiple path variations
    const pathVariations = [
      `speakers/${id}`,  // Most common: speakers/1, speakers/speaker-1
      id,              // Direct path if ID is full path
      `speakers/${id.toLowerCase()}`, // Lowercase variant
    ];
    
    for (const path of pathVariations) {
      try {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const content = await getContentItem(cleanPath);
        const contentType = content?.contentType || '';
        const isSpeaker = contentType === 'speaker' || 
                         contentType === 'SpeakerContentModel' ||
                         contentType.toLowerCase() === 'speaker' ||
                         contentType.toLowerCase().includes('speaker');
        
        if (content && isSpeaker) {
          speakerContent = content as SpeakerContentModel;
          usedPath = path;
          break;
        }
      } catch {
        // Continue to next variation
        continue;
      }
    }
    
    // If direct fetch failed, try to find by matching ID in all speakers
    if (!speakerContent) {
      const allSpeakers = await getAllSpeakers();
      const foundSpeaker = allSpeakers.find((s) => {
        const speakerId = s.id.toLowerCase();
        const requestedId = id.toLowerCase();

        // Match exact IDs (e.g., "speaker-1-1")
        if (speakerId === requestedId) return true;

        // Also support numeric IDs (e.g., "/speakers/1" → "speaker-1-1")
        // by checking if the speaker ID ends with "-{id}"
        if (/^\d+$/.test(requestedId) && speakerId.endsWith(`-${requestedId}`)) {
          return true;
        }

        return false;
      });
      if (foundSpeaker) {
        return foundSpeaker;
      }
    }
    
    if (speakerContent) {
      // Pass the used path to help with ID extraction
      return await mapSpeakerFromContent(speakerContent, usedPath || undefined);
    }
    
    return null;
  } catch {
    return null;
  }
}
