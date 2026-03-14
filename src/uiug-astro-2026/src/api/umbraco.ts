/**
 * Typed Umbraco Delivery API client.
 * Use from Astro pages/layouts (server-side). Env vars are server-only unless prefixed with PUBLIC_.
 */
import type { components, paths } from './types.js';
import type { LayoutData, LayoutLink } from '../types/layout.js';
import { UmbracoClient } from '@grace-studio/umbraco-client';

// Configure Node.js to accept self-signed certificates in development
// This is needed when connecting to localhost with self-signed SSL certificates
if (import.meta.env.DEV) {
  // Only disable certificate validation in development
  try {
    const nodeProcess = (globalThis as any).process || (globalThis as any).global?.process;
    if (nodeProcess?.env) {
      nodeProcess.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
  } catch {
    // Ignore if process is not available
  }
}

const apiUrl =
  (import.meta.env.UMBRACO_API_URL as string | undefined)?.trim() ||
  (import.meta.env.DEV ? 'https://localhost:44392' : '');
const apiToken =
  (import.meta.env.UMBRACO_API_TOKEN as string | undefined)?.trim() || '';

export const umbraco = UmbracoClient.create<paths>({
  apiToken,
  apiUrl,
});

export type { LayoutData, LayoutLink };

type ApiLink = components['schemas']['ApiLinkModel'];
type SiteSettingsProps = components['schemas']['SiteSettingsPropertiesModel'];

function linkHref(link: ApiLink): string {
  return link.url ?? link.route?.path ?? '#';
}

function toLayoutLink(link: ApiLink): LayoutLink {
  return {
    title: link.title ?? '',
    url: linkHref(link),
    target: link.target ?? null,
  };
}

function stripHtml(html: string | null | undefined): string {
  if (html == null || html === '') return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Resolve site settings from CMS and return layout-ready data. */
export async function getSiteSettings(): Promise<LayoutData> {
  const defaults: LayoutData = {
    siteName: 'UIUG',
    logo: 'UIUG',
    navItems: [],
    ctaItem: null,
    footer: {
      footerLogo: 'UIUG',
      description: null,
      footerMenu: [],
      copyright: null,
      marquee: null,
    },
    social: {},
  };

  try {
    const item = await getContentItem('site-settings');
    const props = (item?.properties ?? {}) as Partial<SiteSettingsProps>;

    const navMenu = props.navMenu ?? [];
    const navLinks = navMenu.map(toLayoutLink);
    const last = navLinks[navLinks.length - 1];
    const isExternalCta =
      last && (navMenu[navMenu.length - 1]?.linkType === 'External' || last.url.startsWith('http'));
    const navItems = isExternalCta ? navLinks.slice(0, -1) : navLinks;
    const ctaItem = isExternalCta ? last : null;

    const footerMenu = (props.footerMenu ?? []).map(toLayoutLink);

    const socialKeys = ['discord', 'meetup', 'gitHub', 'youtube', 'linkedin'] as const;
    const social: LayoutData['social'] = {};
    for (const key of socialKeys) {
      const arr = props[key];
      const url = Array.isArray(arr) && arr[0] ? linkHref(arr[0]) : undefined;
      if (url !== undefined) social[key === 'gitHub' ? 'github' : key] = url;
    }

    return {
      siteName: props.fldWebsiteName ?? defaults.siteName,
      logo: props.logo ?? defaults.logo,
      navItems,
      ctaItem,
      footer: {
        footerLogo: props.footerLogo ?? defaults.footer.footerLogo,
        description: props.description ?? defaults.footer.description,
        footerMenu,
        copyright: props.copyright ?? defaults.footer.copyright,
        marquee: props.footerMarquee ? stripHtml(props.footerMarquee) : defaults.footer.marquee,
      },
      social,
    };
  } catch {
    return defaults;
  }
}

/** Fetch all content (formatted). */
export const getContent = () =>
  umbraco
    .get('/umbraco/delivery/api/v2/content')
    .then(UmbracoClient.format.content);

/** Fetch a single content item by path (formatted). */
export const getContentItem = (path: string) =>
  umbraco
    .get('/umbraco/delivery/api/v2/content/item/{path}', {
      params: { path: { path } },
    })
    .then(UmbracoClient.format.contentItem);

/** Fetch a single content item by id (GUID). */
export const getContentItemById = (id: string) =>
  umbraco
    .get('/umbraco/delivery/api/v2/content/item/{id}', {
      params: { path: { id } },
    })
    .then(UmbracoClient.format.contentItem);

type ApiContentRef = {
  id?: string | null;
  route?: { path?: string | null } | null;
  properties?: unknown;
};

/** Resolve a content reference (node picker). If expanded, return as-is; else fetch by route.path or by id. */
export async function resolveContentReference(
  ref: ApiContentRef | ApiContentRef[] | null | undefined
): Promise<components['schemas']['IApiContentResponseModel'] | null> {
  const single = Array.isArray(ref) ? ref[0] ?? null : ref;
  if (!single) return null;
  if (single.properties != null && typeof single.properties === 'object' && Object.keys(single.properties as object).length > 0) {
    return single as unknown as components['schemas']['IApiContentResponseModel'];
  }
  if (single.route?.path) {
    const path = single.route.path.replace(/^\/|\/$/g, '') || '';
    if (path && path !== '#') {
      try {
        const item = await getContentItem(path);
        return item as components['schemas']['IApiContentResponseModel'];
      } catch {
        // fall through to try by id
      }
    }
  }
  if (single.id) {
    try {
      const item = await getContentItemById(single.id);
      return item as components['schemas']['IApiContentResponseModel'];
    } catch {
      return null;
    }
  }
  return null;
}

/** Fetch content paths (e.g. for static paths). */
export const getPaths = (
  basePath: string,
  options?: {
    excludeHidden?: boolean;
    mappingFunctions?: { hidden: (props: { umbracoNaviHide?: boolean }) => boolean };
    extraQueryParams?: Record<string, string>;
  }
) =>
  umbraco.getPaths({
    basePath,
    excludeHidden: options?.excludeHidden ?? true,
    mappingFunctions: options?.mappingFunctions ?? {
      hidden: ({ umbracoNaviHide }) => Boolean(umbracoNaviHide),
    },
    extraQueryParams: options?.extraQueryParams,
  });

/** Fetch content menu. */
export const getMenu = (
  basePath: string,
  options?: {
    excludeHidden?: boolean;
    mappingFunctions?: { hidden: (props: { umbracoNaviHide?: boolean }) => boolean };
    properties?: Record<string, (props: Record<string, unknown>) => unknown>;
    extraQueryParams?: Record<string, string>;
    headers?: Record<string, string>;
  }
) =>
  umbraco.getMenu({
    basePath,
    excludeHidden: options?.excludeHidden ?? true,
    mappingFunctions: options?.mappingFunctions ?? {
      hidden: ({ umbracoNaviHide }) => Boolean(umbracoNaviHide),
    },
    properties: options?.properties,
    extraQueryParams: options?.extraQueryParams,
    headers: options?.headers,
  });

/** Transform media URL from Umbraco API to frontend-usable URL */
export function transformMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If URL is already absolute and external, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If relative URL, prepend API URL
  return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Get media URL from Umbraco media model */
export function getMediaUrl(
  media: components['schemas']['IApiMediaWithCropsModel'] | null | undefined
): string {
  if (!media) return '';
  return transformMediaUrl(media.url);
}

/** Re-export for server-side use; client code should import from './umbraco-utils.js' to avoid loading Umbraco client. */
export { appendImageCrop } from './umbraco-utils.js';

/** Fetch Home page content */
export async function getHomeContent() {
  try {
    return await getContentItem('home');
  } catch {
    return null;
  }
}

/** Extract Hero block from Home page Block List */
export function getHeroBlock(
  homeContent: Awaited<ReturnType<typeof getContentItem>> | null
): components['schemas']['HeroElementModel'] | null {
  if (!homeContent) return null;
  
  const props = homeContent.properties as any;
  const blockList = props?.mainContent as components['schemas']['ApiBlockListModel'] | undefined;
  
  if (!blockList?.items) return null;
  
  // Find the Hero block in the block list
  for (const block of blockList.items) {
    if (block.content?.contentType === 'hero') {
      return block.content as components['schemas']['HeroElementModel'];
    }
  }
  
  return null;
}

/** Extract all blocks from Home page Block List in order */
export function getMainContentBlocks(
  homeContent: Awaited<ReturnType<typeof getContentItem>> | null
): components['schemas']['ApiBlockItemModel'][] {
  if (!homeContent) return [];
  
  const props = homeContent.properties as any;
  const blockList = props?.mainContent as components['schemas']['ApiBlockListModel'] | undefined;
  
  if (!blockList?.items) return [];
  
  // Return all blocks in order, filtering out any invalid blocks
  return blockList.items.filter(
    (block): block is components['schemas']['ApiBlockItemModel'] =>
      block !== null && block !== undefined && block.content !== null && block.content !== undefined
  );
}

export type { components, paths };
