/**
 * Typed Umbraco Delivery API client.
 * Use from Astro pages/layouts (server-side). Env vars are server-only unless prefixed with PUBLIC_.
 */
import type { components, paths } from './types.js';
import type { LayoutData, LayoutLink } from '../types/layout.js';
import { UmbracoClient } from '@grace-studio/umbraco-client';

const apiUrl = 'https://localhost:44392';
const apiToken = '5df43bf5-46ca-4976-8087-f3972df5849b';

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

export type { components, paths };
