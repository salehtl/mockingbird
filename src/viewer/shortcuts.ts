import { useEffect } from 'react';

type Handlers = {
  rotate: () => void;
  cycleDevice: (dir: 1 | -1) => void;
  setZoom: (zoom: number | 'fit') => void;
  toggleTouch: () => void;
  currentZoom: number | 'fit';
};

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

function zoomStep(current: number | 'fit', dir: 1 | -1): number {
  const base = current === 'fit' ? 1 : current;
  // find nearest index, then step
  let idx = 0;
  for (let i = 0; i < ZOOM_STEPS.length; i++) {
    if (Math.abs(ZOOM_STEPS[i] - base) < Math.abs(ZOOM_STEPS[idx] - base)) idx = i;
  }
  const next = Math.min(Math.max(idx + dir, 0), ZOOM_STEPS.length - 1);
  return ZOOM_STEPS[next];
}

export function useViewerShortcuts(h: Handlers) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore keys when typing in inputs
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'r':
          h.rotate();
          break;
        case '[':
          h.cycleDevice(-1);
          break;
        case ']':
          h.cycleDevice(1);
          break;
        case '+':
        case '=':
          h.setZoom(zoomStep(h.currentZoom, 1));
          break;
        case '-':
        case '_':
          h.setZoom(zoomStep(h.currentZoom, -1));
          break;
        case '0':
          h.setZoom(1);
          break;
        case 'f':
          h.setZoom('fit');
          break;
        case 't':
          h.toggleTouch();
          break;
        default:
          return;
      }
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [h]);
}
