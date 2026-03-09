/**
 * robots.txt endpoint. Points crawlers to the XML sitemap.
 */
const defaultSite = 'https://uiug.in';

export async function GET(): Promise<Response> {
  const site = defaultSite;
  const base = site.replace(/\/$/, '');
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
