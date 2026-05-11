// Runs inside the /app iframe. Listens for postMessage from the viewer
// and toggles touch-simulation: data-touch attribute (drives CSS),
// a fingertip cursor dot, drag-to-scroll with inertia, and
// touch-action manipulation.
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

  const dragCleanup = installDragToScroll();

  cleanup = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    document.removeEventListener('mouseleave', onLeave);
    dragCleanup();
    style.remove();
    dot?.remove();
    dot = null;
    installed = false;
    cleanup = null;
  };
}

/* -------------------------------------------------------------------------- */
/*  Drag-to-scroll with inertia.                                              */
/*  Mouse drag scrolls the nearest scrollable ancestor of the target.        */
/*  If the drag exceeds DRAG_THRESHOLD px, the subsequent click is swallowed.*/
/* -------------------------------------------------------------------------- */

const DRAG_THRESHOLD = 5;
const FRICTION = 0.93;
const MIN_VELOCITY = 0.4;
// Form controls should still work as buttons even in touch mode.
const PASSTHROUGH = 'input, textarea, select, button, a, label, [contenteditable="true"], [data-no-drag]';

function installDragToScroll(): () => void {
  let active = false;
  let exceeded = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let vx = 0;
  let vy = 0;
  let target: Element | Window | null = null;
  let rafId = 0;

  function findScrollable(el: Element | null): Element | Window {
    let cur: Element | null = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      const cs = getComputedStyle(cur);
      const canY = (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight;
      const canX = (cs.overflowX === 'auto' || cs.overflowX === 'scroll') && cur.scrollWidth > cur.clientWidth;
      if (canY || canX) return cur;
      cur = cur.parentElement;
    }
    return window;
  }

  function applyScroll(dx: number, dy: number) {
    if (target instanceof Window) {
      target.scrollBy(-dx, -dy);
    } else if (target) {
      (target as Element).scrollLeft -= dx;
      (target as Element).scrollTop -= dy;
    }
  }

  function stepInertia() {
    if (Math.abs(vx) < MIN_VELOCITY && Math.abs(vy) < MIN_VELOCITY) {
      rafId = 0;
      return;
    }
    applyScroll(vx, vy);
    vx *= FRICTION;
    vy *= FRICTION;
    rafId = requestAnimationFrame(stepInertia);
  }

  function cancelInertia() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    const t = e.target as HTMLElement | null;
    if (t && t.closest(PASSTHROUGH)) return;

    cancelInertia();
    active = true;
    exceeded = false;
    startX = lastX = e.clientX;
    startY = lastY = e.clientY;
    lastT = e.timeStamp;
    vx = vy = 0;
    target = findScrollable(t);
  }

  function onPointerMove(e: PointerEvent) {
    if (!active) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(1, e.timeStamp - lastT);
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;

    if (!exceeded && (Math.abs(e.clientX - startX) > DRAG_THRESHOLD || Math.abs(e.clientY - startY) > DRAG_THRESHOLD)) {
      exceeded = true;
    }

    if (exceeded) {
      applyScroll(dx, dy);
      // px-per-frame velocity (assume 60fps frame = 16ms)
      vx = (dx / dt) * 16;
      vy = (dy / dt) * 16;
      e.preventDefault();
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!active) return;
    active = false;
    if (exceeded) {
      // swallow the synthetic click that follows
      const swallow = (ev: Event) => {
        ev.stopPropagation();
        ev.preventDefault();
        window.removeEventListener('click', swallow, true);
      };
      window.addEventListener('click', swallow, true);
      // begin inertia if there's meaningful velocity
      if (Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY) {
        rafId = requestAnimationFrame(stepInertia);
      }
    }
    target = null;
    // Suppress unused-arg warning for `e` in some lint setups
    void e;
  }

  function onPointerCancel() {
    active = false;
    target = null;
  }

  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove, { capture: true, passive: false });
  window.addEventListener('pointerup', onPointerUp, true);
  window.addEventListener('pointercancel', onPointerCancel, true);

  return () => {
    cancelInertia();
    window.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('pointermove', onPointerMove, true);
    window.removeEventListener('pointerup', onPointerUp, true);
    window.removeEventListener('pointercancel', onPointerCancel, true);
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
