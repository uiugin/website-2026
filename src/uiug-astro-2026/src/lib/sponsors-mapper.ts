/**
 * Sponsors component props mapper
 * Maps Umbraco Sponsors block properties to Sponsors component props
 */
import type { components } from '../api/types.js';

type SponsorsElementModel = components['schemas']['SponsorsElementModel'];
type PlatinumElementModel = components['schemas']['PlatinumElementModel'];
type GoldElementModel = components['schemas']['GoldElementModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];

export interface Sponsor {
  tier: 'platinum' | 'gold' | 'silver';
  companyName: string;
  description: string;
}

export interface SponsorsProps {
  title?: string;
  platinum?: Sponsor[];
  gold?: Sponsor[];
  silver?: Sponsor[];
  ctaTitle?: string;
  ctaText?: string;
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

/**
 * Map Umbraco Sponsors Element to Sponsors component props
 */
export async function mapSponsorsProps(
  sponsorsElement: SponsorsElementModel | null | undefined
): Promise<SponsorsProps> {
  if (!sponsorsElement?.properties) {
    return {};
  }

  const props = sponsorsElement.properties;
  const platinum: Sponsor[] = [];
  const gold: Sponsor[] = [];
  const silver: Sponsor[] = [];

  // Handle sponsors block list - ApiBlockListModel contains items array
  if (props.sponsorsBlock && 'items' in props.sponsorsBlock && Array.isArray(props.sponsorsBlock.items)) {
    props.sponsorsBlock.items.forEach((blockItem) => {
      if (!blockItem?.content) {
        return;
      }

      const contentType = blockItem.content.contentType;
      
      // Handle Platinum
      if (contentType === 'platinum') {
        const platinumBlock = blockItem.content as PlatinumElementModel;
        const platinumProps = platinumBlock.properties;
        
        if (platinumProps) {
          const mappedPlatinum = {
            tier: 'platinum' as const,
            companyName: platinumProps.companyName || '',
            description: platinumProps.description || ''
          };
          
          platinum.push(mappedPlatinum);
        }
      }
      // Handle Gold
      else if (contentType === 'gold') {
        const goldBlock = blockItem.content as GoldElementModel;
        const goldProps = goldBlock.properties;
        
        if (goldProps) {
          const mappedGold = {
            tier: 'gold' as const,
            companyName: goldProps.companyName || '',
            description: goldProps.description || ''
          };
          
          gold.push(mappedGold);
        }
      }
      // Handle Silver (check if it exists)
      else if ((contentType as string) === 'silver') {
        const silverBlock = blockItem.content as any; // Silver might not be in types yet
        const silverProps = silverBlock?.properties;
        
        if (silverProps) {
          const mappedSilver = {
            tier: 'silver' as const,
            companyName: silverProps.companyName || '',
            description: silverProps.description || ''
          };
          
          silver.push(mappedSilver);
        }
      }
    });
  }

  // Get CTA button URL
  let ctaButtonUrl: string | undefined;
  if (props.buttonCta && Array.isArray(props.buttonCta) && props.buttonCta.length > 0) {
    ctaButtonUrl = linkHref(props.buttonCta[0]);
  }

  return {
    title: props.title || undefined,
    platinum: platinum.length > 0 ? platinum : undefined,
    gold: gold.length > 0 ? gold : undefined,
    silver: silver.length > 0 ? silver : undefined,
    ctaTitle: props.titleCta || undefined,
    ctaText: props.textCta || undefined,
    ctaButtonUrl,
  };
}
