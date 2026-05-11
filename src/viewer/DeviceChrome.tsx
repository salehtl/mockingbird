import type { CSSProperties, ReactNode } from 'react';
import { type ChromeKind, getChromeSpec } from './chrome';

type Props = {
  kind: ChromeKind;
  rotated: boolean;
  viewportW: number;
  viewportH: number;
  children: ReactNode;
};

export function DeviceChrome({ kind, rotated, viewportW, viewportH, children }: Props) {
  const { pad, outerRadius, innerRadius } = getChromeSpec(kind, rotated);

  const outerStyle: CSSProperties = {
    paddingTop: pad.top,
    paddingRight: pad.right,
    paddingBottom: pad.bottom,
    paddingLeft: pad.left,
    borderRadius: outerRadius,
  };

  const innerStyle: CSSProperties = {
    width: viewportW,
    height: viewportH,
    borderRadius: innerRadius,
  };

  return (
    <div
      className={outerClass(kind)}
      style={outerStyle}
    >
      <div className="relative overflow-hidden bg-white" style={innerStyle}>
        {children}
        <ScreenOverlay kind={kind} rotated={rotated} w={viewportW} h={viewportH} />
      </div>
      <BezelDecorations kind={kind} rotated={rotated} viewportW={viewportW} viewportH={viewportH} pad={pad} />
    </div>
  );
}

function outerClass(kind: ChromeKind): string {
  switch (kind) {
    case 'desktop':
      return 'relative bg-zinc-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/20';
    case 'none':
      return 'relative';
    default:
      // Phone/tablet body — dark, glossy bezel
      return 'relative bg-zinc-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/40';
  }
}

/* -------------------------------------------------------------------------- */
/*  Overlays painted ON TOP of the viewport (island, hole punch).            */
/* -------------------------------------------------------------------------- */

function ScreenOverlay({
  kind,
  rotated,
  w,
  h,
}: {
  kind: ChromeKind;
  rotated: boolean;
  w: number;
  h: number;
}) {
  if (kind === 'iphone-island') {
    const longSide = 122;
    const shortSide = 36;
    const inset = 10;
    const style: CSSProperties = rotated
      ? {
          right: inset,
          top: (h - longSide) / 2,
          width: shortSide,
          height: longSide,
        }
      : {
          top: inset,
          left: (w - longSide) / 2,
          width: longSide,
          height: shortSide,
        };
    return (
      <div
        className="pointer-events-none absolute rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
        style={style}
      />
    );
  }

  if (kind === 'pixel-punch') {
    const size = 14;
    const inset = 10;
    const style: CSSProperties = rotated
      ? { right: inset, top: h / 2 - size / 2, width: size, height: size }
      : { top: inset, left: w / 2 - size / 2, width: size, height: size };
    return (
      <div
        className="pointer-events-none absolute rounded-full bg-black ring-1 ring-zinc-700/60"
        style={style}
      />
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Decorations on the bezel itself (speaker, home button, traffic lights).  */
/* -------------------------------------------------------------------------- */

function BezelDecorations({
  kind,
  rotated,
  viewportW,
  viewportH,
  pad,
}: {
  kind: ChromeKind;
  rotated: boolean;
  viewportW: number;
  viewportH: number;
  pad: { top: number; right: number; bottom: number; left: number };
}) {
  if (kind === 'iphone-classic') {
    return (
      <IphoneClassicBezels
        rotated={rotated}
        viewportW={viewportW}
        viewportH={viewportH}
        pad={pad}
      />
    );
  }
  if (kind === 'tablet') {
    return (
      <TabletCamera rotated={rotated} viewportW={viewportW} viewportH={viewportH} pad={pad} />
    );
  }
  if (kind === 'desktop') {
    return <DesktopTitlebar pad={pad} viewportW={viewportW} />;
  }
  return null;
}

function IphoneClassicBezels({
  rotated,
  viewportW,
  viewportH,
  pad,
}: {
  rotated: boolean;
  viewportW: number;
  viewportH: number;
  pad: { top: number; right: number; bottom: number; left: number };
}) {
  const outerW = viewportW + pad.left + pad.right;
  const outerH = viewportH + pad.top + pad.bottom;

  // Speaker grill (pill) + camera dot live on the "forehead" (orig top).
  // Home button lives on the "chin" (orig bottom).
  // In portrait: forehead=top, chin=bottom. Rotated 90° CW: forehead=right, chin=left.
  const foreheadCenter = rotated
    ? { top: outerH / 2, right: pad.right / 2 } // right side
    : { left: outerW / 2, top: pad.top / 2 }; // top side

  const chinCenter = rotated
    ? { top: outerH / 2, left: pad.left / 2 } // left side
    : { left: outerW / 2, top: outerH - pad.bottom / 2 }; // bottom side

  return (
    <>
      {/* Speaker grill */}
      <div
        className="pointer-events-none absolute rounded-full bg-zinc-800/90 ring-1 ring-zinc-700/50"
        style={{
          width: rotated ? 6 : 54,
          height: rotated ? 54 : 6,
          transform: 'translate(-50%, -50%)',
          ...foreheadCenter,
        }}
      />
      {/* Camera dot, offset from speaker */}
      <div
        className="pointer-events-none absolute rounded-full bg-zinc-800"
        style={{
          width: 6,
          height: 6,
          transform: 'translate(-50%, -50%)',
          ...(rotated
            ? { top: outerH / 2 - 40, right: pad.right / 2 }
            : { left: outerW / 2 - 40, top: pad.top / 2 }),
        }}
      />
      {/* Home button */}
      <div
        className="pointer-events-none absolute rounded-full border border-zinc-700/70 bg-zinc-900"
        style={{
          width: 46,
          height: 46,
          transform: 'translate(-50%, -50%)',
          ...chinCenter,
        }}
      >
        <div className="absolute inset-[14px] rounded-[6px] border border-zinc-700/80" />
      </div>
    </>
  );
}

function TabletCamera({
  rotated,
  viewportW,
  viewportH,
  pad,
}: {
  rotated: boolean;
  viewportW: number;
  viewportH: number;
  pad: { top: number; right: number; bottom: number; left: number };
}) {
  const outerW = viewportW + pad.left + pad.right;
  const outerH = viewportH + pad.top + pad.bottom;
  const style: CSSProperties = rotated
    ? { top: outerH / 2, right: pad.right / 2, transform: 'translate(50%, -50%)' }
    : { left: outerW / 2, top: pad.top / 2, transform: 'translate(-50%, -50%)' };
  return (
    <div
      className="pointer-events-none absolute rounded-full bg-zinc-800 ring-1 ring-zinc-700/60"
      style={{ width: 7, height: 7, ...style }}
    />
  );
}

function DesktopTitlebar({ pad, viewportW }: { pad: { top: number }; viewportW: number }) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 px-4"
      style={{ height: pad.top, width: viewportW }}
    >
      <span className="size-3 rounded-full bg-[#ff5f56] ring-1 ring-black/10" />
      <span className="size-3 rounded-full bg-[#ffbd2e] ring-1 ring-black/10" />
      <span className="size-3 rounded-full bg-[#27c93f] ring-1 ring-black/10" />
      <div className="ml-3 hidden h-5 flex-1 max-w-[420px] rounded-md border border-zinc-300 bg-white text-[11px] sm:flex items-center px-2 text-zinc-500">
        <span className="size-1.5 rounded-full bg-zinc-300 mr-2" />
        localhost / app
      </div>
    </div>
  );
}
