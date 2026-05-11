import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ViewerState } from './useViewerState';
import { DeviceChrome } from './DeviceChrome';
import { chromeOuterSize, type ChromeKind } from './chrome';

type Props = {
  state: ViewerState;
};

const FRAME_PADDING = 40;

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

  const { renderW, renderH, zoom, rot } = state;
  const chromeKind: ChromeKind = state.device?.chrome ?? 'none';
  const rotated = rot === 1;

  const { w: outerW, h: outerH } = chromeOuterSize(chromeKind, renderW, renderH, rotated);

  const effectiveZoom =
    zoom === 'fit'
      ? Math.min(
          1,
          (containerSize.w - FRAME_PADDING * 2) / outerW,
          (containerSize.h - FRAME_PADDING * 2) / outerH,
        )
      : zoom;

  const safeZoom = Number.isFinite(effectiveZoom) && effectiveZoom > 0 ? effectiveZoom : 1;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-900"
    >
      <div
        style={{
          width: outerW * safeZoom,
          height: outerH * safeZoom,
        }}
        className="relative"
      >
        <div
          style={{
            width: outerW,
            height: outerH,
            transform: `scale(${safeZoom})`,
            transformOrigin: 'top left',
          }}
        >
          <DeviceChrome
            kind={chromeKind}
            rotated={rotated}
            viewportW={renderW}
            viewportH={renderH}
          >
            <PrototypeIframe touch={state.touch} />
          </DeviceChrome>
        </div>
      </div>
      <ZoomBadge zoom={safeZoom} renderW={renderW} renderH={renderH} />
    </div>
  );
}

function PrototypeIframe({ touch }: { touch: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

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
