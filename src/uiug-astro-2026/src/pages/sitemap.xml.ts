/**
 * XML sitemap endpoint. Prerendered at build time in static mode.
 * Uses getSitemapEntries() to include only URLs not hidden by hideFromXmlSitemap.
 */
import { getSitemapEntries, sitemapEntriesToXml } from '../lib/sitemap.js';

const defaultSite = 'https://uiug.in';

export async function GET(): Promise<Response> {
  const site = defaultSite;
  const entries = await getSitemapEntries(site);
  const xml = sitemapEntriesToXml(entries);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
