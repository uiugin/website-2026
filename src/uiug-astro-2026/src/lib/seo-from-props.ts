/**
 * Map Umbraco COm_SeoPropertiesModel (and socialMedia*) to PageSeo.
 * Used by Layout and by mappers that attach seo to domain models.
 */
import type { components } from '../api/types.js';
import { getMediaUrl } from '../api/umbraco.js';
import type { PageSeo } from '../types/seo.js';

type SeoProps = {
  pageBrowserTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  socialMediaTitle?: string | null;
  socialMediaImage?: components['schemas']['IApiMediaWithCropsModel'][] | null;
  socialMediaDescription?: string | null;
  blockThisPageFromSearchEngines?: boolean | null;
  canonicalURL?: string | null;
};

export function mapSeoFromProps(props: SeoProps | null | undefined): PageSeo | null {
  if (!props) return null;

  const title = props.pageBrowserTitle ?? null;
  const description = props.metaDescription ?? null;
  const keywords = props.metaKeywords ?? null;
  const canonicalUrl = props.canonicalURL ?? null;
  const noindex = props.blockThisPageFromSearchEngines === true;
  const ogTitle = props.socialMediaTitle ?? props.pageBrowserTitle ?? null;
  const ogDescription = props.socialMediaDescription ?? props.metaDescription ?? null;
  const ogImageRaw = props.socialMediaImage && Array.isArray(props.socialMediaImage) && props.socialMediaImage[0]
    ? getMediaUrl(props.socialMediaImage[0])
    : null;
  const ogImage = ogImageRaw && ogImageRaw !== '' ? ogImageRaw : null;

  const hasAny =
    (title != null && title !== '') ||
    (description != null && description !== '') ||
    (keywords != null && keywords !== '') ||
    (canonicalUrl != null && canonicalUrl !== '') ||
    noindex ||
    (ogTitle != null && ogTitle !== '') ||
    (ogDescription != null && ogDescription !== '') ||
    (ogImage != null && ogImage !== '');

  if (!hasAny) return null;

  return {
    title: title ?? undefined,
    description: description ?? undefined,
    keywords: keywords ?? undefined,
    canonicalUrl: canonicalUrl ?? undefined,
    noindex,
    ogTitle: ogTitle ?? undefined,
    ogDescription: ogDescription ?? undefined,
    ogImage: ogImage ?? undefined,
  };
}
