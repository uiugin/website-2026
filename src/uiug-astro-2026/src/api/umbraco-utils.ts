/**
 * Client-safe Umbraco URL helpers. No API token or Umbraco client dependency.
 * Safe to import from React components (browser). For API calls use api/umbraco.ts server-side only.
 */

/**
 * Append Umbraco ImageProcessor crop params to a media URL for responsive delivery.
 * Only modifies URLs that contain '/media/'; returns others unchanged (e.g. external fallbacks).
 * Use at render time with displayed width/height to reduce download size and improve LCP.
 */
export function appendImageCrop(
  url: string | null | undefined,
  width: number,
  height: number
): string {
  if (!url) return '';
  if (!url.includes('/media/')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}anchor=center&mode=crop&width=${Math.round(width)}&height=${Math.round(height)}`;
}
