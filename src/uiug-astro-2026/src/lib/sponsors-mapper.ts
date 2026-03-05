/**
 * Sponsors component props mapper
 * Maps Umbraco Sponsors block properties to Sponsors component props
 */
import type { components } from '../api/types.js';

type SponsorsElementModel = components['schemas']['SponsorsElementModel'];
type PlatinumElementModel = components['schemas']['PlatinumElementModel'];
type GoldElementModel = components['schemas']['GoldElementModel'];
type ApiBlockListModel = components['schemas']['ApiBlockListModel'];
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
  console.log('=== SPONSORS MAPPER START ===');
  console.log('Sponsors element:', sponsorsElement);
  
  if (!sponsorsElement?.properties) {
    console.log('❌ Sponsors element has no properties');
    return {};
  }

  const props = sponsorsElement.properties;
  const platinum: Sponsor[] = [];
  const gold: Sponsor[] = [];
  const silver: Sponsor[] = [];

  console.log('✅ Sponsors Element properties:', {
    title: props.title,
    sponsorsBlock: props.sponsorsBlock,
    titleCta: props.titleCta,
    textCta: props.textCta,
    buttonCta: props.buttonCta
  });
  console.log('SponsorsBlock type:', typeof props.sponsorsBlock);
  console.log('SponsorsBlock has items?:', props.sponsorsBlock && 'items' in props.sponsorsBlock);

  // Handle sponsors block list - ApiBlockListModel contains items array
  console.log('🔍 Checking sponsorsBlock...');
  if (props.sponsorsBlock && 'items' in props.sponsorsBlock && Array.isArray(props.sponsorsBlock.items)) {
    console.log(`✅ Sponsors blocks items found: ${props.sponsorsBlock.items.length}`);
    console.log('📦 Sponsors blocks items:', JSON.stringify(props.sponsorsBlock.items, null, 2));
    
    props.sponsorsBlock.items.forEach((blockItem, index) => {
      console.log(`\n=== Processing sponsor block ${index + 1}/${props.sponsorsBlock.items.length} ===`);
      console.log('Block item:', {
        hasContent: !!blockItem?.content,
        contentType: blockItem?.content?.contentType,
        contentId: blockItem?.content?.id,
        contentName: blockItem?.content?.name,
        fullBlockItem: JSON.stringify(blockItem, null, 2)
      });
      
      if (!blockItem?.content) {
        console.warn(`❌ Block ${index + 1} has no content`);
        return;
      }

      const contentType = blockItem.content.contentType;
      console.log(`📋 Block ${index + 1} contentType:`, contentType);
      
      // Handle Platinum
      if (contentType === 'platinum') {
        const platinumBlock = blockItem.content as PlatinumElementModel;
        const platinumProps = platinumBlock.properties;
        
        console.log(`💎 Platinum block ${index + 1} properties:`, platinumProps);
        console.log(`💎 Platinum block ${index + 1} properties keys:`, platinumProps ? Object.keys(platinumProps) : 'null');
        
        if (platinumProps) {
          const mappedPlatinum = {
            tier: 'platinum' as const,
            companyName: platinumProps.companyName || '',
            description: platinumProps.description || ''
          };
          
          console.log(`✅ Mapped Platinum sponsor ${index + 1}:`, mappedPlatinum);
          platinum.push(mappedPlatinum);
        } else {
          console.warn(`❌ Platinum block ${index + 1} has no properties`);
        }
      }
      // Handle Gold
      else if (contentType === 'gold') {
        const goldBlock = blockItem.content as GoldElementModel;
        const goldProps = goldBlock.properties;
        
        console.log(`🥇 Gold block ${index + 1} properties:`, goldProps);
        console.log(`🥇 Gold block ${index + 1} properties keys:`, goldProps ? Object.keys(goldProps) : 'null');
        
        if (goldProps) {
          const mappedGold = {
            tier: 'gold' as const,
            companyName: goldProps.companyName || '',
            description: goldProps.description || ''
          };
          
          console.log(`✅ Mapped Gold sponsor ${index + 1}:`, mappedGold);
          gold.push(mappedGold);
        } else {
          console.warn(`❌ Gold block ${index + 1} has no properties`);
        }
      }
      // Handle Silver (check if it exists)
      else if (contentType === 'silver') {
        const silverBlock = blockItem.content as any; // Silver might not be in types yet
        const silverProps = silverBlock?.properties;
        
        console.log(`🥈 Silver block ${index + 1} properties:`, silverProps);
        console.log(`🥈 Silver block ${index + 1} properties keys:`, silverProps ? Object.keys(silverProps) : 'null');
        
        if (silverProps) {
          const mappedSilver = {
            tier: 'silver' as const,
            companyName: silverProps.companyName || '',
            description: silverProps.description || ''
          };
          
          console.log(`✅ Mapped Silver sponsor ${index + 1}:`, mappedSilver);
          silver.push(mappedSilver);
        } else {
          console.warn(`❌ Silver block ${index + 1} has no properties`);
        }
      }
      else {
        console.warn(`⚠️ Block ${index + 1} is not a recognized sponsor tier, contentType:`, contentType);
        console.warn(`📄 Full block content:`, JSON.stringify(blockItem.content, null, 2));
      }
    });
  } else {
    console.warn('❌ Sponsors blocks is not in expected format');
    console.warn('Sponsors blocks value:', props.sponsorsBlock);
    console.warn('Sponsors blocks type:', typeof props.sponsorsBlock);
    console.warn('Sponsors blocks has items?:', props.sponsorsBlock && 'items' in props.sponsorsBlock);
  }

  // Get CTA button URL
  let ctaButtonUrl: string | undefined;
  if (props.buttonCta && Array.isArray(props.buttonCta) && props.buttonCta.length > 0) {
    ctaButtonUrl = linkHref(props.buttonCta[0]);
  }

  console.log('\n=== FINAL SPONSORS SUMMARY ===');
  console.log('Final sponsors:', {
    platinum: platinum.length,
    gold: gold.length,
    silver: silver.length,
    platinumItems: platinum,
    goldItems: gold,
    silverItems: silver
  });
  console.log('=== SPONSORS MAPPER END ===\n');

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
