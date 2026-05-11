import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ViewerState } from './useViewerState';

type Props = {
  state: ViewerState;
};

const FRAME_PADDING = 32;

export function DeviceFrame({ state }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const { renderW, renderH, zoom } = state;

  const effectiveZoom =
    zoom === 'fit'
      ? Math.min(
          1,
          (containerSize.w - FRAME_PADDING * 2) / renderW,
          (containerSize.h - FRAME_PADDING * 2) / renderH,
        )
      : zoom;

  // Avoid 0/NaN before first measure
  const safeZoom = Number.isFinite(effectiveZoom) && effectiveZoom > 0 ? effectiveZoom : 1;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-900"
    >
      <div
        style={{
          width: renderW * safeZoom,
          height: renderH * safeZoom,
        }}
        className="relative"
      >
        <div
          style={{
            width: renderW,
            height: renderH,
            transform: `scale(${safeZoom})`,
            transformOrigin: 'top left',
          }}
          className="overflow-hidden rounded-[20px] border border-zinc-700/70 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/40"
        >
          <PrototypeIframe touch={state.touch} />
        </div>
      </div>
      <ZoomBadge zoom={safeZoom} renderW={renderW} renderH={renderH} />
    </div>
  );
}

function PrototypeIframe({ touch }: { touch: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Push touch state into the iframe whenever it changes (or on load).
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe || !loaded) return;
    iframe.contentWindow?.postMessage(
      { type: 'mockingbird:touch', enabled: touch },
      window.location.origin,
    );
  }, [touch, loaded]);

  return (
    <iframe
      ref={ref}
      src="/app"
      title="Prototype"
      className="block h-full w-full border-0 bg-white"
      onLoad={() => setLoaded(true)}
    />
  );
}

function ZoomBadge({
  zoom,
  renderW,
  renderH,
}: {
  zoom: number;
  renderW: number;
  renderH: number;
}) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950/80 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-300 backdrop-blur">
      {renderW} × {renderH} · {Math.round(zoom * 100)}%
    </div>
  );
}
