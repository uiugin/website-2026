/**
 * Lenis smooth scroll – init on load and re-init after Astro view transitions.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export type UiugLenis = InstanceType<typeof Lenis>;

declare global {
  interface Window {
    __uiugLenis?: UiugLenis | null;
  }
}

let lenisInstance: UiugLenis | null = null;

function initLenis(): void {
  if (typeof document === 'undefined') return;
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  lenisInstance = new Lenis({
    autoRaf: true,
    allowNestedScroll: true,
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  });
  window.__uiugLenis = lenisInstance;
}

initLenis();
document.addEventListener('astro:page-load', initLenis);
