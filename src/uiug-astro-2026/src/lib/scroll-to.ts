/**
 * Smooth-scroll helpers for in-page nav (works with Lenis when present).
 */

type LenisLike = {
  scrollTo: (
    target: HTMLElement | string | number,
    options?: { offset?: number; duration?: number }
  ) => void;
};

/** Extra gap below the fixed nav when scrolling to in-page anchors. */
function getAnchorOffset(): number {
  const header = document.querySelector('.fixed.top-0') as HTMLElement | null;
  const height = header?.getBoundingClientRect().height ?? 80;
  return -(height + 16);
}

/**
 * Smooth-scroll to an element by id (uses Lenis when available).
 */
export function scrollToId(id: string): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (!el) return false;

  const offset = getAnchorOffset();
  const lenis = (window as Window & { __uiugLenis?: LenisLike | null }).__uiugLenis;

  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.2 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  try {
    history.pushState(null, '', `#${id}`);
  } catch {
    // ignore
  }

  return true;
}
