/**
 * Lenis smooth scroll – init on load and re-init after Astro view transitions.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance: InstanceType<typeof Lenis> | null = null;

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
}

initLenis();
document.addEventListener('astro:page-load', initLenis);
