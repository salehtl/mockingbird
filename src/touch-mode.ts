// Runs inside the /app iframe. Listens for postMessage from the viewer
// and toggles touch-simulation: data-touch attribute (drives CSS),
// a fingertip cursor dot, and touch-action manipulation.
//
// Hover styles are neutralized via a Tailwind `hover:` variant
// scoped to html:not([data-touch]) — see src/styles/globals.css.

let installed = false;
let dot: HTMLDivElement | null = null;
let cleanup: (() => void) | null = null;

function installVisuals() {
  if (installed) return;
  installed = true;

  const style = document.createElement('style');
  style.dataset.mockingbird = 'touch';
  style.textContent = `
    html[data-touch], html[data-touch] * { cursor: none !important; }
    html[data-touch] { touch-action: manipulation; }
    html[data-touch] body { user-select: none; -webkit-user-select: none; }
    .__mockingbird_touch_dot {
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
      width: 30px; height: 30px;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.18);
      border: 2px solid rgba(15, 23, 42, 0.45);
      transform: translate(-50%, -50%);
      transition: opacity 140ms ease, background-color 80ms, transform 80ms;
      opacity: 0;
      mix-blend-mode: multiply;
    }
    .__mockingbird_touch_dot[data-active="true"] {
      background: rgba(59, 130, 246, 0.45);
      border-color: rgba(59, 130, 246, 0.85);
      transform: translate(-50%, -50%) scale(0.78);
    }
  `;
  document.head.appendChild(style);

  dot = document.createElement('div');
  dot.className = '__mockingbird_touch_dot';
  document.body.appendChild(dot);

  const onMove = (e: PointerEvent) => {
    if (!dot) return;
    dot.style.opacity = '1';
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  };
  const onDown = () => dot && (dot.dataset.active = 'true');
  const onUp = () => dot && (dot.dataset.active = 'false');
  const onLeave = () => dot && (dot.style.opacity = '0');

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  document.addEventListener('mouseleave', onLeave);

  cleanup = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    document.removeEventListener('mouseleave', onLeave);
    style.remove();
    dot?.remove();
    dot = null;
    installed = false;
    cleanup = null;
  };
}

function setTouchMode(enabled: boolean) {
  if (enabled) {
    document.documentElement.setAttribute('data-touch', 'true');
    installVisuals();
  } else {
    document.documentElement.removeAttribute('data-touch');
    cleanup?.();
  }
}

window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) return;
  const data = e.data;
  if (data && typeof data === 'object' && data.type === 'mockingbird:touch') {
    setTouchMode(Boolean(data.enabled));
  }
});
