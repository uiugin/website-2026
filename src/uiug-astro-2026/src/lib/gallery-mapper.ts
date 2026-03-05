/**
 * Gallery component props mapper
 * Maps Umbraco Gallery block properties to Gallery component props
 */
import type { components } from '../api/types.js';
import { getMediaUrl } from '../api/umbraco.js';

type GalleryElementModel = components['schemas']['GalleryElementModel'];
type ApiBlockListModel = components['schemas']['ApiBlockListModel'];
type IApiMediaWithCropsModel = components['schemas']['IApiMediaWithCropsModel'];

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  caption: string;
  location: string;
  date: string;
}

export interface GalleryProps {
  title?: string;
  items?: MediaItem[];
}

/**
 * Format date string from Umbraco date format
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return `${month}_${day}`;
  } catch {
    // If parsing fails, try to extract month/day from string
    return dateString;
  }
}

/**
 * Map Umbraco Gallery Element to Gallery component props
 */
export async function mapGalleryProps(
  galleryElement: GalleryElementModel | null | undefined
): Promise<GalleryProps> {
  if (!galleryElement?.properties) {
    return {};
  }

  const props = galleryElement.properties;
  const items: MediaItem[] = [];

  // Check if there's a block list for gallery items (similar to FAQ/Sponsors)
  // The property might be named differently - let's check common names
  const possibleBlockListProps = ['gallaryItems', 'galleryItems', 'items', 'mediaItems', 'gallarySubBlocks', 'gallerySubBlocks'];
  
  for (const propName of possibleBlockListProps) {
    if (props[propName as keyof typeof props]) {
      const blockListProp = props[propName as keyof typeof props];
      
      if (blockListProp && typeof blockListProp === 'object' && 'items' in blockListProp) {
        const blockList = blockListProp as ApiBlockListModel;
        
        if (Array.isArray(blockList.items)) {
          blockList.items.forEach((blockItem, index) => {
            if (!blockItem?.content) {
              return;
            }

            const subBlockProps = blockItem.content.properties as any;
            
            // Try to find the properties - they might be named with "Gallary" typo
            const place = subBlockProps?.gallaryPlace || subBlockProps?.galleryPlace || subBlockProps?.place || '';
            const date = subBlockProps?.gallaryDate || subBlockProps?.galleryDate || subBlockProps?.date || '';
            const name = subBlockProps?.gallaryName || subBlockProps?.galleryName || subBlockProps?.name || subBlockProps?.caption || '';
            const image = subBlockProps?.gallaryImage || subBlockProps?.galleryImage || subBlockProps?.image || null;
            
            // Get image URL
            let imageUrl = '';
            if (image) {
              if (Array.isArray(image) && image.length > 0) {
                const mediaItem = image[0] as IApiMediaWithCropsModel;
                imageUrl = getMediaUrl(mediaItem);
              } else if (typeof image === 'object' && 'url' in image) {
                imageUrl = getMediaUrl(image as IApiMediaWithCropsModel);
              }
            }
            
            if (name || imageUrl) {
              const mappedItem: MediaItem = {
                id: blockItem.content.id || `gallery-${index}`,
                type: 'image', // Default to image, could check mediaType if available
                src: imageUrl || '',
                caption: name || 'UNTITLED',
                location: place || 'UNKNOWN',
                date: formatDate(date) || 'NO_DATE'
              };
              
              items.push(mappedItem);
            }
          });
        }
      }
    }
  }

  // Also check if there's a direct media array (from API types)
  if (props.media && Array.isArray(props.media)) {
    props.media.forEach((mediaItem, index) => {
      const mappedItem: MediaItem = {
        id: mediaItem.id || `media-${index}`,
        type: mediaItem.mediaType?.includes('video') ? 'video' : 'image',
        src: getMediaUrl(mediaItem),
        caption: mediaItem.name || 'UNTITLED',
        location: 'UNKNOWN',
        date: 'NO_DATE'
      };
      
      items.push(mappedItem);
    });
  }

  return {
    title: props.title || undefined,
    items: items.length > 0 ? items : undefined,
  };
}
