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
// 0.96 per frame ≈ ~1.2s glide from a normal flick. Closer to 1 = more mass.
const FRICTION = 0.96;
const MIN_VELOCITY = 0.08;
// Window over which the release-velocity is averaged. iOS uses ~100ms.
const VELOCITY_WINDOW_MS = 100;
// Form controls should still work as buttons even in touch mode.
const PASSTHROUGH = 'input, textarea, select, button, a, label, [contenteditable="true"], [data-no-drag]';

type Sample = { x: number; y: number; t: number };

function installDragToScroll(): () => void {
  let active = false;
  let exceeded = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let vx = 0;
  let vy = 0;
  let samples: Sample[] = [];
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
    vx = vy = 0;
    samples = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
    target = findScrollable(t);
  }

  function onPointerMove(e: PointerEvent) {
    if (!active) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    if (!exceeded && (Math.abs(e.clientX - startX) > DRAG_THRESHOLD || Math.abs(e.clientY - startY) > DRAG_THRESHOLD)) {
      exceeded = true;
    }

    if (exceeded) {
      applyScroll(dx, dy);
      samples.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      // Drop samples older than the velocity window.
      const cutoff = e.timeStamp - VELOCITY_WINDOW_MS;
      while (samples.length > 2 && samples[0].t < cutoff) samples.shift();
      e.preventDefault();
    }
  }

  function computeReleaseVelocity(now: number): { vx: number; vy: number } {
    // Average velocity over the last VELOCITY_WINDOW_MS of movement.
    // If the pointer paused before release, the recent samples will be near-stationary
    // and we'll correctly return ~0 — matching iOS "lift to stop" behavior.
    const cutoff = now - VELOCITY_WINDOW_MS;
    const recent = samples.filter((s) => s.t >= cutoff);
    if (recent.length < 2) return { vx: 0, vy: 0 };
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = Math.max(1, last.t - first.t);
    // px-per-frame at 60fps
    return {
      vx: ((last.x - first.x) / dt) * 16,
      vy: ((last.y - first.y) / dt) * 16,
    };
  }

  function onPointerUp(e: PointerEvent) {
    if (!active) return;
    active = false;
    if (exceeded) {
      const swallow = (ev: Event) => {
        ev.stopPropagation();
        ev.preventDefault();
        window.removeEventListener('click', swallow, true);
      };
      window.addEventListener('click', swallow, true);

      const v = computeReleaseVelocity(e.timeStamp);
      vx = v.vx;
      vy = v.vy;
      if (Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY) {
        rafId = requestAnimationFrame(stepInertia);
      }
    }
    target = null;
    samples = [];
  }

  function onPointerCancel() {
    active = false;
    target = null;
    samples = [];
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
