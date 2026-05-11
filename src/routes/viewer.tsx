import { DeviceFrame } from '../viewer/DeviceFrame';
import { Toolbar } from '../viewer/Toolbar';
import { useViewerState } from '../viewer/useViewerState';
import { useViewerShortcuts } from '../viewer/shortcuts';
import { defaultDevice, findDevice } from '../viewer/devices';

export type ViewerSearch = {
  device: string;
  w: number;
  h: number;
  zoom: number | 'fit';
  rot: 0 | 1;
  touch: 0 | 1 | 'auto';
};

export function viewerSearchSchema(raw: Record<string, unknown>): ViewerSearch {
  const deviceRaw = typeof raw.device === 'string' ? raw.device : defaultDevice.id;
  const known = findDevice(deviceRaw);
  const device = deviceRaw === 'custom' || known ? deviceRaw : defaultDevice.id;

  const fallbackW = known?.w ?? defaultDevice.w;
  const fallbackH = known?.h ?? defaultDevice.h;
  const w = clampInt(raw.w, 50, 4000, fallbackW);
  const h = clampInt(raw.h, 50, 4000, fallbackH);

  const zoom: number | 'fit' =
    raw.zoom === 'fit' || raw.zoom === undefined
      ? 'fit'
      : clampNumber(raw.zoom, 0.1, 4, 1);

  const rot: 0 | 1 = raw.rot === 1 || raw.rot === '1' ? 1 : 0;

  const touch: 0 | 1 | 'auto' =
    raw.touch === 1 || raw.touch === '1'
      ? 1
      : raw.touch === 0 || raw.touch === '0'
        ? 0
        : 'auto';

  return { device, w, h, zoom, rot, touch };
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(Math.max(n, min), max));
}

function clampNumber(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export function ViewerPage() {
  const { state, setDevice, setSize, rotate, setZoom, setTouch, cycleDevice } = useViewerState();

  useViewerShortcuts({
    rotate,
    cycleDevice,
    setZoom,
    toggleTouch: () => setTouch(!state.touch),
    currentZoom: state.zoom,
  });

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <Toolbar
        state={state}
        setDevice={setDevice}
        setSize={setSize}
        rotate={rotate}
        setZoom={setZoom}
        setTouch={setTouch}
      />
      <div className="min-h-0 flex-1">
        <DeviceFrame state={state} />
      </div>
    </div>
  );
}
