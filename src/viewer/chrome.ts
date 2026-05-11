// Visual chrome (bezels + decorations) drawn around each device's viewport.
// Specs are authored in portrait orientation and transposed when rotated.

export type ChromeKind =
  | 'iphone-island'   // iPhone 14 Pro+ — dynamic island
  | 'iphone-classic'  // iPhone SE — thick top/bottom bezels, home button
  | 'pixel-punch'     // Pixel — centered hole-punch camera
  | 'tablet'          // iPad — uniform bezel, camera dot
  | 'desktop'         // macOS-style window with traffic-light titlebar
  | 'none';

export type ChromePadding = { top: number; right: number; bottom: number; left: number };

export type ChromeSpec = {
  pad: ChromePadding;
  outerRadius: number;
  innerRadius: number;
};

const SPECS: Record<ChromeKind, ChromeSpec> = {
  'iphone-island':  { pad: { top: 14, right: 14, bottom: 14, left: 14 }, outerRadius: 56, innerRadius: 42 },
  'iphone-classic': { pad: { top: 78, right: 12, bottom: 100, left: 12 }, outerRadius: 40, innerRadius: 4 },
  'pixel-punch':    { pad: { top: 13, right: 12, bottom: 14, left: 12 }, outerRadius: 46, innerRadius: 34 },
  'tablet':         { pad: { top: 26, right: 26, bottom: 26, left: 26 }, outerRadius: 38, innerRadius: 12 },
  'desktop':        { pad: { top: 30, right: 0,  bottom: 0,  left: 0  }, outerRadius: 10, innerRadius: 0 },
  'none':           { pad: { top: 0,  right: 0,  bottom: 0,  left: 0  }, outerRadius: 0,  innerRadius: 0 },
};

// 90° CW rotation of a padding rect: top←left, right←top, bottom←right, left←bottom.
function rotatePad(p: ChromePadding): ChromePadding {
  return { top: p.left, right: p.top, bottom: p.right, left: p.bottom };
}

export function getChromeSpec(kind: ChromeKind, rotated: boolean): ChromeSpec {
  const s = SPECS[kind];
  return rotated ? { ...s, pad: rotatePad(s.pad) } : s;
}

export function chromeOuterSize(
  kind: ChromeKind,
  viewportW: number,
  viewportH: number,
  rotated: boolean,
): { w: number; h: number } {
  const { pad } = getChromeSpec(kind, rotated);
  return { w: viewportW + pad.left + pad.right, h: viewportH + pad.top + pad.bottom };
}
