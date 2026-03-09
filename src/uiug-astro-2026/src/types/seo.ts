/**
 * Page-level SEO props from Umbraco COm_SeoPropertiesModel / socialMedia*.
 * Used by Layout and pages to render meta tags, Open Graph, canonical, and robots.
 */
export interface PageSeo {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}
