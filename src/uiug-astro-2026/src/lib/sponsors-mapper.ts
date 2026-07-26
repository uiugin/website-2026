/**
 * Sponsors component props mapper
 * Maps Umbraco Sponsors block properties to Sponsors component props
 */
import type { components } from '../api/types.js';
import { getMediaUrl } from '../api/umbraco.js';

type SponsorsElementModel = components['schemas']['SponsorsElementModel'];
type PlatinumElementModel = components['schemas']['PlatinumElementModel'];
type GoldElementModel = components['schemas']['GoldElementModel'];
type ApiLinkModel = components['schemas']['ApiLinkModel'];
type IApiMediaWithCropsModel = components['schemas']['IApiMediaWithCropsModel'];

export interface Sponsor {
  tier: 'platinum' | 'gold' | 'silver';
  companyName: string;
  description: string;
  logoUrl?: string;
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

type SponsorItemProperties = {
  companyName?: string | null;
  description?: string | null;
  logo?: IApiMediaWithCropsModel[] | null;
};

function linkHref(link: ApiLinkModel | null | undefined): string {
  if (!link) return '#';

  const href = link.url ?? link.route?.path ?? '#';

  if (href === '/#/' || href === '#/') {
    return '/';
  }

  if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('/')) {
    return `/${href}`;
  }

  return href;
}

function resolveLogoUrl(logo: SponsorItemProperties['logo']): string | undefined {
  if (!Array.isArray(logo) || logo.length === 0) return undefined;
  const url = getMediaUrl(logo[0]);
  return url || undefined;
}

function mapSponsorItem(
  tier: Sponsor['tier'],
  props: SponsorItemProperties | null | undefined
): Sponsor | null {
  if (!props) return null;
  const companyName = props.companyName?.trim() || '';
  if (!companyName) return null;

  return {
    tier,
    companyName,
    description: props.description?.trim() || '',
    logoUrl: resolveLogoUrl(props.logo),
  };
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

  if (props.sponsorsBlock && 'items' in props.sponsorsBlock && Array.isArray(props.sponsorsBlock.items)) {
    props.sponsorsBlock.items.forEach((blockItem) => {
      if (!blockItem?.content) return;

      const contentType = blockItem.content.contentType;

      if (contentType === 'platinum') {
        const platinumBlock = blockItem.content as PlatinumElementModel;
        const mapped = mapSponsorItem(
          'platinum',
          platinumBlock.properties as SponsorItemProperties | null | undefined
        );
        if (mapped) platinum.push(mapped);
      } else if (contentType === 'gold') {
        const goldBlock = blockItem.content as GoldElementModel;
        const mapped = mapSponsorItem(
          'gold',
          goldBlock.properties as SponsorItemProperties | null | undefined
        );
        if (mapped) gold.push(mapped);
      } else if ((contentType as string) === 'silver') {
        const silverBlock = blockItem.content as { properties?: SponsorItemProperties | null };
        const mapped = mapSponsorItem('silver', silverBlock.properties);
        if (mapped) silver.push(mapped);
      }
    });
  }

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
